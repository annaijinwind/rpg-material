/**
 * 五套固定 Prompt 模板，基础措辞取自方案文档：
 *   建筑    ← §5 通用建筑 Prompt 模板
 *   地形    ← §17 青石板路 / §18 草地 / §20 水面
 *   地形独立件 ← §19 里的木桥 / 码头 / 荷叶 / 芦苇
 *   边界    ← §21 围墙与边界
 *   装饰    ← §32-C 装饰 Prompt 说明
 *
 * 占位符写成 {{VAR}}，可在「风格与模板」里直接改，改完所有素材的提示词同步变化。
 * 这就是文档 §31「先统一，再扩充」的落地方式：风格只在一个地方定义。
 */

/**
 * 视角约束。取自文档 §3.1，是全局唯一的一份。
 * 五套模板都引用它——这是防止 Krea 生成斜 45 度视角的关键。
 */
export const DEFAULT_CAMERA_CLAUSE = `Strict orthographic top-down view.
Directly viewed from above.
Perfectly top-down.
No perspective.
No three-quarter view.
No isometric view.`

/** 统一美术风格。取自文档 §4。 */
export const DEFAULT_STYLE_BLOCK =
  'Traditional ancient Chinese fantasy architecture, dark wooden timber structure, gray curved tiled roofs, warm beige plaster walls, stone foundations, muted red architectural accents, red lanterns.'

/**
 * 独立主体的背景要求：建筑 / 装饰 / 边界 / 水面小件。
 *
 * 注意这里**没有**写 "transparent background"：扩散模型输出的是没有 alpha 通道的 RGB，
 * 写「透明」它反而容易给你画一张棋盘格。
 * 真正管用的是「纯白、均匀、无投影、主体完整不被遮挡」——
 * 这样 rembg / PS 的移除背景才能批量可靠地处理。
 */
const ISOLATED_BACKGROUND = `Isolated on a plain, solid, uniform white background.
No ground plane, no cast shadow, no drop shadow, no contact shadow, no ambient occlusion, no reflection, no border, no frame.

Lit evenly with soft, flat, shadowless ambient light — nothing darkens, blurs or softens the background around the asset.

The whole asset is fully visible and centred inside the frame, with clear empty margin on all sides.
Nothing is cropped at the edges, nothing overlaps or covers it, and nothing extends beyond its silhouette — no stray shadow, no dark halo, no scattered particles.

Shading that falls inside the asset itself is welcome and should stay, but nothing may bleed past its outline.`

/**
 * 铺满整格的地形 tile 的背景要求：地面 / 道路 / 水面。
 *
 * 这些**绝不能**要白底——它们是铺满格子的贴图，抠成透明反而拼不成地图。
 * 要求是满幅到边、不留白、不描边。
 */
const TILE_BACKGROUND = `The texture fills the entire frame edge to edge, with no border, no margin and no background showing.
The pattern continues right up to every edge so it meets its neighbouring tiles seamlessly.`

/** 文档 §5 建筑模板。 */
export const DEFAULT_BUILDING_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game asset.

Traditional ancient Chinese fantasy {{BUILDING_TYPE}}.
{{BUILDING_SIZE}}

{{STYLE_BLOCK}}

{{BUILDING_FEATURES}}

{{ARCHITECTURAL_DETAILS}}

${ISOLATED_BACKGROUND}

The building should have a clear and readable silhouette from the top-down view, with visually distinct roof, walls, entrance and surrounding areas.

Modular game asset suitable for assembling an RPG Maker MZ town map.
Consistent proportions, consistent lighting, clean edges.

{{NEGATIVE}}`

/** 地形模板：铺满整格的 tile，用于地面、道路、水面。取 §17 的措辞并统一收尾。 */
export const DEFAULT_TERRAIN_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game tileset terrain asset.

{{TERRAIN_SUBJECT}}

{{TERRAIN_DESCRIPTION}}

{{TERRAIN_AESTHETIC}}

${TILE_BACKGROUND}

Seamless tileable terrain.
Clean tile boundaries.
Consistent top-down lighting.
Designed specifically for assembling RPG Maker MZ town maps.

{{NEGATIVE}}`

