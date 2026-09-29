import type { Asset } from '../types'

/**
 * 围墙与边界，文档 §21。
 *
 * 用途分级：普通民宅用低矮围墙、大户人家用高墙、衙门用正式高墙、城市边缘用城墙。
 * 全部是可沿 tile 边缘拼接的墙段，方便围出区域。
 */
const BRICK_AESTHETIC =
  'Ancient Chinese town aesthetic, weathered gray brick, slightly uneven surface, subtle dirt and age marks, handcrafted traditional masonry.'

export const BOUNDARY: Asset[] = [
  {
    id: 'terrain.boundary.brick_wall',
    family: 'terrain',
    category: 'Boundary',
    zh: '灰砖墙',
    en: 'Traditional ancient Chinese town gray brick wall.',
    features: [
      'A modular straight gray brick wall segment, regular brickwork with subtle tonal variation, running along one tile edge',
    ],
    aesthetic: BRICK_AESTHETIC,
    tags: ['砖墙', '灰砖墙', 'zhuanqiang', 'zq', 'brick wall', 'wall'],
  },
  {
    id: 'terrain.boundary.plaster_wall',
    family: 'terrain',
    category: 'Boundary',
    zh: '白灰墙',
    en: 'Traditional ancient Chinese town white plaster wall.',
    features: [
      'A modular straight white plaster wall segment with a gray tiled coping on top and a stone base, a low wall suitable for ordinary houses',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm off-white plaster with weathered patches, dark timber and gray tile coping, handcrafted traditional masonry.',
    tags: ['白墙', '白灰墙', 'baihuiqiang', 'bhq', 'plaster wall', 'white wall'],
  },
  {
    id: 'terrain.boundary.courtyard_wall',
    family: 'terrain',
    category: 'Boundary',
    zh: '高院墙',
    en: 'Traditional ancient Chinese town high courtyard wall.',
    features: [
      'A modular tall courtyard wall segment, warm beige plaster over a dark brick base with a gray tiled coping, the high wall of a wealthy compound',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm beige plaster with weathered patches and a gray tile coping, handcrafted traditional masonry.',
    tags: ['高墙', '院墙', 'gaoyuanqiang', 'gyq', 'courtyard wall', 'high wall'],
  },
  {
    id: 'terrain.boundary.wooden_fence',
    family: 'terrain',
    category: 'Boundary',
    zh: '木栅栏',
    en: 'Traditional ancient Chinese town wooden fence.',
    features: [
      'A modular wooden fence segment, simple vertical timber posts with two horizontal rails, running along one tile edge',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered dark timber with visible grain, understated handcrafted look.',
    tags: ['木栅栏', '栅栏', '木栏', 'muzhalan', 'mzl', 'wooden fence', 'fence'],
  },
  {
    id: 'terrain.boundary.bamboo_fence',
    family: 'terrain',
    category: 'Boundary',
    zh: '竹篱笆',
    en: 'Traditional ancient Chinese town bamboo fence.',
    features: [
      'A modular bamboo fence segment, thin vertical bamboo stakes tied to horizontal bamboo rails with dark cord',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, natural weathered bamboo in muted green and tan tones, understated handcrafted look.',
    tags: ['竹篱笆', '篱笆', '竹栏', 'zhuliba', 'zlb', 'bamboo fence', 'fence'],
  },
  {
    id: 'terrain.boundary.stone_wall',
    family: 'terrain',
    category: 'Boundary',
    zh: '石墙',
    en: 'Traditional ancient Chinese town rough stone wall.',
    features: [
      'A modular rough stone wall segment, irregular natural stones stacked without visible mortar, running along one tile edge',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered gray and tan fieldstone, slightly uneven surface, handcrafted traditional masonry.',
    tags: ['石墙', '石头墙', 'shiqiang', 'sq', 'stone wall', 'rock wall'],
  },
  {
    id: 'terrain.boundary.city_wall',
    family: 'terrain',
    category: 'Boundary',
    zh: '城墙段',
    en: 'Traditional ancient Chinese town city wall segment.',
    features: [
      'A modular thick city wall segment, gray brick rampart with battlements along the top edge and a battered stone base',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered gray brick over stone, subtle dirt and age marks, monumental handcrafted masonry.',
    tags: ['城墙', '城墙段', 'chengqiang', 'cq', 'city wall', 'rampart', 'battlement'],
  },
  {
    id: 'terrain.boundary.wall_corner',
    family: 'terrain',
    category: 'Boundary',
    zh: '墙角',
    en: 'Traditional ancient Chinese town wall corner.',
    features: [
      'A modular wall corner segment, matching wall material turning ninety degrees at a tile corner with a capped end',
    ],
    aesthetic: BRICK_AESTHETIC,
    tags: ['墙角', '拐角', 'qiangjiao', 'qj', 'wall corner', 'corner'],
  },
  {
    id: 'terrain.boundary.wall_gate',
    family: 'terrain',
    category: 'Boundary',
    zh: '院墙门',
    en: 'Traditional ancient Chinese town wall gate.',
    features: [
      'A modular wall gate segment, an opening in the wall framed by a small gray tiled roof over dark timber doors',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, weathered gray brick with dark timber doors and a gray tiled roof, handcrafted traditional masonry.',
    tags: ['院墙门', '墙门', '大门', 'yuanqiangmen', 'yqm', 'wall gate', 'gate'],
  },
  {
    id: 'terrain.boundary.moon_gate',
    family: 'terrain',
    category: 'Boundary',
    zh: '月洞门',
    en: 'Traditional ancient Chinese town moon gate.',
    features: [
      'A modular moon gate segment, a circular opening through a white plaster wall with a gray brick surround and a low stone threshold',
    ],
    aesthetic:
      'Ancient Chinese town aesthetic, warm off-white plaster with a gray brick surround, elegant and understated, handcrafted traditional masonry.',
    tags: ['月洞门', '月亮门', '圆门', 'yuedongmen', 'ydm', 'moon gate', 'circular gate'],
  },
]
