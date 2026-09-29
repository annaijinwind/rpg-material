import type { Asset, AssetFamily } from '../data/types'
import type { StyleConfig } from './templates'

/**
 * 提示词引擎。纯函数，不读模块级可变状态，方便在列表里对上百条素材直接重算。
 *
 * 输出分三份：
 *   positive — 正面提示词，粘进 Krea 的提示词框
 *   negative — 负面提示词，粘进 Krea 的负面框（Krea 2 是独立输入框）
 *   combined — 只有一个输入框时用的合并版
 * positive 是否已包含负面词，由 style.appendNegativeInline 决定。
 */
export interface BuiltPrompt {
  assetId: string
  positive: string
  negative: string
  combined: string
  /** 把各个可变量拆开显示，方便看清楚这一串是怎么拼出来的，也可以单独复制。 */
  parts: PromptPart[]
  wordCount: number
  warnings: string[]
}

export interface PromptPart {
  key: string
  label: string
  value: string
}

/** 关键词列表 → 「a, b, c.」建筑模板里的 FEATURES / DETAILS 是这种逗号串。 */
export function joinKeywords(items: string[] | undefined): string {
  if (!items?.length) return ''
  const body = items.map((s) => s.trim().replace(/[.,;]+$/, '')).filter(Boolean).join(', ')
  return body ? `${body}.` : ''
}

/** 整句列表 → 「A. B.」地形与装饰的描述是完整句子，用句号连，避免逗号串成一坨。 */
export function joinSentences(items: string[] | undefined): string {
  if (!items?.length) return ''
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`))
    .join(' ')
}

/**
 * 填充模板。未用到的占位符留下一整行空白时要顺手收掉，
 * 否则可选字段（比如没有 aesthetic 的草地）会在提示词里留出空段落。
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  const filled = template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
  return filled
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 取该素材适用的负面词。 */
function negativeFor(asset: Asset, style: StyleConfig): string {
  return style.negative[asset.family] ?? style.negative.building
}

function templateFor(asset: Asset, style: StyleConfig): string {
  if (asset.family === 'building') return style.templates.building
  if (asset.family === 'decoration') return style.templates.decoration
  return asset.tileable === false ? style.templates.terrainObject : style.templates.terrain
}

/** 组装该素材的模板变量表。没被模板引用的变量留着也无害。 */
function varsFor(asset: Asset, style: StyleConfig, negative: string): Record<string, string> {
  const features = asset.family === 'building'
    ? joinKeywords(asset.features)
    : joinSentences(asset.features)

  return {
    CAMERA: style.cameraClause,
    STYLE_BLOCK: style.styleBlock,
    NEGATIVE: negative,

    BUILDING_TYPE: asset.en,
    BUILDING_SIZE: asset.size ?? '',
    BUILDING_FEATURES: features,
    ARCHITECTURAL_DETAILS: joinKeywords(asset.details),

    // 地形与装饰复用同一份主体句，模板按家族各取所需。
    TERRAIN_SUBJECT: asset.en,
    TERRAIN_DESCRIPTION: features,
    TERRAIN_AESTHETIC: asset.aesthetic ?? '',
    OBJECT_TYPE: asset.en,
    OBJECT_DESCRIPTION: features,
  }
}

/** 可变量拆解，供详情面板分块展示。只列出该家族真正有值的部分。 */
function partsFor(asset: Asset, style: StyleConfig, negative: string): PromptPart[] {
  const vars = varsFor(asset, style, negative)
  const common: PromptPart[] = [{ key: 'camera', label: '视角约束', value: vars.CAMERA }]

  if (asset.family === 'building') {
    return [
      ...common,
      { key: 'style', label: '统一风格', value: vars.STYLE_BLOCK },
      { key: 'subject', label: '建筑类型', value: vars.BUILDING_TYPE },
      { key: 'size', label: '建筑尺寸', value: vars.BUILDING_SIZE },
      { key: 'features', label: '建筑特征', value: vars.BUILDING_FEATURES },
      { key: 'details', label: '建筑细节', value: vars.ARCHITECTURAL_DETAILS },
    ].filter((p) => p.value)
  }

  if (asset.family === 'terrain') {
    return [
      ...common,
      { key: 'subject', label: '地形主体', value: vars.TERRAIN_SUBJECT },
      { key: 'description', label: '材质形态', value: vars.TERRAIN_DESCRIPTION },
      { key: 'aesthetic', label: '质感审美', value: vars.TERRAIN_AESTHETIC },
    ].filter((p) => p.value)
  }

  return [
    ...common,
    { key: 'subject', label: '装饰主体', value: vars.OBJECT_TYPE },
    { key: 'description', label: '外观描述', value: vars.OBJECT_DESCRIPTION },
  ].filter((p) => p.value)
}

/** 超过这个词数就提醒一句：提示词太长会稀释重点。 */
const WORD_COUNT_SOFT_LIMIT = 190

export function buildPrompt(asset: Asset, style: StyleConfig): BuiltPrompt {
  const negative = negativeFor(asset, style)
  const vars = varsFor(asset, style, style.appendNegativeInline ? negative : '')
  const positive = fillTemplate(templateFor(asset, style), vars)

  const parts = partsFor(asset, style, negative)
  const combined = negative ? `${positive}\n\n${negative}` : positive
  const wordCount = (style.appendNegativeInline ? combined : positive).split(/\s+/).filter(Boolean).length

  const warnings: string[] = []
  if (!asset.en.trim()) warnings.push('缺少英文名，提示词主体为空')
  if (asset.family === 'building' && !asset.size) warnings.push('缺少建筑尺寸，BUILDING_SIZE 为空')
  if (!asset.features?.length) warnings.push('缺少特征关键词，提示词会偏空泛')
  if (wordCount > WORD_COUNT_SOFT_LIMIT) {
    warnings.push(`提示词偏长（${wordCount} 词），关键词太多时 Krea 容易抓不住重点`)
  }
  if (/\{\{\w+\}\}/.test(positive)) warnings.push('模板里有未识别的占位符，请到风格设置里检查')

  return { assetId: asset.id, positive, negative, combined, parts, wordCount, warnings }
}

/** 家族 → 该素材该用哪套模板，用于 UI 上标注。 */
export function templateNameFor(asset: Asset): string {
  const names: Record<AssetFamily, string> = {
    building: '建筑模板',
    terrain: asset.tileable === false ? '地形模板（独立件）' : '地形模板',
    decoration: '装饰模板',
  }
  return names[asset.family]
}
