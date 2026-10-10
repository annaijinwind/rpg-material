import type { Asset } from '../types'
import { BUILDINGS } from './buildings'
import { GROUND } from './ground'
import { ROAD } from './road'
import { WATER } from './water'
import { BOUNDARY } from './boundary'
import { NATURE } from './nature'
import { PROPS } from './props'

/**
 * 全部素材。目录数据属于「随代码走」的创作内容，
 * 用户的修改以增量补丁的形式存在 localStorage，不会覆盖这里。
 */
export const ASSETS: Asset[] = [
  ...BUILDINGS,
  ...GROUND,
  ...ROAD,
  ...WATER,
  ...BOUNDARY,
  ...NATURE,
  ...PROPS,
]

/** 目录结构版本。改动 seed 数据时 +1，用于提示本地修改与目录已不同步。 */
export const CATALOG_VERSION = 1

export const ASSET_BY_ID = new Map(ASSETS.map((a) => [a.id, a]))

/**
 * 建议的落地目录，按文档 §24 的目录结构推出来。
 * 图片走链接模式存在别处，所以这张表就是「生成好的图该往哪放」的唯一提示。
 */
export function suggestedPath(asset: Asset): string {
  const name = asset.id.split('.').pop() ?? asset.id
  if (asset.family === 'building') return `02_Buildings/${name}`
  if (asset.family === 'terrain') return `01_Terrain/${asset.category}/${name}`
  const sub = asset.category === '树木' ? 'trees' : 'props'
  return `03_Decoration/${sub}/${name}`
}

/**
 * 自定义建筑的 id 前缀。
 *
 * 种子目录里的 id 都是有意义的前缀（building. / terrain. / decoration.），
 * 用 custom. 前缀能把「用户建的」和「随代码走的」一眼分开，
 * 也顺便保证了不会撞 id。
 */
export const CUSTOM_PREFIX = 'custom.'

export function isCustomAsset(id: string): boolean {
  return id.startsWith(CUSTOM_PREFIX)
}

/** 自定义建筑的 id：把英文名转成 slug，撞了就加序号。 */
export function makeCustomAssetId(zh: string, en: string, taken: Set<string>): string {
  const slug =
    en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'building'
  let id = `${CUSTOM_PREFIX}${slug}`
  let n = 2
  while (taken.has(id)) id = `${CUSTOM_PREFIX}${slug}-${n++}`
  void zh
  return id
}

/** 开发期自检：重复 id 会让 localStorage 补丁串味，必须在启动时就发现。 */
export function validateCatalog(assets: Asset[] = ASSETS): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const a of assets) {
    if (seen.has(a.id)) problems.push(`重复 id: ${a.id}`)
    seen.add(a.id)
    if (!a.en.trim()) problems.push(`缺少英文名: ${a.id}`)
    if (a.family === 'building' && !a.size) problems.push(`建筑缺少 size: ${a.id}`)
    if (a.family !== 'building' && (a.features?.length ?? 0) === 0) {
      problems.push(`缺少 features: ${a.id}`)
    }
  }
  return problems
}
