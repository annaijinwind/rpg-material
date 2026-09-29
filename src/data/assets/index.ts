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
