import { useEffect } from 'react'
import { AssetDetail } from './components/AssetDetail'
import { BatchPanel } from './components/BatchPanel'
import { Sidebar } from './components/Sidebar'
import { StyleSettings } from './components/StyleSettings'
import { AssetList } from './components/AssetList'
import { ReferencePanel } from './components/ReferencePanel'
import { SavePanel } from './components/SavePanel'
import { Toolbar, focusSearch } from './components/Toolbar'
import { ToastHost } from './components/Toast'
import { useAppStore } from './store/useAppStore'
import { useFilteredAssets, useStats } from './store/selectors'

function Header() {
  const stats = useStats()
  const openSettings = useAppStore((s) => s.toggleSettings)
  const openBatch = useAppStore((s) => s.toggleBatch)
  const openSave = useAppStore((s) => s.toggleSave)
  const openRefs = useAppStore((s) => s.toggleRefs)

  const done = stats.byStatus.generated + stats.byStatus.approved
  const percent = stats.total ? Math.round((done / stats.total) * 100) : 0

  return (
    <header className="app-header">
      <div className="brand">
        <h1>中式 RPG 素材台</h1>
        <span className="brand-sub">Krea 2 × RPG Maker MZ</span>
      </div>
      <div className="header-spacer" />
      <div className="header-progress" title={`已生成 / 已通过 ${done} 项，共 ${stats.total} 项`}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span>
          {done} / {stats.total}
        </span>
      </div>
      <button type="button" className="btn" onClick={() => openRefs(true)}>
        设计图
      </button>
      <button type="button" className="btn" onClick={() => openSave(true)}>
        存档
      </button>
      <button type="button" className="btn" onClick={() => openSettings(true)}>
        风格与模板
      </button>
      <button type="button" className="btn" onClick={() => openBatch(true)}>
        批量导出
      </button>
    </header>
  )
}

export default function App() {
  const sidebarWidth = useAppStore((s) => s.sidebarWidth)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const batchOpen = useAppStore((s) => s.batchOpen)
  const saveOpen = useAppStore((s) => s.saveOpen)
  const refsOpen = useAppStore((s) => s.refsOpen)
  const selectedId = useAppStore((s) => s.selectedId)
  const select = useAppStore((s) => s.select)
  const assets = useFilteredAssets()

  // 列表顺序变化后，用方向键在当前结果里逐条走。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        focusSearch()
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return

      e.preventDefault()
      const index = assets.findIndex((a) => a.id === selectedId)
      const next =
        e.key === 'ArrowDown'
          ? assets[Math.min(assets.length - 1, index + 1)]
          : assets[Math.max(0, index - 1)]
      if (next) {
        select(next.id)
        document
          .querySelector(`[data-asset-id="${CSS.escape(next.id)}"]`)
          ?.scrollIntoView({ block: 'nearest' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [assets, selectedId, select])

  return (
    <div className="app">
      <Header />
      <div
        className="app-body"
        style={{ ['--sidebar-w' as string]: `${sidebarWidth}px` }}
      >
        <Sidebar />
        <main className="list-pane">
          <Toolbar />
          <AssetList />
        </main>
        <section className="detail">
          <AssetDetail />
        </section>
      </div>
      {refsOpen && <ReferencePanel />}
      {saveOpen && <SavePanel />}
      {settingsOpen && <StyleSettings />}
      {batchOpen && <BatchPanel />}
      <ToastHost />
    </div>
  )
}
