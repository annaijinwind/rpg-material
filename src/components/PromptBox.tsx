import { useEffect, useState } from 'react'
import { templateNameFor } from '../prompt/buildPrompt'
import type { PromptRow } from '../store/selectors'
import { useAppStore } from '../store/useAppStore'
import { copyText } from '../store/persist'
import { toast } from './Toast'

/**
 * 提示词面板。这是整个工具的主产出。
 *
 * 默认直接显示模板生成的结果，一眼可复制；需要微调时点「编辑」，
 * 改完存成这个素材的覆盖版本，之后列表里导出、复制的都是改过的那一版。
 */
export function PromptBox({ row }: { row: PromptRow }) {
  const { asset, prompt } = row
  const patch = useAppStore((s) => s.patches[asset.id])
  const setPositiveOverride = useAppStore((s) => s.setPositiveOverride)
  const style = useAppStore((s) => s.style)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prompt.positive)
  const [showParts, setShowParts] = useState(false)

  // 只在这个素材被换掉时退出编辑态。
  // 不能依赖 prompt.positive：下面的关键词编辑会实时改变它，
  // 那样用户正在写的草稿会被冲掉。
  useEffect(() => {
    setEditing(false)
  }, [asset.id])

  const overridden = Boolean(patch?.positiveOverride)

  const copy = async (text: string, label: string) => {
    const ok = await copyText(text)
    toast(ok ? `${label}已复制` : '复制失败，请手动选中复制', !ok)
  }

  return (
    <>
      <div className="section-head">
        <h3>提示词</h3>
        <div className="section-actions">
          {!editing && (
            <>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setDraft(prompt.positive)
                  setEditing(true)
                }}
              >
                编辑
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => void copy(prompt.positive, '正面提示词')}
              >
                复制正面
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => void copy(prompt.negative, '负面提示词')}
                disabled={!prompt.negative}
              >
                复制负面
              </button>
              <button
                type="button"
                className="btn btn-sm"
                title="只有一个输入框时用这份"
                onClick={() => void copy(prompt.combined, '合并提示词')}
              >
                复制合并
              </button>
            </>
          )}
        </div>
      </div>

      <div className="editor-hint">
        <span className="hint">
          {templateNameFor(asset)} · {prompt.wordCount} 词
          {overridden && ' · 已用你的修改版本'}
        </span>
        <span className="hint">
          {style.appendNegativeInline ? '负面词已并入正面提示词' : '负面词单独输出'}
        </span>
      </div>

      {prompt.warnings.length > 0 && (
        <ul className="warn-list">
          {prompt.warnings.map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      )}

      {editing ? (
        <>
          <textarea
            className="textarea"
            style={{ minHeight: 300 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
          />
          <div className="image-slot-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPositiveOverride(asset.id, draft)
                setEditing(false)
                toast('已保存这项的提示词修改')
              }}
            >
              保存
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setEditing(false)
                setDraft(prompt.positive)
              }}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-sm"
              disabled={!overridden}
              title="丢弃本地修改，回到模板生成的结果"
              onClick={() => {
                setPositiveOverride(asset.id, undefined)
                toast('已恢复为模板生成结果')
              }}
            >
              恢复模板生成
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="prompt-block">
            <div className="prompt-block-head">
              <span>正面提示词</span>
              <span className="card-spacer" />
              <span className="hint">粘到 Krea 的提示词框</span>
            </div>
            <div className="prompt-block-body">{prompt.positive}</div>
          </div>

          {prompt.negative && (
            <div className="prompt-block">
              <div className="prompt-block-head">
                <span>负面提示词</span>
                <span className="card-spacer" />
                <span className="hint">粘到 Krea 的负面框</span>
              </div>
              <div className="prompt-block-body">{prompt.negative}</div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowParts((v) => !v)}
          >
            {showParts ? '▾' : '▸'} 各部分拆解（看清这串是怎么拼出来的）
          </button>

          {showParts && (
            <div style={{ marginTop: 6 }}>
              {prompt.parts.map((part) => (
                <div className="prompt-block" key={part.key}>
                  <div className="prompt-block-head">
                    <span>{part.label}</span>
                    <span className="card-spacer" />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => void copy(part.value, part.label)}
                    >
                      复制
                    </button>
                  </div>
                  <div className="prompt-block-body">{part.value}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
