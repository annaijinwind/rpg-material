import { useMemo } from 'react'
import { ASSETS } from '../data/assets'
import { categoryLabel, type Asset, type AssetStatus } from '../data/types'
import { buildPrompt, type BuiltPrompt } from '../prompt/buildPrompt'
import type { StyleConfig } from '../prompt/templates'
import type { AssetPatch, Query } from './useAppStore'
import { useAppStore } from './useAppStore'

/** seed 数据 ⊕ 用户覆盖，得到该素材当前实际使用的样子。 */
export function resolveAsset(seed: Asset, patch?: AssetPatch): Asset {
  if (!patch) return seed
  return {
    ...seed,
    ...patch.fields,
    // 勾选的构件：patch 里没动过就沿用素材自带的（自定义建筑会带）
    extraFragments: patch.extraFragments ?? seed.extraFragments,
  }
}

/**
 * 完整的素材表：种子目录 ∪ 用户自建建筑，各自再叠加本地修改。
 *
 * 这是全应用唯一该用来取素材的地方。直接 import ASSETS 会漏掉自定义建筑
 * ——之前批量导出就踩过这个坑。
 */
export function useEffectiveAssets(): Asset[] {
  const patches = useAppStore((s) => s.patches)
  const customAssets = useAppStore((s) => s.customAssets)
  return useMemo(
    () => [...ASSETS, ...customAssets].map((a) => resolveAsset(a, patches[a.id])),
    [patches, customAssets],
  )
}

export function useAssetById(id: string | null): Asset | null {
  const assets = useEffectiveAssets()
  if (!id) return null
  return assets.find((a) => a.id === id) ?? null
}

export function useStatusOf(): (id: string) => AssetStatus {
  const patches = useAppStore((s) => s.patches)
  return (id) => patches[id]?.status ?? 'todo'
}

// ── 搜索 ──────────────────────────────────────────────────────

/**
 * 打分而不是简单布尔过滤：中文名精确命中要排在「细节里恰好出现过这个词」前面。
 * 素材量级在三位数，每次按键全量扫一遍是微秒级，不需要索引库。
 */
function scoreToken(asset: Asset, token: string): number {
  const zh = asset.zh.toLowerCase()
  const en = asset.en.toLowerCase()
  const id = asset.id.toLowerCase()
  const category = asset.category.toLowerCase()

  if (zh === token) return 120
  if (zh.startsWith(token)) return 100
  if (zh.includes(token)) return 80

  for (const tag of asset.tags) {
    const t = tag.toLowerCase()
    if (t === token) return 90
  }
  for (const tag of asset.tags) {
    if (tag.toLowerCase().includes(token)) return 60
  }

  if (en.includes(token)) return 50
  if (id.includes(token)) return 45
  // 分类中英文都认：界面显示「道路」，但习惯打 road 的也能搜到
  if (category.includes(token)) return 40
  if (categoryLabel(asset.category).includes(token)) return 40

  const body = [
    ...(asset.features ?? []),
    ...(asset.details ?? []),
    asset.aesthetic ?? '',
  ]
    .join(' ')
    .toLowerCase()
  if (body.includes(token)) return 20

  return 0
}

/** 空格分词后按 AND 匹配：每个词都得命中，得分累加。 */
export function matchAsset(asset: Asset, text: string): number {
  const tokens = text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return 1
  let total = 0
  for (const token of tokens) {
    const score = scoreToken(asset, token)
    if (score === 0) return 0
    total += score
  }
  return total
}

export function filterAssets(
  assets: Asset[],
  query: Query,
  statusOf: (id: string) => AssetStatus,
): Asset[] {
  const scored: Array<{ asset: Asset; score: number }> = []
  for (const asset of assets) {
    if (query.families.length && !query.families.includes(asset.family)) continue
    if (query.categories.length && !query.categories.includes(asset.category)) continue
    if (query.phases.length && (asset.phase === undefined || !query.phases.includes(asset.phase))) {
      continue
    }
    if (query.statuses.length && !query.statuses.includes(statusOf(asset.id))) continue

    const score = matchAsset(asset, query.text)
    if (score === 0) continue
    scored.push({ asset, score })
  }

  // 有关键词时按相关度排；没有关键词就保持目录原有顺序，方便按规划顺序逐个做。
  if (query.text.trim()) scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.asset)
}

