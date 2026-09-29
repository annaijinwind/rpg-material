import type { Asset } from '../types'

/**
 * 水域，文档 §19 / §20。
 *
 * 前 7 项是可拼接的水面 / 岸边 tile；后 4 项（码头、木桥、荷叶、芦苇）
 * 是摆在水面上的独立小件，tileable 置 false，走非拼接版模板。
 */
export const WATER: Asset[] = [
  {
    id: 'terrain.water.river',
    family: 'terrain',
    category: 'Water',
    zh: '河水',
    en: 'Traditional ancient Chinese town river water.',
    features: [
      'Calm blue-green water surface with subtle natural ripples, gentle tonal variation, understated fantasy RPG aesthetic',
    ],
    tags: ['河水', '河流', 'heShui', 'hs', 'river', 'water'],
  },
  {
    id: 'terrain.water.pond',
    family: 'terrain',
    category: 'Water',
    zh: '池塘水面',
    en: 'Traditional ancient Chinese town pond water.',
    features: [
      'Still blue-green pond water with very gentle ripples, soft tonal variation, understated fantasy RPG aesthetic',
    ],
    tags: ['池塘', '池水', 'chitang', 'ct', 'pond', 'water'],
  },
  {
    id: 'terrain.water.stream',
    family: 'terrain',
    category: 'Water',
    zh: '小溪',
    en: 'Traditional ancient Chinese town shallow stream water.',
    features: [
      'Shallow flowing stream water with small gentle ripples and light tonal variation, understated fantasy RPG aesthetic',
    ],
    tags: ['小溪', '溪流', 'xiaoxi', 'xx', 'stream', 'creek', 'brook'],
  },
  {
    id: 'terrain.water.edge',
    family: 'terrain',
    category: 'Water',
    zh: '水岸',
    en: 'Traditional ancient Chinese town water edge.',
    features: [
      'A modular water edge tile, calm water meeting land along one side with a soft natural shoreline and gentle ripples',
    ],
    tags: ['水岸', '岸边', 'shuian', 'sa', 'water edge', 'shoreline'],
  },
  {
    id: 'terrain.water.stone_shore',
    family: 'terrain',
    category: 'Water',
    zh: '石岸',
    en: 'Traditional ancient Chinese town stone shore.',
    features: [
      'A modular stone shore tile, worn stone slabs along the waterline with calm water on one side and irregular natural stone edges',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered blue-gray stone, subtle dirt and age marks, handcrafted traditional embankment.',
    tags: ['石岸', '石头岸', 'shian', 'sa', 'stone shore', 'stone bank'],
  },
  {
    id: 'terrain.water.dirt_shore',
    family: 'terrain',
    category: 'Water',
    zh: '土岸',
    en: 'Traditional ancient Chinese town dirt shore.',
    features: [
      'A modular dirt shore tile, packed earth meeting calm water along one side with a soft eroded edge',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm earth tones, subtle dirt and age marks, handcrafted traditional riverbank.',
    tags: ['土岸', '泥岸', 'tuan', 'ta', 'dirt shore', 'mud bank'],
  },
  {
    id: 'terrain.water.bridge',
    family: 'terrain',
    category: 'Water',
    zh: '木桥',
    en: 'Traditional ancient Chinese town wooden bridge.',
    features: [
      'A modular arched wooden footbridge with simple timber railings, weathered planks and dark wooden posts, designed to span a river tile',
    ],
    tileable: false,
    tags: ['木桥', '桥', 'muqiao', 'mq', 'bridge', 'wooden bridge'],
  },
  {
    id: 'terrain.water.dock',
    family: 'terrain',
    category: 'Water',
    zh: '木码头',
    en: 'Traditional ancient Chinese town wooden dock.',
    features: [
      'A modular wooden dock of weathered planks on dark timber piles, with simple mooring posts, designed to extend over a water tile',
    ],
    tileable: false,
    tags: ['码头', '木码头', 'matou', 'mt', 'dock', 'pier', 'jetty'],
  },
  {
    id: 'terrain.water.lotus',
    family: 'terrain',
    category: 'Water',
    zh: '荷叶',
    en: 'Traditional ancient Chinese town lotus leaves.',
    features: [
      'A small cluster of floating round lotus leaves with a few closed buds, seen from directly above, designed to float on a water tile',
    ],
    tileable: false,
    tags: ['荷叶', '荷花', '莲叶', 'heye', 'hy', 'lotus', 'lily pad'],
  },
  {
    id: 'terrain.water.reeds',
    family: 'terrain',
    category: 'Water',
    zh: '芦苇',
    en: 'Traditional ancient Chinese town water reeds.',
    features: [
      'A small clump of tall thin water reeds and cattails growing from shallow water, seen from directly above',
    ],
    tileable: false,
    tags: ['芦苇', '芦草', 'luwei', 'lw', 'reeds', 'cattail'],
  },
]
