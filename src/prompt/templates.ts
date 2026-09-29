/**
 * 三套固定 Prompt 模板，逐字取自方案文档：
 *   建筑  ← §5 通用建筑 Prompt 模板
 *   地形  ← §17 青石板路 / §18 草地 / §20 水面
 *   装饰  ← §32-C 装饰 Prompt 说明
 *
 * 占位符写成 {{VAR}}，可在「风格设置」里直接改，改完所有素材的提示词同步变化。
 * 这就是文档 §31「先统一，再扩充」的落地方式：风格只在一个地方定义。
 */

/**
 * 视角约束。取自文档 §3.1，是全局唯一的一份。
 * 三套模板都引用它——这是防止 Krea 生成斜 45 度视角的关键。
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

/** 文档 §5 建筑模板。 */
export const DEFAULT_BUILDING_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game asset.

Traditional ancient Chinese fantasy {{BUILDING_TYPE}}.
{{BUILDING_SIZE}}

{{STYLE_BLOCK}}

{{BUILDING_FEATURES}}

{{ARCHITECTURAL_DETAILS}}

The building should have a clear and readable silhouette from the top-down view, with visually distinct roof, walls, entrance and surrounding areas.

Modular game asset suitable for assembling an RPG Maker MZ town map.
Consistent proportions, consistent lighting, clean edges.

{{NEGATIVE}}`

/** 地形模板：可无缝拼接的 tile，用于地面、道路、水面、墙体。取 §17 的措辞并统一收尾。 */
export const DEFAULT_TERRAIN_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game tileset terrain asset.

{{TERRAIN_SUBJECT}}

{{TERRAIN_DESCRIPTION}}

{{TERRAIN_AESTHETIC}}

Seamless tileable terrain.
Clean tile boundaries.
Consistent top-down lighting.
Designed specifically for assembling RPG Maker MZ town maps.

{{NEGATIVE}}`

/**
 * 地形模板（独立件版）。木桥 / 码头 / 荷叶 / 芦苇 不是可拼接的 tile，
 * 用「seamless tileable」描述它们会自相矛盾，所以单独一套收尾。
 */
export const DEFAULT_TERRAIN_OBJECT_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game terrain asset.

{{TERRAIN_SUBJECT}}

{{TERRAIN_DESCRIPTION}}

{{TERRAIN_AESTHETIC}}

A standalone modular piece with clean isolated edges, designed to be placed over a water tile.

Consistent top-down lighting, consistent proportions with the other terrain assets.
Designed specifically for assembling RPG Maker MZ town maps.

{{NEGATIVE}}`

/** 装饰模板。取自 §32-C：独立小型素材、透明背景、正俯视、统一比例。 */
export const DEFAULT_DECORATION_TEMPLATE = `{{CAMERA}}

RPG Maker MZ game asset.

Traditional ancient Chinese fantasy town {{OBJECT_TYPE}}.

{{OBJECT_DESCRIPTION}}

Standalone decoration asset with a fully transparent background and clean isolated edges.
Consistent scale with the other town decoration assets, designed to be placed on an RPG Maker MZ town map.

Consistent top-down lighting, consistent proportions, clean edges.

{{NEGATIVE}}`

/** 三套负面词。建筑用 §5 原文，地形用 §17 最全的一版。 */
export const DEFAULT_NEGATIVE = {
  building:
    'No characters, no people, no animals, no vehicles, no readable text, no UI, no modern objects, no photorealism.',
  terrain:
    'No buildings, no characters, no objects, no furniture, no text, no perspective, no shadows outside the tile, no photorealism.',
  decoration:
    'No characters, no people, no animals, no vehicles, no readable text, no UI, no modern objects, no photorealism. No background, no ground plane, no shadow outside the asset.',
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
  /** 视角约束，三套模板共用。 */
  cameraClause: string
  /** 统一美术风格块，建筑模板默认引用。 */
  styleBlock: string
  /** 三套负面词，按家族区分。 */
  negative: { building: string; terrain: string; decoration: string }
  templates: {
    building: string
    terrain: string
    /** 非拼接的地形独立件（木桥 / 码头 / 荷叶 / 芦苇）。 */
    terrainObject: string
    decoration: string
  }
  /** 只有一个提示词输入框时打开：把负面词拼到正面提示词末尾。 */
  appendNegativeInline: boolean
  /** 每次保存 +1。用于记忆化与「是否改过」判断。 */
  version: number
}

/** 模板里可以使用的全部占位符，用于设置面板里的提示。 */
export const TEMPLATE_VARS: Array<{ key: string; desc: string }> = [
  { key: '{{CAMERA}}', desc: '视角约束（全局共用）' },
  { key: '{{STYLE_BLOCK}}', desc: '统一美术风格块（全局共用）' },
  { key: '{{BUILDING_TYPE}}', desc: '建筑英文名' },
  { key: '{{BUILDING_SIZE}}', desc: '建筑尺寸' },
  { key: '{{BUILDING_FEATURES}}', desc: '建筑特征关键词（逗号连接）' },
  { key: '{{ARCHITECTURAL_DETAILS}}', desc: '建筑细节关键词（逗号连接）' },
  { key: '{{TERRAIN_SUBJECT}}', desc: '地形主体句' },
  { key: '{{TERRAIN_DESCRIPTION}}', desc: '地形材质与形态描述' },
  { key: '{{TERRAIN_AESTHETIC}}', desc: '地形质感与审美描述' },
  { key: '{{OBJECT_TYPE}}', desc: '装饰英文名' },
  { key: '{{OBJECT_DESCRIPTION}}', desc: '装饰外观描述' },
  { key: '{{NEGATIVE}}', desc: '负面词（可能为空，取决于下方开关）' },
]
