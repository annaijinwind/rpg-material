import type { Asset } from '../types'

/** 自然素材，文档 §22。中式城镇尤其推荐柳树、竹子、松树、假山。 */
export const NATURE: Asset[] = [
  {
    id: 'decoration.nature.willow',
    family: 'decoration',
    category: '树木',
    zh: '柳树',
    en: 'weeping willow tree',
    upright: true,
    features: [
      'A single weeping willow with a broad drooping canopy of slender leaves hanging down around a dark trunk',
    ],
    tags: ['柳树', '垂柳', 'liushu', 'ls', 'willow', 'weeping willow', 'tree'],
  },
  {
    id: 'decoration.nature.pine',
    family: 'decoration',
    category: '树木',
    zh: '松树',
    en: 'pine tree',
    upright: true,
    features: [
      'A single pine tree with layered dark green needle clusters rising in tiers above a dark trunk',
    ],
    tags: ['松树', '松', 'songshu', 'ss', 'pine', 'conifer', 'tree'],
  },
  {
    id: 'decoration.nature.bamboo',
    family: 'decoration',
    category: '树木',
    zh: '竹子',
    en: 'bamboo cluster',
    upright: true,
    features: [
      'A small cluster of tall bamboo stalks with narrow leaves, rising from the ground',
    ],
    tags: ['竹子', '竹', 'zhuzi', 'zz', 'bamboo', 'bamboo grove'],
  },
  {
    id: 'decoration.nature.tree',
    family: 'decoration',
    category: '树木',
    zh: '普通树',
    en: 'ordinary broadleaf tree',
    upright: true,
    features: [
      'A single broadleaf tree with a rounded layered canopy of muted green foliage above a dark trunk',
    ],
    tags: ['普通树', '树', 'shu', 's', 'tree', 'broadleaf', 'foliage'],
  },
  {
    id: 'decoration.nature.shrub',
    family: 'decoration',
    category: '树木',
    zh: '灌木',
    en: 'low shrub',
    upright: true,
    features: ['A single small low shrub with dense rounded foliage'],
    tags: ['灌木', '矮树丛', 'guanmu', 'gm', 'shrub', 'bush'],
  },
  {
    id: 'decoration.nature.grass_clump',
    family: 'decoration',
    category: '树木',
    zh: '草丛',
    en: 'grass clump',
    features: [
      'A small clump of long wild grass blades fanning out from a central point, seen from directly above',
    ],
    tags: ['草丛', '草', 'caocong', 'cc', 'grass clump', 'tall grass'],
  },
  {
    id: 'decoration.nature.rock',
    family: 'decoration',
    category: '树木',
    zh: '假山',
    en: 'scholar rock',
    upright: true,
    features: [
      'A single weathered gray scholar rock with irregular hollows and a gnarled upright silhouette',
    ],
    tags: ['假山', '石头', '景观石', 'jiashan', 'js', 'rock', 'scholar rock', 'boulder'],
  },
  {
    id: 'decoration.nature.flower_bed',
    family: 'decoration',
    category: '树木',
    zh: '花坛',
    en: 'flower bed',
    features: [
      'A small rectangular flower bed with low stone edging and scattered muted blossoms, seen from directly above',
    ],
    tags: ['花坛', '花', 'huatan', 'ht', 'flower bed', 'flowers', 'planter'],
  },
]
