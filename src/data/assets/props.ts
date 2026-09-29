import type { Asset } from '../types'

/**
 * 小型装饰，文档 §23。
 * 这些素材最能提高城镇的生活感，优先做：灯笼、水井、木箱、木桶、柴火堆、水缸、摊位、花盆。
 */
export const PROPS: Asset[] = [
  {
    id: 'decoration.prop.red_lantern',
    family: 'decoration',
    category: '杂物',
    zh: '红灯笼',
    en: 'hanging red lantern',
    features: [
      'A single round red paper lantern in a warm muted red tone, with a dark wooden cap and base and a short hanging tassel',
    ],
    tags: ['红灯笼', '灯笼', 'hongdenglong', 'hdl', 'lantern', 'red lantern'],
  },
  {
    id: 'decoration.prop.stone_lantern',
    family: 'decoration',
    category: '杂物',
    zh: '石灯笼',
    en: 'stone lantern',
    features: [
      'A single carved gray stone lantern with a small roofed light chamber on a stepped stone base',
    ],
    tags: ['石灯笼', '石灯', 'shidenglong', 'sdl', 'stone lantern'],
  },
  {
    id: 'decoration.prop.well',
    family: 'decoration',
    category: '杂物',
    zh: '水井',
    en: 'stone well',
    features: [
      'A single round stone well with a low circular rim and a simple dark wooden frame and bucket',
    ],
    tags: ['水井', '井', 'shuijing', 'sj', 'well', 'water well'],
  },
  {
    id: 'decoration.prop.water_jar',
    family: 'decoration',
    category: '杂物',
    zh: '水缸',
    en: 'large water jar',
    features: [
      'A single large glazed ceramic water jar with a wide mouth and slightly weathered surface',
    ],
    tags: ['水缸', '缸', 'shuigang', 'sg', 'water jar', 'vat', 'urn'],
  },
  {
    id: 'decoration.prop.crate',
    family: 'decoration',
    category: '杂物',
    zh: '木箱',
    en: 'wooden crate',
    features: [
      'A single rectangular wooden crate with visible plank construction and a dark timber frame',
    ],
    tags: ['木箱', '箱子', 'muxiang', 'mx', 'crate', 'box', 'wooden box'],
  },
  {
    id: 'decoration.prop.barrel',
    family: 'decoration',
    category: '杂物',
    zh: '木桶',
    en: 'wooden barrel',
    features: ['A single wooden barrel with vertical staves and dark metal hoops'],
    tags: ['木桶', '桶', 'mutong', 'mt', 'barrel', 'cask'],
  },
  {
    id: 'decoration.prop.firewood',
    family: 'decoration',
    category: '杂物',
    zh: '柴火堆',
    en: 'firewood pile',
    features: [
      'A small stacked pile of cut firewood logs arranged in a rough bundle, seen from directly above',
    ],
    tags: ['柴火堆', '柴火', '木柴', 'chaihuodui', 'chd', 'firewood', 'logs'],
  },
  {
    id: 'decoration.prop.sack',
    family: 'decoration',
    category: '杂物',
    zh: '麻袋',
    en: 'cloth sack of grain',
    features: ['A single tied cloth sack of grain standing upright with a folded top'],
    tags: ['麻袋', '袋子', '粮食袋', 'madai', 'md', 'sack', 'bag', 'grain sack'],
  },
  {
    id: 'decoration.prop.cart',
    family: 'decoration',
    category: '杂物',
    zh: '木板车',
    en: 'wooden hand cart',
    features: [
      'A small two-wheeled wooden hand cart with a plain plank bed and long handles, seen from directly above',
    ],
    tags: ['木板车', '推车', '车', 'mubanche', 'mbc', 'cart', 'handcart', 'wheelbarrow'],
  },
  {
    id: 'decoration.prop.drying_rack',
    family: 'decoration',
    category: '杂物',
    zh: '晾晒架',
    en: 'wooden drying rack',
    features: [
      'A simple wooden drying rack with a horizontal frame and thin rails, seen from directly above',
    ],
    tags: ['晾晒架', '晾架', '架子', 'liangshaijia', 'lsj', 'drying rack', 'rack'],
  },
  {
    id: 'decoration.prop.flower_pot',
    family: 'decoration',
    category: '杂物',
    zh: '花盆',
    en: 'flower pot',
    features: ['A single ceramic flower pot with a small flowering plant, seen from directly above'],
    tags: ['花盆', '盆栽', 'huapen', 'hp', 'flower pot', 'potted plant', 'planter'],
  },
  {
    id: 'decoration.prop.stone_bench',
    family: 'decoration',
    category: '杂物',
    zh: '石凳',
    en: 'stone bench',
    features: [
      'A single low rectangular stone bench with a slightly weathered surface, seen from directly above',
    ],
    tags: ['石凳', '凳子', 'shideng', 'sd', 'stone bench', 'bench'],
  },
  {
    id: 'decoration.prop.signboard',
    family: 'decoration',
    category: '杂物',
    zh: '木招牌',
    en: 'wooden signboard',
    features: [
      'A single vertical wooden signboard on a dark timber post, with a completely blank unmarked face',
    ],
    tags: ['木招牌', '招牌', '牌子', 'muzhaopai', 'mzp', 'signboard', 'sign', 'shop sign'],
  },
  {
    id: 'decoration.prop.market_stall',
    family: 'decoration',
    category: '杂物',
    zh: '摊位',
    en: 'market stall',
    features: [
      'A single small market stall with a wooden counter, a cloth awning on poles and stacked woven baskets, seen from directly above',
    ],
    tags: ['摊位', '摊子', '市集摊', 'tanwei', 'tw', 'market stall', 'stall', 'vendor'],
  },
]
