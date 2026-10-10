import { create } from 'zustand'
import { ASSETS, CATALOG_VERSION, validateCatalog } from '../data/assets'
import type { Asset, AssetFamily, AssetStatus } from '../data/types'
import { buildDefaultStyleConfig, mergeStyle, type StyleConfig } from '../prompt/templates'
import { KEYS, debounce, loadJson, saveJson } from './persist'
import { pruneToCatalog, type SaveFile } from './saveFile'

if (import.meta.env.DEV) {
  const problems = validateCatalog()
  if (problems.length) console.error('[catalog] 目录数据有问题:\n' + problems.join('\n'))
}

/** 用户对某个素材的本地增量。空字段表示沿用 seed 数据。 */
export interface AssetPatch {
  status?: AssetStatus
  note?: string
  /** 用户编辑过的完整正面提示词。存在时优先于模板生成结果。 */
  positiveOverride?: string
  /** 用户改过的关键词字段，覆盖 seed。 */
  fields?: Partial<Pick<Asset, 'zh' | 'en' | 'size' | 'features' | 'details' | 'aesthetic'>>
  /**
   * 生成好的图片链接，按添加顺序排列，第一张当列表缩略图。
   * 图片本体存在别处（图床 / 网盘 / 自己的服务器），这里只存链接。
   */
  images?: string[]
  updatedAt?: number
}

export interface Query {
  text: string
  /** 空数组表示不限。 */
  families: AssetFamily[]
  categories: string[]
  phases: number[]
  statuses: AssetStatus[]
}

export const EMPTY_QUERY: Query = {
  text: '',
  families: [],
  categories: [],
  phases: [],
  statuses: [],
}

interface PersistedUi {
  query: Query
  selectedId: string | null
  sidebarWidth: number
  /** 上次导出存档的时间，用来算「之后又改了多少项」。 */
  lastExportAt: number
}

interface AppState {
  patches: Record<string, AssetPatch>
  style: StyleConfig
  query: Query
  selectedId: string | null
  sidebarWidth: number
  settingsOpen: boolean
  batchOpen: boolean
  saveOpen: boolean
  catalogVersion: number
  lastExportAt: number

  setQuery: (patch: Partial<Query>) => void
  resetQuery: () => void
  select: (id: string | null) => void
  toggleSettings: (open?: boolean) => void
  toggleBatch: (open?: boolean) => void
  toggleSave: (open?: boolean) => void
  setSidebarWidth: (w: number) => void

  setStatus: (id: string, status: AssetStatus) => void
  cycleStatus: (id: string) => void
  setNote: (id: string, note: string) => void
  setImages: (id: string, images: string[]) => void
  setPositiveOverride: (id: string, text: string | undefined) => void
  /** fields 传 undefined 表示这个素材不再有任何字段覆盖，整个补丁会被清掉。 */
  setFields: (id: string, fields: AssetPatch['fields'] | undefined) => void
  resetAsset: (id: string) => void
  resetAllPatches: () => void

  setStyle: (next: StyleConfig) => void
  resetStyle: () => void

  /** 用存档内容整体替换当前状态。返回接了多少、丢了多少。 */
  applySave: (save: SaveFile) => { accepted: number; dropped: number }
  markExported: () => void
}

/** 状态循环顺序，点一下走一格。 */
const STATUS_CYCLE: AssetStatus[] = ['todo', 'generated', 'approved', 'rejected']

function loadPatches(): Record<string, AssetPatch> {
  const raw = loadJson<Record<string, AssetPatch>>(KEYS.patches, {})
  if (!raw || typeof raw !== 'object') return {}
  // 目录里已经不存在的 id（改过 seed）直接丢掉，否则会攒下一堆看不见的脏补丁。
  const known = new Set(ASSETS.map((a) => a.id))
  const out: Record<string, AssetPatch> = {}
  const orphans: string[] = []
  for (const [id, patch] of Object.entries(raw)) {
    if (known.has(id)) out[id] = patch
    else orphans.push(id)
  }
  if (orphans.length) {
    console.warn(`[store] 丢弃 ${orphans.length} 条已不在目录中的本地修改: ${orphans.join(', ')}`)
  }
  return out
}

function loadStyle(): StyleConfig {
  // mergeStyle 逐字段兜底：以后加字段、或者老数据里有已经删掉的字段，都不会把应用带崩。
  return mergeStyle(loadJson<unknown>(KEYS.style, null))
}

function loadUi(): PersistedUi {
  const fallback: PersistedUi = {
    query: EMPTY_QUERY,
    selectedId: null,
    sidebarWidth: 248,
    lastExportAt: 0,
  }
  const raw = loadJson<Partial<PersistedUi> | null>(KEYS.ui, null)
  if (!raw || typeof raw !== 'object') return fallback
  return {
    query: { ...EMPTY_QUERY, ...(raw.query ?? {}) },
    selectedId: raw.selectedId ?? null,
    sidebarWidth: raw.sidebarWidth ?? fallback.sidebarWidth,
    lastExportAt: raw.lastExportAt ?? 0,
  }
}

