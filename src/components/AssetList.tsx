import { STATUS_LABEL, categoryLabel, type Asset } from '../data/types'
import { buildPrompt } from '../prompt/buildPrompt'
import { useAppStore } from '../store/useAppStore'
import { useFilteredAssets } from '../store/selectors'
import { copyText } from '../store/persist'
import { ImageThumb } from './ImageLinks'
import { toast } from './Toast'

function phaseTag(phase?: number): string | null {
  if (!phase) return null
  return `第${['一', '二', '三'][phase - 1]}期`
}

export function AssetList() {
  const assets = useFilteredAssets()
  const patches = useAppStore((s) => s.patches)
  const style = useAppStore((s) => s.style)
  const selectedId = useAppStore((s) => s.selectedId)
  const select = useAppStore((s) => s.select)
  const cycleStatus = useAppStore((s) => s.cycleStatus)

  if (!assets.length) {
    return (
      <div className="empty">
        <div>
          <div style={{ fontSize: 24, opacity: 0.4 }}>空</div>
          <p>没有匹配的素材，换个关键词或点「重置筛选」</p>
        </div>
      </div>
    )
  }

  /** 卡片上直接复制，省掉「先点开、再点复制」这一步。 */
  const copyFromCard = async (asset: Asset) => {
    const patch = patches[asset.id]
    const built = buildPrompt(asset, style)
    const text = patch?.positiveOverride ?? built.positive
    const ok = await copyText(text)
    toast(ok ? `已复制「${asset.zh}」提示词` : '复制失败，请手动选中复制', !ok)
  }

  return (
    <div className="list-scroll">
      {assets.map((asset) => {
        const patch = patches[asset.id]
        const status = patch?.status ?? 'todo'
        const edited = Boolean(patch?.positiveOverride || patch?.fields)
        const phase = phaseTag(asset.phase)
        const thumb = patch?.images?.find(Boolean)

        return (
          <div
            key={asset.id}
            data-asset-id={asset.id}
            className={asset.id === selectedId ? 'asset-card active' : 'asset-card'}
            role="button"
            tabIndex={0}
            onClick={() => select(asset.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                select(asset.id)
              }
            }}
          >
            <div className="asset-card-inner">
              {thumb && <ImageThumb className="asset-thumb" url={thumb} alt={asset.zh} />}
              <div className="asset-card-main">
                <div className="asset-card-top">
                  <i
                    className={`status-dot status-${status}`}
                    title={`状态：${STATUS_LABEL[status]}（点一下切换）`}
                  />
                  <span className="asset-zh">{asset.zh}</span>
                  {edited && (
                    <span className="edited-mark" title="这项有本地修改">
                      ●已改
                    </span>
                  )}
                  <span className="card-spacer" />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="复制这项的提示词"
                    onClick={(e) => {
                      e.stopPropagation()
                      void copyFromCard(asset)
                    }}
                  >
                    复制
                  </button>
                </div>
                <div className="asset-en" title={asset.en}>
                  {asset.en}
                </div>
                <div className="asset-card-meta">
                  <span className="tag">{categoryLabel(asset.category)}</span>
                  {phase && <span className="tag">{phase}</span>}
                  <span className="card-spacer" />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm hint"
                    title="切换生成状态"
                    onClick={(e) => {
                      e.stopPropagation()
                      cycleStatus(asset.id)
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
