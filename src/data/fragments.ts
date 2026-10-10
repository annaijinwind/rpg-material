/**
 * 构件库。
 *
 * 存在的意义是**防住词汇漂移**：同一个意思，不同条目写成不同的词，模型就给出不同的东西。
 * 这一整轮我们手工修的 `visible forge`、`escort agency`、`government`、灯笼加加减减，
 * 本质都是这件事。构件把「措辞」集中到一处，改一次，所有用到它的建筑一起变。
 *
 * 所以库里的 `en` **全部取自现有 30 栋建筑已经在用的词**，不引入新说法——
 * 这样勾出来的东西和手工写的东西是同一套语言。
 *
 * 两条设计约束：
 *   1. 构件是**名词短语**，不是数字。模型不擅长计数：`two-story` 可行（强先验），
 *      但 `3 rooms` 不可控。所以「几间房」这类不做成构件。
 *   2. 分组的 `mode` 决定勾选行为：`single` 像单选（屋顶只能有一种），
 *      `multi` 像复选（点缀可以叠好几个）。
 */

export type FragmentTarget = 'features' | 'details' | 'size'

export interface Fragment {
  id: string
  /** 界面上的中文标签。 */
  zh: string
  /** 写进提示词的英文短语。取自现有建筑的关键词。 */
  en: string
  /** 追加到哪一段。`size` 是替换而不是追加，单独处理。 */
  target: FragmentTarget
  /** 一句话说明，鼠标悬停时显示。 */
  note?: string
}

export interface FragmentGroup {
  id: string
  zh: string
  hint: string
  mode: 'single' | 'multi'
  fragments: Fragment[]
}