const initialUi = loadUi()

export const useAppStore = create<AppState>((set, get) => {
  /** 每次改动都整体落盘。数据量在几百 KB 以内，无需精细优化。 */
  const persistPatches = debounce((patches: Record<string, AssetPatch>) => {
    saveJson(KEYS.patches, patches)
  }, 250)

  const persistUi = debounce((ui: PersistedUi) => {
    saveJson(KEYS.ui, ui)
  }, 250)

  const persistStyle = debounce((style: StyleConfig) => {
    saveJson(KEYS.style, style)
  }, 250)

  /** 只取需要落盘的界面状态，避免把 patches / style 也一并写进 ui 键。 */
  const uiSnapshot = (): PersistedUi => {
    const s = get()
    return {
      query: s.query,
      selectedId: s.selectedId,
      sidebarWidth: s.sidebarWidth,
      lastExportAt: s.lastExportAt,
    }
  }

  /**
   * 改单个素材的补丁。值为 undefined 的字段表示「撤回这项修改」，
   * 补丁整个空了就把 key 删掉，免得 localStorage 里攒一堆空对象。
   */
  const patchAsset = (id: string, next: AssetPatch | null) => {
    const patches = { ...get().patches }
    if (!next) {
      delete patches[id]
    } else {
      const merged: AssetPatch = { ...patches[id] }
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined) delete merged[k as keyof AssetPatch]
        else Object.assign(merged, { [k]: v })
      }
      if (Object.keys(merged).length === 0) delete patches[id]
      else patches[id] = { ...merged, updatedAt: Date.now() }
    }
    set({ patches })
    persistPatches(patches)
  }

  return {
    patches: loadPatches(),
    style: loadStyle(),
    query: initialUi.query,
    selectedId: initialUi.selectedId,
    sidebarWidth: initialUi.sidebarWidth,
    settingsOpen: false,
    batchOpen: false,
    saveOpen: false,
    catalogVersion: CATALOG_VERSION,
    lastExportAt: initialUi.lastExportAt,

    setQuery: (patch) => {
      set({ query: { ...get().query, ...patch } })
      persistUi(uiSnapshot())
    },
    resetQuery: () => {
      set({ query: EMPTY_QUERY })
      persistUi(uiSnapshot())
    },
    select: (id) => {
      set({ selectedId: id })
      persistUi(uiSnapshot())
    },
    toggleSettings: (open) => set({ settingsOpen: open ?? !get().settingsOpen }),
    toggleBatch: (open) => set({ batchOpen: open ?? !get().batchOpen }),
    toggleSave: (open) => set({ saveOpen: open ?? !get().saveOpen }),
    setSidebarWidth: (w) => {
      set({ sidebarWidth: Math.min(420, Math.max(180, w)) })
      persistUi(uiSnapshot())
    },

    setStatus: (id, status) => patchAsset(id, { status }),
    cycleStatus: (id) => {
      const current = get().patches[id]?.status ?? 'todo'
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
      patchAsset(id, { status: next })
    },
    setNote: (id, note) => patchAsset(id, note.trim() ? { note } : { note: undefined }),
    setImages: (id, images) => {
      // 刻意不过滤空串：用户清空输入框是为了重新粘贴，
      // 这时候把整行删掉的话输入框会当场消失。空值留到读取时再滤（见 useAssetImages）。
      const trimmed = images.map((s) => s.trim())
      patchAsset(id, { images: trimmed.length ? trimmed : undefined })
    },
    setPositiveOverride: (id, text) =>
      patchAsset(id, { positiveOverride: text && text.trim() ? text : undefined }),
    setFields: (id, fields) => patchAsset(id, { fields }),
    resetAsset: (id) => patchAsset(id, null),
    resetAllPatches: () => {
      set({ patches: {} })
      persistPatches({})
    },

    applySave: (save) => {
      // 导入即「替换」而不是「合并」：存档文件是权威，
      // 合并语义会在两边来回导时攒下看不见的幽灵数据。
      const { kept, dropped } = pruneToCatalog(save.patches)
      // 补上 updatedAt：老存档里可能没有，后面算「未导出改动数」要用
      const now = Date.now()
      for (const patch of Object.values(kept)) patch.updatedAt ??= now

      set({ patches: kept, style: { ...save.style, version: get().style.version + 1 } })
      persistPatches(kept)
      persistStyle(get().style)
      return { accepted: Object.keys(kept).length, dropped }
    },
    markExported: () => {
      set({ lastExportAt: Date.now() })
      persistUi(uiSnapshot())
    },

    setStyle: (next) => {
      const style = { ...next, version: get().style.version + 1 }
      set({ style })
      persistStyle(style)
    },
    resetStyle: () => {
      const style = buildDefaultStyleConfig()
      set({ style })
      persistStyle(style)
    },

  }
})