/**
 * 地形模板（独立件版）。木桥 / 码头 / 荷叶 / 芦苇 不是铺满的 tile，
 * 用「seamless tileable」描述它们会自相矛盾，所以单独一套收尾。
 */
export const DEFAULT_TERRAIN_OBJECT_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game terrain asset.

{{TERRAIN_SUBJECT}}

{{TERRAIN_DESCRIPTION}}

{{TERRAIN_AESTHETIC}}

${ISOLATED_BACKGROUND}

A standalone modular piece, designed to be placed on top of a water tile.

Consistent top-down lighting, consistent proportions with the other terrain assets.
Designed specifically for assembling RPG Maker MZ town maps.

{{NEGATIVE}}`

/**
 * 边界模板：墙体 / 围墙 / 栅栏 / 城门。
 *
 * 单独一套是因为它同时要两个互相拉扯的东西：
 * 既要「能接成长长一段」（墙得首尾相接拼起来），又要「独立白底」
 * （墙外的地面要透出来，不然没法叠在地图上）。
 * 地形模板只满足前者，地形独立件那套只满足后者，所以这里单开一份。
 */
export const DEFAULT_BOUNDARY_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game tileset terrain asset.

{{TERRAIN_SUBJECT}}

{{TERRAIN_DESCRIPTION}}

{{TERRAIN_AESTHETIC}}

${ISOLATED_BACKGROUND}

The wall segment runs in a straight line, and its two ends are shaped to meet the next segment so a row of them joins up seamlessly.

Consistent top-down lighting.
Designed specifically for assembling RPG Maker MZ town maps.

{{NEGATIVE}}`

/** 装饰模板。取自 §32-C：独立小型素材、正俯视、统一比例。 */
export const DEFAULT_DECORATION_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game asset.

Traditional ancient Chinese fantasy town {{OBJECT_TYPE}}.

{{OBJECT_DESCRIPTION}}

${ISOLATED_BACKGROUND}

Consistent scale with the other town decoration assets, designed to be placed on an RPG Maker MZ town map.
Consistent top-down lighting, consistent proportions, clean edges.

