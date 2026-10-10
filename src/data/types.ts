/**
 * 素材数据模型。
 *
 * 字段命名沿用方案文档里的占位符概念，方便一一对应：
 *   en        → [BUILDING TYPE] / [TERRAIN SUBJECT] / 装饰主体
 *   size      → [BUILDING SIZE]
 *   features  → [BUILDING FEATURES]
 *   details   → [ARCHITECTURAL DETAILS]
 *   aesthetic → 地形专属的材质、审美描述句
 */

/** 三套固定 Prompt 家族，对应文档 §32 的 A / B / C。 */
export type AssetFamily = 'building' | 'terrain' | 'decoration'

/** 生成进度。todo 未生成 / generated 已生成 / approved 已通过 / rejected 弃用。 */
export type AssetStatus = 'todo' | 'generated' | 'approved' | 'rejected'

export interface Asset {
  /** 稳定 id，同时用作 localStorage 里的 key，例如 'building.blacksmith'。 */
  id: string
  family: AssetFamily
  /** 子分类，用于左侧分类树，例如 'Ground' / 'Road' / '树木'。 */
  category: string
  /** 中文名。 */
  zh: string
  /** 英文名，直接填入 Prompt 的主体位置。 */
  en: string
  /** 建筑尺寸，如 'medium-sized single-story building'。 */
  size?: string
  /** 主体特征关键词。 */
  features?: string[]
  /** 细节关键词。 */
  details?: string[]
  /** 地形材质与审美描述句。 */
  aesthetic?: string
  /**
   * 地形是否为可无缝拼接的 tile。默认 true。
   * 木桥 / 码头 / 荷叶 / 芦苇 这类「放在水面上的独立小件」设为 false，
   * 会改用非拼接版的地形模板，避免出现「seamless tileable」这种自相矛盾的要求。
   */
  tileable?: boolean
  /** 搜索别名，包含简拼，例如 ['民宅', 'mz', 'zhuzhai']。 */
  tags: string[]
  /** 建筑三阶段规划，来自文档 §13。地形与装饰不适用。 */
  phase?: 1 | 2 | 3
  /**
   * 额外勾选的构件 id（见 src/data/fragments.ts）。
   *
   * 只在建筑上有意义，是「在自带关键词之外再加点什么」。
   * 存 id 而不是存文本，是为了让措辞能集中维护——改一次构件库，所有用到它的建筑一起变。
   * 种子数据里一般没有这个字段；用户在界面上勾的会落在 AssetPatch 上。
   */
  extraFragments?: string[]
}

/** 施工状态默认值。 */
export const DEFAULT_STATUS: AssetStatus = 'todo'

export const STATUS_LABEL: Record<AssetStatus, string> = {
  todo: '未生成',
  generated: '已生成',
  approved: '已通过',
  rejected: '弃用',
}

export const FAMILY_LABEL: Record<AssetFamily, string> = {
  building: '建筑',
  terrain: '地形',
  decoration: '装饰',
}

/**
 * 分类的显示名。
 *
 * `category` 字段本身保持英文：它既是稳定的数据键，也正好是文档 §24 里
 * `01_Terrain/Ground/…` 的目录名，导出目录清单时直接用它。界面上则走这张表，
 * 免得一个中文界面里混着 Ground / Road / Water / Boundary 四个英文分类。
 */
export const CATEGORY_LABEL: Record<string, string> = {
  建筑: '建筑',
  /** 用户在界面上自己建的建筑，单独归一类，方便一眼找到。 */
  自建: '自建',
  Ground: '地面',
  Road: '道路',
  Water: '水域',
  Boundary: '边界',
  树木: '树木',
  杂物: '杂物',
}

/** 取分类的显示名，表里没有就原样返回。 */
export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category
}

/** 分类树顺序：分类名 → 该分类下的家族。决定左侧栏的排列。 */
export const CATEGORY_ORDER: Array<{ family: AssetFamily; categories: string[] }> = [
  { family: 'building', categories: ['建筑', '自建'] },
  { family: 'terrain', categories: ['Ground', 'Road', 'Water', 'Boundary'] },
  { family: 'decoration', categories: ['树木', '杂物'] },
]
