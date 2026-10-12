import { useEffect, useState } from 'react'
import { REFERENCES } from '../data/references'
import { useAppStore } from '../store/useAppStore'

/**
 * 设计图查看。
 *
 * 就是开发时随手翻一翻的东西，所以做得很轻：一排缩略图，点开全屏，
 * 左右方向键在几张之间切。不做缩放、不做标注——真要看细节按 Esc 关掉，
 * 用系统看图工具打开原文件更实在。
 */
export function ReferencePanel() {
  const close = useAppStore((s) => s.toggleRefs)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [missing, setMissing] = useState<Record<string, boolean>>({})

  const current = openIndex === null ? null : REFERENCES[openIndex]

  // 全屏时用方向键翻页、Esc 关闭
  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex((i) => ((i ?? 0) + 1) % REFERENCES.length)
      if (e.key === 'ArrowLeft') {
        setOpenIndex((i) => ((i ?? 0) - 1 + REFERENCES.length) % REFERENCES.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex])

  return (
    <div className="drawer-mask" onClick={() => close(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>设计图</h2>
          <span className="hint">{REFERENCES.length} 张 · 点开看大图，Esc 关闭</span>
          <span className="card-spacer" />
          <button type="button" className="btn btn-sm" onClick={() => close(false)}>
            关闭
          </button>
        </div>

        <div className="drawer-body">
          {REFERENCES.length === 0 ? (
            <div className="empty">
              <p>还没有参考图</p>
            </div>
          ) : (
            <div className="ref-grid">
              {REFERENCES.map((ref, i) => (
                <button
                  type="button"
                  className="ref-card"
                  key={ref.file}
                  onClick={() => {
                    if (missing[ref.file]) return
                    setOpenIndex(i)
                  }}
                >
                  <div className="ref-thumb">
                    {missing[ref.file] ? (
                      <span className="thumb-failed">图片没找到</span>
                    ) : (
                      <img
                        src={ref.file}
                        alt={ref.title}
                        loading="lazy"
                        onError={() => setMissing((m) => ({ ...m, [ref.file]: true }))}
                      />
                    )}
                  </div>
                  <div className="ref-meta">
                    <span className="ref-title">{ref.title}</span>
                    {ref.note && <span className="hint">{ref.note}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="hint" style={{ marginTop: 14 }}>
            图片放在 <span className="mono">public/设计图/</span>。
            换图或加图之后，到 <span className="mono">src/data/references.ts</span> 里改一下清单——
            纯静态站点没有目录列表，不写进去页面就看不见。
            <br />
            <b>注意放在项目根目录是不行的</b>，rsbuild 不会服务那里的文件。
          </div>
        </div>
      </div>

      {current && (
        <div
          className="ref-lightbox"
          onClick={(e) => {
            e.stopPropagation()
            setOpenIndex(null)
          }}
        >
          <img src={current.file} alt={current.title} onClick={(e) => e.stopPropagation()} />
          <div className="ref-lightbox-bar">
            <button
              type="button"
              className="btn btn-sm"
              onClick={(e) => {
                e.stopPropagation()
                setOpenIndex((i) => ((i ?? 0) - 1 + REFERENCES.length) % REFERENCES.length)
              }}
            >
              ←
            </button>
            <span>{current.title}</span>
            <span className="hint">
              {(openIndex ?? 0) + 1} / {REFERENCES.length}
            </span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={(e) => {
                e.stopPropagation()
                setOpenIndex((i) => ((i ?? 0) + 1) % REFERENCES.length)
              }}
            >
              →
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={(e) => {
                e.stopPropagation()
                setOpenIndex(null)
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
