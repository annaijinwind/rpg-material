import type { Asset, AssetFamily } from '../data/types'
import type { StyleConfig } from './templates'
import { applySuperseded, fragmentConflicts, resolveFragments } from './fragments'

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

/**
 * 这个素材生成出来是要「抠成透明 PNG」的，还是「铺满整格」的？
 *
 * 判据是「它在游戏里怎么用」，不是它属于哪个家族：
 *   建筑 / 装饰 / 水面小件 → 叠在地图上，必须抠
 *   墙体 / 围墙 / 栅栏      → 也要抠，墙外的地面得透出来
 *   地面 / 道路 / 水面 tile → **不能抠**，它们要铺满整格；抠出透明反而拼不上
 *
 * 背景要求和负面词都按这个分。
 */
export function isIsolated(asset: Asset): boolean {
  if (asset.family !== 'terrain') return true
  if (asset.category === 'Boundary') return true
  if (asset.tileable === false) return true
  return false
}

/** 该素材用哪套模板。边界单独一份，因为它既要拼接又要白底。 */
function templateFor(asset: Asset, style: StyleConfig): string {
  if (asset.family === 'building') return style.templates.building
  if (asset.family === 'decoration') return style.templates.decoration
  if (asset.category === 'Boundary') return style.templates.boundary
  return asset.tileable === false ? style.templates.terrainObject : style.templates.terrain
}

/** 取该素材适用的负面词。 */
function negativeFor(asset: Asset, style: StyleConfig): string {
  return isIsolated(asset) ? style.negative.isolated : style.negative.tile
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

/**
 * 这里原本有一条「提示词偏长」的警告，阈值 190 词。
 * 但提示词的固定骨架（视角 + 风格块 + 背景 + 收尾）就有 260 词以上，
 * 85 条里有 68 条在报警——误报太多的警告等于没有警告，所以删掉。
 * 真要看长度，PromptBox 上已经显示了词数。
 */

export function buildPrompt(asset: Asset, style: StyleConfig): BuiltPrompt {
  // 勾选的构件：多选组追加，单选组先剔掉同组旧词再追加（替换语义），规模替换 size
  const picked = resolveFragments(asset.extraFragments)
  const effective: Asset = asset.extraFragments?.length
    ? {
        ...asset,
        features: [...applySuperseded(asset.features, picked.superseded), ...picked.features],
        details: [...applySuperseded(asset.details, picked.superseded), ...picked.details],
        size: picked.size ?? asset.size,
      }
    : asset

  const negative = negativeFor(effective, style)
  const vars = varsFor(effective, style, style.appendNegativeInline ? negative : '')
  const positive = fillTemplate(templateFor(effective, style), vars)

  const parts = partsFor(effective, style, negative)
  const combined = negative ? `${positive}\n\n${negative}` : positive
  const wordCount = (style.appendNegativeInline ? combined : positive).split(/\s+/).filter(Boolean).length

  const warnings: string[] = []
  if (!effective.en.trim()) warnings.push('缺少英文名，提示词主体为空')
  if (effective.family === 'building' && !effective.size) {
    warnings.push('缺少建筑尺寸，BUILDING_SIZE 为空')
  }
  if (!effective.features?.length) warnings.push('缺少特征关键词，提示词会偏空泛')
  if (/\{\{\w+\}\}/.test(positive)) warnings.push('模板里有未识别的占位符，请到风格设置里检查')

  // 构件库改过之后，存档里可能留下已经不存在的 id
  if (picked.unknown.length) {
    warnings.push(`有 ${picked.unknown.length} 个勾选的构件已经不在构件库里了，请重新勾选`)
  }
  for (const conflict of fragmentConflicts(effective, asset.extraFragments)) {
    warnings.push(conflict)
  }

  // 这条路很容易踩：这是要铺满整格的 tile，一旦要求白底/透明，出来的图就没法拼图了。
  if (!isIsolated(effective) && /white background|transparent/i.test(positive)) {
    warnings.push(
      '这是要铺满整格的地形贴图，提示词里出现了「白底 / 透明」——白底的砖拼不成地图，请去掉',
    )
  }

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
