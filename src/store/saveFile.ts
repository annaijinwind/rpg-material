import { ASSET_BY_ID, CATALOG_VERSION } from '../data/assets'
import { buildDefaultStyleConfig, mergeStyle, type StyleConfig } from '../prompt/templates'
import type { AssetPatch } from './useAppStore'

/**
 * 存档文件。
 *
 * 设计目标是「能长期躺在 git 里」：
 *   - 有 formatVersion，以后改结构能识别老文件并迁移
 *   - 序列化时按 assetId 排序，每个素材在文件里的位置固定
 *     → git diff 干净，而且两台机器改了不同素材时能自动合并
 *   - 只存文本，几百 KB，不进图片本体
 */

/** 存档结构版本。改动结构时 +1，并在 parseSaveFile 里加迁移。 */
export const SAVE_FORMAT_VERSION = 1

/**
 * 存档里的风格配置。
 *
 * 刻意不写 `version`——它只是 buildPrompt 的记忆化计数器，每次保存都会 +1，
 * 存进文件只会让 git diff 凭空多出一行噪音，往返一次就变一次。
 * 导入时由本地自己重新起算。
 */
export type SavedStyle = Omit<StyleConfig, 'version'>

export interface SaveFile {
  /** 存档结构版本，与本文件的解析逻辑对应。 */
  formatVersion: number
  /** 生成存档时的素材目录版本，用于提示「目录已更新」。 */
  catalogVersion: number
  app: 'rpg-material'
  exportedAt: string
  patchCount: number
  patches: Record<string, AssetPatch>
  style: SavedStyle
}

/** 补丁里字段的固定顺序。顺序固定 = diff 稳定。 */
const PATCH_KEYS = ['status', 'note', 'positiveOverride', 'fields', 'images'] as const
const FIELD_KEYS = ['zh', 'en', 'size', 'features', 'details', 'aesthetic'] as const

function canonicalFields(fields: NonNullable<AssetPatch['fields']>): NonNullable<AssetPatch['fields']> {
  const out: Record<string, unknown> = {}
  for (const key of FIELD_KEYS) {
    const value = fields[key]
    if (value !== undefined) out[key] = value
  }
  return out as NonNullable<AssetPatch['fields']>
}

/** 按固定字段顺序重建补丁，让同一份数据每次序列化出来都完全一样。 */
function canonicalPatch(patch: AssetPatch): AssetPatch {
  const out: Record<string, unknown> = {}
  for (const key of PATCH_KEYS) {
    const value = patch[key]
    if (value === undefined) continue
    if (key === 'fields') out[key] = canonicalFields(value as NonNullable<AssetPatch['fields']>)
    else out[key] = value
  }
  // updatedAt 放最后。它是唯一会「无意义地变」的字段，放在末尾能让 diff 更干净
  if (patch.updatedAt) out.updatedAt = patch.updatedAt
  return out as AssetPatch
}

export function buildSaveFile(
  patches: Record<string, AssetPatch>,
  style: StyleConfig,
): SaveFile {
  const sorted: Record<string, AssetPatch> = {}
  for (const id of Object.keys(patches).sort()) sorted[id] = canonicalPatch(patches[id]!)

  return {
    formatVersion: SAVE_FORMAT_VERSION,
    catalogVersion: CATALOG_VERSION,
    app: 'rpg-material',
    exportedAt: new Date().toISOString(),
    patchCount: Object.keys(sorted).length,
    patches: sorted,
    style: toSavedStyle(style),
  }
}

/** 末尾补一个换行，git 不会报 "No newline at end of file"。 */
export function serializeSaveFile(save: SaveFile): string {
  return `${JSON.stringify(save, null, 2)}\n`
}

/** 文件名带上日期、时间和条目数，避免下重复名字，也方便一眼看出新旧。 */
export function saveFileName(save: SaveFile): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
  return `rpg-material-存档-${stamp}-${save.patchCount}项.json`
}

export type ParseResult =
  | { ok: true; save: SaveFile; legacy: boolean }
  | { ok: false; message: string }

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** 写进存档前把 version 摘掉。 */
function toSavedStyle(style: StyleConfig): SavedStyle {
  const { version: _version, ...rest } = style
  return rest
}

/** 一个 key 看起来像 AssetPatch 吗？用于识别旧版「裸 patches」存档。 */
function looksLikePatch(v: unknown): boolean {
  if (!isPlainObject(v)) return false
  return (
    'status' in v || 'note' in v || 'positiveOverride' in v || 'fields' in v || 'images' in v
  )
}

/**
 * 解析存档。拒绝不合格式的文件——不然误选一个 JSON 就可能把人家写坏。
 * 兼容早期的「裸 patches」格式（那一版没有外层包装）。
 */
export function parseSaveFile(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, message: '这个文件不是有效的 JSON' }
  }
  if (!isPlainObject(raw)) {
    return { ok: false, message: '这个文件的内容不是一个 JSON 对象' }
  }

  const { patches, style, formatVersion } = raw as {
    patches?: unknown
    style?: unknown
    formatVersion?: unknown
  }

  if (patches === undefined) {
    // 旧格式：整个文件就是一张 patches 表
    const entries = Object.entries(raw)
    if (entries.length && entries.every(([, v]) => looksLikePatch(v))) {
      return {
        ok: true,
        legacy: true,
        save: {
          formatVersion: 0,
          catalogVersion: 0,
          app: 'rpg-material',
          exportedAt: '',
          patchCount: entries.length,
          patches: raw as Record<string, AssetPatch>,
          style: toSavedStyle(buildDefaultStyleConfig()),
        },
      }
    }
    return { ok: false, message: '里面没有 patches 字段，看着不像这个工具的存档' }
  }

  if (!isPlainObject(patches)) {
    return { ok: false, message: 'patches 字段的格式不对' }
  }
  if (typeof formatVersion === 'number' && formatVersion > SAVE_FORMAT_VERSION) {
    return {
      ok: false,
      message: `这个存档是更新版本（v${formatVersion}）导出的，当前页面只认到 v${SAVE_FORMAT_VERSION}，请先更新页面`,
    }
  }

  return {
    ok: true,
    legacy: false,
    save: {
      formatVersion: typeof formatVersion === 'number' ? formatVersion : 0,
      catalogVersion: typeof raw.catalogVersion === 'number' ? raw.catalogVersion : 0,
      app: 'rpg-material',
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
      patchCount: Object.keys(patches).length,
      patches: patches as Record<string, AssetPatch>,
      // 存档里的风格配置来自「用户随手选的一个文件」，属于不可信输入，
      // 走 mergeStyle 逐字段校验类型，缺的、类型不对的都用默认值补
      style: toSavedStyle(mergeStyle(style)),
    },
  }
}

/** 过滤掉当前目录里不存在的 id。返回保留的补丁和被丢掉的数量。 */
export function pruneToCatalog(patches: Record<string, AssetPatch>): {
  kept: Record<string, AssetPatch>
  dropped: number
} {
  const kept: Record<string, AssetPatch> = {}
  let dropped = 0
  for (const [id, patch] of Object.entries(patches)) {
    if (ASSET_BY_ID.has(id)) kept[id] = patch
    else dropped++
  }
  return { kept, dropped }
}