export const FRAGMENT_GROUPS: FragmentGroup[] = [
  {
    id: 'size',
    zh: '规模',
    hint: '单选。会替换建筑尺寸那一行',
    mode: 'single',
    fragments: [
      { id: 'size.small_single', zh: '小单层', en: 'small single-story building', target: 'size' },
      { id: 'size.medium_single', zh: '中单层', en: 'medium-sized single-story building', target: 'size' },
      { id: 'size.medium_two', zh: '中两层', en: 'medium-sized two-story building', target: 'size' },
      { id: 'size.large_two', zh: '大两层', en: 'large two-story wooden building', target: 'size' },
      { id: 'size.large_compound', zh: '大院落', en: 'large compound', target: 'size' },
      { id: 'size.grand_mansion', zh: '宅邸', en: 'grand mansion', target: 'size' },
    ],
  },
  {
    id: 'courtyard',
    zh: '院落',
    hint: '单选',
    mode: 'single',
    fragments: [
      { id: 'courtyard.small', zh: '小院', en: 'small courtyard', target: 'features' },
      { id: 'courtyard.large', zh: '大院', en: 'large courtyard', target: 'features' },
      { id: 'courtyard.front', zh: '大前院', en: 'large front courtyard', target: 'features' },
      { id: 'courtyard.private', zh: '私院', en: 'private courtyard', target: 'features' },
      { id: 'courtyard.stone', zh: '石板院', en: 'stone courtyard', target: 'features' },
      { id: 'courtyard.narrow', zh: '窄院', en: 'narrow courtyard', target: 'features' },
      { id: 'courtyard.rear_garden', zh: '后院花园', en: 'rear garden', target: 'features' },
    ],
  },
  {
    id: 'front',
    zh: '门面',
    hint: '可多选',
    mode: 'multi',
    fragments: [
      { id: 'front.wooden_entrance', zh: '木门', en: 'wooden entrance', target: 'features' },
      { id: 'front.large_wooden_entrance', zh: '大木门', en: 'large wooden entrance', target: 'features' },
      { id: 'front.covered_porch', zh: '带门廊', en: 'covered entrance porch', target: 'features' },
      { id: 'front.large_gate', zh: '大门楼', en: 'large entrance gate', target: 'features' },
      { id: 'front.formal_entrance', zh: '正式门面', en: 'formal entrance', target: 'features' },
      { id: 'front.main_gate', zh: '正门', en: 'main gate', target: 'features' },
      { id: 'front.wooden_gate', zh: '木栅门', en: 'wooden gate', target: 'features' },
      { id: 'front.side_entrance', zh: '侧门', en: 'side entrance', target: 'features' },
    ],
  },
  {
    id: 'layout',
    zh: '布局',
    hint: '可多选',
    mode: 'multi',
    fragments: [
      { id: 'layout.main_hall', zh: '正堂', en: 'main hall', target: 'features' },
      { id: 'layout.reception_hall', zh: '前厅', en: 'reception hall', target: 'features' },
      { id: 'layout.symmetrical', zh: '对称布局', en: 'formal symmetrical layout', target: 'features' },
      { id: 'layout.covered_walkways', zh: '回廊', en: 'covered walkways', target: 'features' },
      { id: 'layout.covered_corridors', zh: '连廊', en: 'covered corridors', target: 'features' },
      { id: 'layout.side_wings', zh: '厢房', en: 'side wings', target: 'features' },
      { id: 'layout.side_buildings', zh: '侧屋', en: 'side buildings', target: 'features' },
      { id: 'layout.side_rooms', zh: '耳房', en: 'side rooms', target: 'features' },
      { id: 'layout.multiple_courtyards', zh: '多进院落', en: 'multiple courtyards', target: 'features' },
    ],
  },
  {
    id: 'roof',
    zh: '屋顶',
    hint: '单选',
    mode: 'single',
    fragments: [
      { id: 'roof.tiled', zh: '灰瓦', en: 'gray tiled roof', target: 'details' },
      { id: 'roof.curved_tiled', zh: '灰瓦曲面', en: 'gray curved tiled roof', target: 'details' },
      {
        id: 'roof.curved_ridge',
        zh: '灰瓦带脊饰',
        en: 'gray curved tiled roof with decorative ridge ornaments',
        target: 'details',
      },
      { id: 'roof.wide_tiled', zh: '宽檐瓦顶', en: 'wide tiled roof', target: 'details' },
      { id: 'roof.double_eaved', zh: '双层檐', en: 'double-eaved curved tiled roof', target: 'details' },
    ],
  },
  {
    id: 'structure',
    zh: '结构与墙面',
    hint: '可多选',
    mode: 'multi',
    fragments: [
      { id: 'struct.dark_beams', zh: '深色木梁', en: 'dark wooden beams', target: 'details' },
      { id: 'struct.timber_frame', zh: '深色木构架', en: 'dark wooden timber frame', target: 'details' },
      { id: 'struct.plaster_walls', zh: '暖米色墙面', en: 'warm beige plaster walls', target: 'details' },
      { id: 'struct.stone_foundation', zh: '石基座', en: 'stone foundation', target: 'details' },
      { id: 'struct.stone_base', zh: '石台基', en: 'stone base', target: 'details' },
      { id: 'struct.red_pillars', zh: '暗红立柱', en: 'muted red pillars', target: 'details' },
      { id: 'struct.stone_paving', zh: '石板铺地', en: 'stone paving', target: 'details' },
      { id: 'struct.gray_brick', zh: '灰砖', en: 'gray brick', target: 'details' },
    ],
  },
  {
    id: 'prop',
    zh: '点缀',
    hint: '可多选',
    mode: 'multi',
    fragments: [
      { id: 'prop.red_lanterns', zh: '红灯笼', en: 'red lanterns', target: 'details' },
      { id: 'prop.hanging_red_lanterns', zh: '悬挂红灯笼', en: 'hanging red lanterns', target: 'details' },
      { id: 'prop.hanging_lanterns', zh: '灯笼', en: 'hanging lanterns', target: 'details' },
      { id: 'prop.stone_steps', zh: '石阶', en: 'stone steps', target: 'details' },
      { id: 'prop.flower_pots', zh: '花盆', en: 'small flower pots', target: 'details' },
      { id: 'prop.potted_plants', zh: '盆栽', en: 'potted plants', target: 'details' },
      { id: 'prop.wooden_crates', zh: '木箱', en: 'wooden crates', target: 'details' },
      { id: 'prop.wooden_barrels', zh: '木桶', en: 'wooden barrels', target: 'details' },
      { id: 'prop.courtyard_trees', zh: '院中树', en: 'courtyard trees', target: 'details' },
      { id: 'prop.banners', zh: '布幌子', en: 'blank fabric banners', target: 'details' },
      { id: 'prop.signboard', zh: '木招牌', en: 'wooden signboard', target: 'details' },
    ],
  },
]

export const FRAGMENT_BY_ID = new Map(
  FRAGMENT_GROUPS.flatMap((g) => g.fragments.map((f) => [f.id, f] as const)),
)