export function useFilteredAssets(): Asset[] {
  const assets = useEffectiveAssets()
  const query = useAppStore((s) => s.query)
  const patches = useAppStore((s) => s.patches)
  return useMemo(() => {
    const statusOf = (id: string) => patches[id]?.status ?? 'todo'
    return filterAssets(assets, query, statusOf)
  }, [assets, query, patches])
}

// ── 统计 ──────────────────────────────────────────────────────

export interface Stats {
  total: number
  byStatus: Record<AssetStatus, number>
  byCategory: Record<string, { total: number; done: number }>
  byFamily: Record<string, { total: number; done: number }>
}

/** done 定义为「已生成 + 已通过」，这是「这批素材能不能开始拼地图」的口径。 */
export function computeStats(
  assets: Asset[],
  patches: Record<string, AssetPatch>,
): Stats {
  const byStatus: Record<AssetStatus, number> = {
    todo: 0,
    generated: 0,
    approved: 0,
    rejected: 0,
  }
  const byCategory: Stats['byCategory'] = {}
  const byFamily: Stats['byFamily'] = {}

  for (const asset of assets) {
    const status = patches[asset.id]?.status ?? 'todo'
    byStatus[status]++

    const cat = (byCategory[asset.category] ??= { total: 0, done: 0 })
    cat.total++
    const fam = (byFamily[asset.family] ??= { total: 0, done: 0 })
    fam.total++
    if (status === 'generated' || status === 'approved') {
      cat.done++
      fam.done++
    }
  }

  return { total: assets.length, byStatus, byCategory, byFamily }
}

export function useStats(): Stats {
  const assets = useEffectiveAssets()
  const patches = useAppStore((s) => s.patches)
  return useMemo(() => computeStats(assets, patches), [assets, patches])
}

// ── 提示词 ────────────────────────────────────────────────────

/** 批量生成提示词时的原始素材 + 状态，供导出使用。 */
export interface PromptRow {
  asset: Asset
  prompt: BuiltPrompt
  status: AssetStatus
  /** 已填的图片链接，空串已滤掉，第一张是列表缩略图。 */
  images: string[]
}

export function buildRows(
  assets: Asset[],
  patches: Record<string, AssetPatch>,
  style: StyleConfig,
): PromptRow[] {
  return assets.map((seed) => {
    const patch = patches[seed.id]
    // 传进来的可能是 seed 原始数据（批量导出走的就是这条路），
    // 这里再套一次字段覆盖，保证导出的是用户改过之后的版本。
    const asset = resolveAsset(seed, patch)
    const built = buildPrompt(asset, style)
    // 用户改过的提示词优先，这样导出的就是最终要用的那一版。
    const prompt = patch?.positiveOverride
      ? {
          ...built,
          positive: patch.positiveOverride,
          combined: built.negative
            ? `${patch.positiveOverride}\n\n${built.negative}`
            : patch.positiveOverride,
        }
      : built
    return {
      asset,
      prompt,
      status: patch?.status ?? 'todo',
      images: (patch?.images ?? []).filter(Boolean),
    }
  })
}

export function useSelectedRow(): PromptRow | null {
  const assets = useEffectiveAssets()
  const patches = useAppStore((s) => s.patches)
  const style = useAppStore((s) => s.style)
  const selectedId = useAppStore((s) => s.selectedId)

  return useMemo(() => {
    const asset = assets.find((a) => a.id === selectedId)
    if (!asset) return null
    return buildRows([asset], patches, style)[0] ?? null
  }, [assets, patches, style, selectedId])
}
