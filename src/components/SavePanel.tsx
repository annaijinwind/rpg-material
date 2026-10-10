import { useMemo, useRef, useState } from 'react'
import { CATALOG_VERSION } from '../data/assets'
import { useAppStore } from '../store/useAppStore'
import { downloadText } from '../store/persist'
import {
  buildSaveFile,
  parseSaveFile,
  saveFileName,
  serializeSaveFile,
  SAVE_FORMAT_VERSION,
} from '../store/saveFile'
import { toast } from './Toast'

function formatTime(ts: number): string {
  if (!ts) return '还没导出过'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 存档的导出与导入。
 *
 * 存档就是一个 JSON 文件，你把它放进游戏工程里、跟着游戏工程一起提交 git，
 * 换机器时 pull 下来再导入即可。工具本身不关心这个文件你放在哪。
 */
export function SavePanel() {
  const close = useAppStore((s) => s.toggleSave)
  const patches = useAppStore((s) => s.patches)
  const customAssets = useAppStore((s) => s.customAssets)
  const style = useAppStore((s) => s.style)
  const lastExportAt = useAppStore((s) => s.lastExportAt)
  const markExported = useAppStore((s) => s.markExported)
  const applySave = useAppStore((s) => s.applySave)
  const resetAllPatches = useAppStore((s) => s.resetAllPatches)

  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ text: string; name: string } | null>(null)

  const count = Object.keys(patches).length

  /** 上次导出之后又动过的条目数——用来提醒「该提交了」。 */
  const dirtyCount = useMemo(() => {
    if (!lastExportAt) return count
    return Object.values(patches).filter((p) => (p.updatedAt ?? 0) > lastExportAt).length
  }, [patches, lastExportAt, count])

  const doExport = () => {
    const save = buildSaveFile(patches, style, customAssets)
    downloadText(saveFileName(save), serializeSaveFile(save), 'application/json')
    markExported()
    toast(
      `已导出存档（${save.patchCount} 项改动${save.customAssets.length ? `、${save.customAssets.length} 栋自建建筑` : ''}）`,
    )
  }

  /** 先读进来放着，等用户确认了再替换——替换是不可逆的。 */
  const pickFile = async (file: File) => {
    const text = await file.text()
    const result = parseSaveFile(text)
    if (!result.ok) {
      toast(result.message, true)
      return
    }
    setPending({ text, name: file.name })
  }

  const confirmImport = () => {
    if (!pending) return
    const result = parseSaveFile(pending.text)
    if (!result.ok) {
      toast(result.message, true)
      setPending(null)
      return
    }
    const { accepted, dropped, customAccepted, customDropped } = applySave(result.save)
    setPending(null)
    toast(
      `已导入 ${accepted} 项改动` +
        (customAccepted ? `、${customAccepted} 栋自建建筑` : '') +
        (dropped ? `，忽略 ${dropped} 项当前目录里没有的` : '') +
        (customDropped ? `，忽略 ${customDropped} 栋不合格的自建建筑` : '') +
        (result.legacy ? '（旧版存档格式）' : ''),
    )
  }

  const pendingPreview = pending ? parseSaveFile(pending.text) : null

  return (
    <div className="drawer-mask" onClick={() => close(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>存档</h2>
          <span className="card-spacer" />
          <button type="button" className="btn btn-sm" onClick={() => close(false)}>
            关闭
          </button>
        </div>

        <div className="drawer-body">
          <p className="hint" style={{ marginTop: 0 }}>
            存档是一个 JSON 文件，包含你所有的进度、备注、改过的提示词、图片链接和风格配置。
            <br />
            <b>建议把它放进你的游戏工程目录，跟着游戏工程一起提交 git</b>
            ——换机器时 pull 下来，打开这个面板导入即可。工具本身不关心你把它放在哪。
          </p>

          <div className="section">
            <div className="section-head">
              <h3>导出</h3>
              <span className="hint">
                当前 {count} 项有修改
                {customAssets.length ? ` · ${customAssets.length} 栋自建建筑` : ''} · 上次导出：
                {formatTime(lastExportAt)}
              </span>
            </div>
            {dirtyCount > 0 && lastExportAt > 0 && (
              <div className="warn-list">
                <li>上次导出之后又改了 {dirtyCount} 项，记得重新导出一份再提交</li>
              </div>
            )}
            <div className="filter-row">
              <button type="button" className="btn btn-primary btn-sm" onClick={doExport}>
                导出存档
              </button>
            </div>
            <p className="hint">
              导出会同时记录风格与模板配置。文件名带日期和条目数，方便区分新旧。
            </p>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>导入</h3>
              <span className="hint">会用文件内容替换当前状态</span>
            </div>

            {!pending ? (
              <div className="filter-row">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => fileInput.current?.click()}
                >
                  选择存档文件
                </button>
              </div>
            ) : (
              <div className="warn-list">
                <li>
                  即将导入 <b>{pending.name}</b>
                  {pendingPreview?.ok && (
                    <>
                      ：{pendingPreview.save.patchCount} 项
                      {pendingPreview.save.exportedAt &&
                        `，导出于 ${pendingPreview.save.exportedAt.slice(0, 16).replace('T', ' ')}`}
                      {pendingPreview.legacy && '（旧版格式，不含风格配置）'}
                    </>
                  )}
                </li>
                {count > 0 && (
                  <li>
                    当前浏览器里有 {count} 项修改，<b>导入后会被文件内容整体替换掉</b>
                    。想留着就先导出一份。
                  </li>
                )}
                {count === 0 && <li>当前浏览器里没有数据，导入不会覆盖任何东西。</li>}
                <div className="filter-row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={confirmImport}>
                    确认导入
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => setPending(null)}>
                    取消
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) await pickFile(file)
                e.target.value = ''
              }}
            />
          </div>

          <div className="section">
            <div className="section-head">
              <h3>清空</h3>
            </div>
            <div className="filter-row">
              <button
                type="button"
                className="btn btn-sm"
                disabled={!count}
                onClick={() => {
                  if (!window.confirm(`确定要清掉全部 ${count} 项的进度、备注和修改吗？`)) return
                  resetAllPatches()
                  toast('已清空全部本地修改')
                }}
              >
                清空浏览器里的全部修改
              </button>
            </div>
            <p className="hint">只清浏览器里这份，不影响你已经导出的存档文件。</p>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>文件格式</h3>
            </div>
            <div className="field-list">
              <div className="field-item">
                <span className="tag mono">formatVersion</span>
                <span className="hint">当前 v{SAVE_FORMAT_VERSION}，以后改结构靠它识别老存档</span>
              </div>
              <div className="field-item">
                <span className="tag mono">catalogVersion</span>
                <span className="hint">当前 v{CATALOG_VERSION}</span>
              </div>
            </div>
            <p className="hint">
              存档按素材 id 排序后写出。每个素材在文件里的位置是固定的，
              所以 git diff 干净，两台机器改了不同素材时也能自动合并。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
