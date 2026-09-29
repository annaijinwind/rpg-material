import type { Asset } from '../types'

/** 基础地面，文档 §15。第一批只做必要颜色，避免过早发散。 */
export const GROUND: Asset[] = [
  {
    id: 'terrain.ground.dirt',
    family: 'terrain',
    category: 'Ground',
    zh: '夯土地面',
    en: 'Traditional ancient Chinese town packed earth ground.',
    features: [
      'A modular packed earth ground tile, rammed earth surface with subtle tonal variation',
      'small embedded stones and faint marks of daily wear',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm earth tones, slightly uneven surface, understated handcrafted look.',
    tags: ['夯土', '土地', '泥地', 'hangtu', 'td', 'dirt', 'earth', 'ground'],
  },
  {
    id: 'terrain.ground.grass',
    family: 'terrain',
    category: 'Ground',
    zh: '草地',
    en: 'Traditional Chinese fantasy RPG town grass terrain.',
    features: [
      'Natural muted green grass, subtle variation in grass density, small natural patches and tiny plants',
    ],
    tags: ['草地', '草', 'caodi', 'cd', 'grass', 'lawn'],
  },
  {
    id: 'terrain.ground.dark_grass',
    family: 'terrain',
    category: 'Ground',
    zh: '深色草地',
    en: 'Traditional Chinese fantasy RPG town dark grass terrain.',
    features: [
      'Darker shaded green grass, subtle variation in grass density, small natural patches and tiny plants',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, cool muted green with soft shadow variation, understated handcrafted look.',
    tags: ['深色草地', '深草', 'shense caodi', 'sscd', 'dark grass', 'deep grass'],
  },
  {
    id: 'terrain.ground.brick',
    family: 'terrain',
    category: 'Ground',
    zh: '青砖地面',
    en: 'Traditional ancient Chinese town blue-gray brick ground.',
    features: [
      'A modular blue-gray brick ground tile, laid in a regular running bond pattern with subtle variations in tone',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered blue-gray brick, slightly uneven surface, subtle dirt and age marks, handcrafted traditional brick paving.',
    tags: ['青砖', '砖地', 'qingzhuan', 'qz', 'brick', 'blue-gray brick'],
  },
  {
    id: 'terrain.ground.stone',
    family: 'terrain',
    category: 'Ground',
    zh: '青石地面',
    en: 'Traditional ancient Chinese town stone pavement.',
    features: [
      'A modular blue-gray natural stone pavement tile, made from irregular rectangular stone slabs with subtle variations in size and shape',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered blue-gray stone, slightly uneven surface, subtle dirt and age marks, handcrafted traditional stone paving.',
    tags: ['青石', '石板', '石地', 'qingshi', 'qs', 'stone', 'pavement', 'flagstone'],
  },
  {
    id: 'terrain.ground.courtyard',
    family: 'terrain',
    category: 'Ground',
    zh: '庭院地面',
    en: 'Traditional ancient Chinese town courtyard ground.',
    features: [
      'A modular courtyard ground tile, flat packed earth and fine gravel with subtle tonal variation',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm light gray ground, subtle dirt and age marks, handcrafted traditional courtyard surface.',
    tags: ['庭院', '院子', 'tingyuan', 'ty', 'courtyard', 'compound ground'],
  },
]