{{NEGATIVE}}`

/**
 * 两套负面词，按「要不要抠图」分，而不是按素材家族分——
 * 因为真正决定要求的是呈现方式：独立主体 vs 铺满整格。
 *
 * `no checkerboard pattern` 是专门加的：一旦提示词里出现「透明」，
 * 模型很容易真的给你画一个棋盘格，那是抠图工具最讨厌的输入。
 * 禁投影和禁遮挡同样是为了抠图：投影会被算成主体的一部分，边缘全是脏的。
 */
export const DEFAULT_NEGATIVE = {
  isolated:
    'No characters, no people, no animals, no vehicles, no readable text, no UI, no modern objects, no photorealism. No shadow, no cast shadow, no drop shadow, no contact shadow, no ambient occlusion, no soft shadow under the object, no shadow on the background, no dark halo, no reflection, no ground plane, no scenery behind it. No cropping, no cut-off edges, no overlapping objects, no foreground foliage, no border, no frame, no watermark, no checkerboard pattern.',
  tile: 'No buildings, no characters, no objects, no furniture, no text, no perspective, no photorealism. No border, no margin, no frame, no vignette, no drop shadow, no shadows outside the tile.',
} as const

export function buildDefaultStyleConfig(): StyleConfig {
  return {
    cameraClause: DEFAULT_CAMERA_CLAUSE,
    styleBlock: DEFAULT_STYLE_BLOCK,
    negative: { ...DEFAULT_NEGATIVE },
    templates: {
      building: DEFAULT_BUILDING_TEMPLATE,
      terrain: DEFAULT_TERRAIN_TEMPLATE,
      terrainObject: DEFAULT_TERRAIN_OBJECT_TEMPLATE,
      boundary: DEFAULT_BOUNDARY_TEMPLATE,
      decoration: DEFAULT_DECORATION_TEMPLATE,
    },
    /**
     * Krea 2 有独立的负面提示词输入框。默认把负面词单独输出，不塞进正面提示词里，
     * 否则正面框里的 "No characters, no people..." 反而会稀释主体描述。
     * 如果你的工作流只有一个输入框，打开这个开关即可。
     */
    appendNegativeInline: false,
    version: 1,
  }
}

export interface StyleConfig {
  /** 视角约束，五套模板共用。 */
  cameraClause: string
  /** 统一美术风格块，建筑模板默认引用。 */
  styleBlock: string
  /** 两套负面词：独立主体（要抠图）/ 铺满整格（不能抠）。 */
  negative: { isolated: string; tile: string }
  templates: {
    building: string
    /** 铺满整格的地面 / 道路 / 水面。 */
    terrain: string
    /** 非铺满的地形独立件（木桥 / 码头 / 荷叶 / 芦苇）。 */
    terrainObject: string
    /** 墙体 / 围墙 / 栅栏 / 城门：既要首尾相接，又要独立白底。 */
    boundary: string
    decoration: string
  }
  /** 只有一个提示词输入框时打开：把负面词拼到正面提示词末尾。 */
  appendNegativeInline: boolean
  /** 每次保存 +1。用于记忆化与「是否改过」判断。 */
  version: number
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * 把一份可能来自旧版本、或来自用户随手选的文件、或只改了一部分的风格配置，
 * 合并到默认值上。逐字段做类型检查，缺的、类型不对的都用默认值补。
 *
 * 只读已知的 key，所以老版本残留的字段（比如以前按家族分的 negative）
 * 会被自然丢掉，不会跟着一路传下去。
 */
export function mergeStyle(raw: unknown, defaults = buildDefaultStyleConfig()): StyleConfig {
  const src = isPlainObject(raw) ? raw : {}
  const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)

  const neg = isPlainObject(src.negative) ? src.negative : {}
  const tpl = isPlainObject(src.templates) ? src.templates : {}

  return {
    cameraClause: str(src.cameraClause, defaults.cameraClause),
    styleBlock: str(src.styleBlock, defaults.styleBlock),
    negative: {
      isolated: str(neg.isolated, defaults.negative.isolated),
      tile: str(neg.tile, defaults.negative.tile),
    },
    templates: {
      building: str(tpl.building, defaults.templates.building),
      terrain: str(tpl.terrain, defaults.templates.terrain),
      terrainObject: str(tpl.terrainObject, defaults.templates.terrainObject),
      boundary: str(tpl.boundary, defaults.templates.boundary),
      decoration: str(tpl.decoration, defaults.templates.decoration),
    },
    appendNegativeInline: src.appendNegativeInline === true,
    version: typeof src.version === 'number' ? src.version : defaults.version,
  }
}

/** 模板里可以使用的全部占位符，用于设置面板里的提示。 */
export const TEMPLATE_VARS: Array<{ key: string; desc: string }> = [
  { key: '{{CAMERA}}', desc: '视角约束（全局共用）' },
  { key: '{{STYLE_BLOCK}}', desc: '统一美术风格块（全局共用）' },
  { key: '{{BUILDING_TYPE}}', desc: '建筑英文名' },
  { key: '{{BUILDING_SIZE}}', desc: '建筑尺寸' },
  { key: '{{BUILDING_FEATURES}}', desc: '建筑特征关键词（逗号连接）' },
  { key: '{{ARCHITECTURAL_DETAILS}}', desc: '建筑细节关键词（逗号连接）' },
  { key: '{{TERRAIN_SUBJECT}}', desc: '地形主体句（边界模板也用这个）' },
  { key: '{{TERRAIN_DESCRIPTION}}', desc: '地形材质与形态描述' },
  { key: '{{TERRAIN_AESTHETIC}}', desc: '地形质感与审美描述' },
  { key: '{{OBJECT_TYPE}}', desc: '装饰英文名' },
  { key: '{{OBJECT_DESCRIPTION}}', desc: '装饰外观描述' },
  { key: '{{NEGATIVE}}', desc: '负面词（可能为空，取决于下方开关）' },
]
