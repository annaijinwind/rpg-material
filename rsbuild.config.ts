import path from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './src/index.html',
    title: '中式 RPG 素材台 · Krea 2 × RPG Maker MZ',
  },
  source: {
    entry: { index: './src/main.tsx' },
    // Rsbuild 不读 tsconfig 的 paths，别名必须在这里再声明一次。
    alias: { '@': path.join(import.meta.dirname, 'src') },
  },
  output: {
    distPath: { root: 'dist' },
    // 相对路径，方便丢到子目录或静态托管上。
    assetPrefix: './',
  },
  server: {
    port: 5173,
    open: false,
  },
})
