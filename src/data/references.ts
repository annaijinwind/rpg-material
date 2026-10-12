/**
 * 参考图。
 *
 * 纯静态站点没有目录列表，所以这份清单是手写的——加了新图就在这里补一行。
 * 文件放在 `public/设计图/` 下：开发时按原路径服务，构建时原样拷进 dist，
 * 不需要任何额外配置。放在项目根目录是不行的，rsbuild 不会服务它。
 *
 * 路径刻意不带开头的斜杠，这样部署到子目录时也能正确解析。
 * （构建产物用的是 `assetPrefix: './'`。）
 */
export interface ReferenceImage {
  /** 相对 public 的路径。 */
  file: string
  title: string
  note?: string
}

export const REFERENCES: ReferenceImage[] = [
  {
    file: '设计图/四镇RPG地图设计总览.png',
    title: '四镇 RPG 地图设计总览',
    note: '四种城镇的整体布局',
  },
  {
    file: '设计图/五种RPG村落地图设计图鉴.png',
    title: '五种 RPG 村落地图设计图鉴',
    note: '小规模村落的排版参考',
  },
  {
    file: '设计图/六种风格村庄地图设计集.png',
    title: '六种风格村庄地图设计集',
    note: '同一规模下的不同风格',
  },
]
