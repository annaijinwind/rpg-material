import { FAMILY_LABEL, STATUS_LABEL, categoryLabel, type AssetStatus } from '../data/types'
import { suggestedPath } from '../data/assets'
import { useAppStore } from '../store/useAppStore'
import { useSelectedRow } from '../store/selectors'
import { ImageLinks } from './ImageLinks'
import { MetaEditor } from './MetaEditor'
import { PromptBox } from './PromptBox'
import { toast } from './Toast'
import { copyText } from '../store/persist'

const STATUSES: AssetStatus[] = ['todo', 'generated', 'approved', 'rejected']

export function AssetDetail() {
  const row = useSelectedRow()
  const setStatus = useAppStore((s) => s.setStatus)
  const setNote = useAppStore((s) => s.setNote)
  const resetAsset = useAppStore((s) => s.resetAsset)
  const patches = useAppStore((s) => s.patches)
  const selectedId = useAppStore((s) => s.selectedId)

  if (!row) {
    return (
      <div className="empty">
        <div>
          <div style={{ fontSize: 28, opacity: 0.35 }}>左</div>
          <p>从左边点一个素材，这里会立刻生成它的提示词</p>
          <p className="hint">也可以直接点卡片上的「复制」，跳过预览这一步</p>
        </div>
      </div>
    )
  }

  const { asset } = row
  const patch = selectedId ? patches[selectedId] : undefined
  const status = patch?.status ?? 'todo'
  const path = suggestedPath(asset)
  const hasLocalChanges = Boolean(
    patch?.positiveOverride || patch?.fields || patch?.note || patch?.status || patch?.images?.length,
  )

  return (
    <>
      <div className="detail-head">
        <div className="detail-title">
          <h2>{asset.zh}</h2>
          <span className="detail-en mono">{asset.en}</span>
        </div>
        <div className="detail-sub">
          <span className="tag">{FAMILY_LABEL[asset.family]}</span>
          <span className="tag">{categoryLabel(asset.category)}</span>
          {asset.phase && <span className="tag">第{['一', '二', '三'][asset.phase - 1]}期</span>}
          {asset.tileable === false && <span className="tag">独立件</span>}
          <span className="card-spacer" />
          {hasLocalChanges && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title="清掉这项的状态、备注和所有本地修改"
              onClick={() => {
                resetAsset(asset.id)
                toast(`已还原「${asset.zh}」的本地修改`)
              }}
            >
              还原本地修改
            </button>
          )}
        </div>
        <div className="detail-sub">
          <span className="filter-label" style={{ marginRight: 2 }}>
            状态
          </span>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={status === s ? 'chip chip-active' : 'chip'}
              onClick={() => setStatus(asset.id, s)}
            >
              <i className={`status-dot status-${s}`} />
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-body">
        <div className="section">
          <div className="section-head">
            <h3>参考图</h3>
            <span className="hint">链接模式，图片存在哪里都行</span>
          </div>
          <ImageLinks assetId={asset.id} />
        </div>

        <div className="section">
          <PromptBox row={row} />
        </div>

        <div className="section">
          <div className="section-head">
            <h3>关键词字段</h3>
          </div>
          <MetaEditor asset={asset} />
        </div>

        <div className="section">
          <div className="section-head">
            <h3>备注与落地位置</h3>
          </div>
          <div className="field-row">
            <span className="field-label">建议目录</span>
            <div className="field-item">
              <input className="input mono" readOnly value={path} />
              <button
                type="button"
                className="btn btn-sm"
                onClick={async () => {
                  const ok = await copyText(path)
                  toast(ok ? '路径已复制' : '复制失败', !ok)
                }}
              >
                复制
              </button>
            </div>
          </div>
          <div className="field-row">
            <label className="field-label" htmlFor="asset-note">
              备注
            </label>
            <textarea
              id="asset-note"
              className="textarea"
              style={{ minHeight: 64, fontFamily: 'var(--font-sans)', fontSize: 12 }}
              placeholder="记一下这一版哪里不对、下次要改什么"
              value={patch?.note ?? ''}
              onChange={(e) => setNote(asset.id, e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
