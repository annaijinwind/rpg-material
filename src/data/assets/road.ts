import type { Asset } from '../types'

/**
 * 道路，文档 §16。道路是城镇地图最重要的地形，
 * 直线 / 转角 / T 字 / 十字 / 尽头 / 过渡 六类齐了才能拼出主街。
 * 铺装材质统一用青石板，与 terrain.ground.stone 保持一致。
 */
const STONE_AESTHETIC =
  'Ancient Chinese town aesthetic, weathered blue-gray stone, slightly uneven surface, subtle dirt and age marks, handcrafted traditional stone paving.'

/** 把「形状」拼成一句青石板铺装描述，保证五种路口措辞完全平行。 */
function roadTile(shape: string): string {
  return `A ${shape} modular stone road segment, made from irregular rectangular stone slabs with subtle variations in size and shape`
}

export const ROAD: Asset[] = [
  {
    id: 'terrain.road.straight',
    family: 'terrain',
    category: 'Road',
    zh: '石板路直线',
    en: 'Traditional ancient Chinese town stone road.',
    features: [roadTile('straight')],
    aesthetic: STONE_AESTHETIC,
    tags: ['石板路', '直线', '道路', 'shibanlu', 'sbl', 'road', 'straight', 'path'],
  },
  {
    id: 'terrain.road.corner',
    family: 'terrain',
    category: 'Road',
    zh: '石板路转角',
    en: 'Traditional ancient Chinese town stone road corner.',
    features: [roadTile('corner')],
    aesthetic: STONE_AESTHETIC,
    tags: ['转角', '拐角', '弯道', 'zhuanjiao', 'zj', 'corner', 'turn', 'bend'],
  },
  {
    id: 'terrain.road.t_junction',
    family: 'terrain',
    category: 'Road',
    zh: '石板路 T 字路口',
    en: 'Traditional ancient Chinese town stone road T-junction.',
    features: [roadTile('T-junction')],
    aesthetic: STONE_AESTHETIC,
    tags: ['t字路口', '丁字路口', 'tzilu', 'tzlk', 't-junction', 'junction'],
  },
  {
    id: 'terrain.road.crossroad',
    family: 'terrain',
    category: 'Road',
    zh: '石板路十字路口',
    en: 'Traditional ancient Chinese town stone road crossroad.',
    features: [roadTile('crossroad')],
    aesthetic: STONE_AESTHETIC,
    tags: ['十字路口', '路口', 'shizi luko', 'szlk', 'crossroad', 'intersection', 'crossing'],
  },
  {
    id: 'terrain.road.end',
    family: 'terrain',
    category: 'Road',
    zh: '石板路尽头',
    en: 'Traditional ancient Chinese town stone road end.',
    features: [roadTile('road end')],
    aesthetic: STONE_AESTHETIC,
    tags: ['尽头', '路end', 'jintou', 'jt', 'road end', 'dead end'],
  },
  {
    id: 'terrain.road.dirt_transition',
    family: 'terrain',
    category: 'Road',
    zh: '石路/土地过渡',
    en: 'Traditional ancient Chinese town stone road to dirt transition.',
    features: [
      'A modular transition tile, stone slabs on one side fading into packed earth on the other, with a naturally irregular boundary between the two materials',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered blue-gray stone meeting warm packed earth, subtle dirt and age marks, handcrafted traditional paving.',
    tags: ['过渡', '土地过渡', 'guodu', 'gd', 'transition', 'dirt transition'],
  },
  {
    id: 'terrain.road.grass_transition',
    family: 'terrain',
    category: 'Road',
    zh: '石路/草地过渡',
    en: 'Traditional ancient Chinese town stone road to grass transition.',
    features: [
      'A modular transition tile, stone slabs on one side fading into grass on the other, with grass creeping naturally between the outer stones',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered blue-gray stone meeting muted green grass, subtle dirt and age marks, handcrafted traditional paving.',
    tags: ['过渡', '草地过渡', 'guodu', 'gd', 'transition', 'grass transition'],
  },
]
