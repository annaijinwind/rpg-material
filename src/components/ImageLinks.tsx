import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { copyText } from '../store/persist'
import { toast } from './Toast'

/**
 * 参考图，走链接模式。
 *
 * 图片本体放哪都行（图床、网盘、自己的服务器、Git 仓库），这里只存链接。
 * 一个素材可以挂多条——文档 §25 的流程是「一次生成多个候选，挑最符合风格的一个」，
 * 所以顺手把落选的也留着，方便回头对比。第一张作为列表里的缩略图。
 */

/** 链接看起来不太对时给个提示，但不阻止保存——图床链接形态五花八门。 */
function linkWarning(url: string): string | null {
  if (!url.trim()) return null
  if (!/^https?:\/\//i.test(url.trim())) return '不像是个网页链接（通常以 http:// 或 https:// 开头）'
  return null
}

/** 缩略图。链接打不开时不能只留一个破图标，得说清楚是链接的问题。 */
export function ImageThumb({
  url,
  className,
  alt,
}: {
  url: string
  className?: string
  alt?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!url.trim()) {
    return <span className={`${className ?? ''} thumb-empty`}>空链接</span>
  }
  if (failed) {
    return (
      <span className={`${className ?? ''} thumb-failed`} title={`链接打不开：${url}`}>
        链接失效
      </span>
    )
  }
  return (
    <img
      className={className}
      src={url}
      alt={alt ?? ''}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function ImageRow({
  url,
  index,
  isThumb,
  hasOthers,
  confirming,
  onEdit,
  onMakeThumb,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  url: string
  index: number
  isThumb: boolean
  hasOthers: boolean
  confirming: boolean
  onEdit: (next: string) => void
  onMakeThumb: () => void
  onAskDelete: () => void
  onCancelDelete: () => void
  onDelete: () => void
}) {
  // 空行（正在重贴链接）没什么可丢的，直接删，不用拦一道
  const trivial = !url.trim()

  return (
    <div className={confirming ? 'image-row image-row-confirming' : 'image-row'}>
      <a
        className="image-row-thumb"
        href={url || undefined}
        target="_blank"
        rel="noreferrer noopener"
        title="点开看大图"
      >
        <ImageThumb url={url} alt={`参考图 ${index + 1}`} />
      </a>

      <div className="image-row-main">
        <input
          className="input mono"
          value={url}
          spellCheck={false}
          onChange={(e) => onEdit(e.target.value)}
        />
        {isThumb ? (
          <span className="hint">列表缩略图用这张</span>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="换成列表缩略图"
            onClick={onMakeThumb}
          >
            设为缩略图
          </button>
        )}
      </div>

      {confirming ? (
        <div className="image-row-confirm">
          <span className="hint confirm-text">
            {isThumb && hasOthers ? '删掉它？缩略图会换成下一张' : '确定删除这条链接？'}
          </span>
          <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
            删除
          </button>
          <button type="button" className="btn btn-sm" onClick={onCancelDelete}>
            取消
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          title="删除这条链接"
          onClick={() => (trivial ? onDelete() : onAskDelete())}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export function ImageLinks({ assetId }: { assetId: string }) {
  // 不过滤空串：空行是「正在编辑」的正常状态，得留在列表里让输入框继续存在
  const images = useAppStore((s) => s.patches[assetId]?.images) ?? []
  const setImages = useAppStore((s) => s.setImages)
  const [draft, setDraft] = useState('')
  /** 正在等待二次确认的行号。同一时刻只允许一行进入确认态。 */
  const [confirming, setConfirming] = useState<number | null>(null)
  const realCount = images.filter(Boolean).length

  // 确认态晾着不管就自己收回去，免得一个误点让按钮一直停在危险态
  useEffect(() => {
    if (confirming === null) return
    const timer = setTimeout(() => setConfirming(null), 5000)
    return () => clearTimeout(timer)
  }, [confirming])

  // 换素材 / 列表长度变了就退出确认态：行号会对不上，留着可能误删
  useEffect(() => {
    setConfirming(null)
  }, [assetId, images.length])

  const updateAt = (i: number, next: string) => {
    const copy = [...images]
    copy[i] = next
    // 直接写回：改链接时缩略图会跟着刷新，改错了立刻能看出来
    setImages(assetId, copy)
  }

  const deleteAt = (i: number) => {
    setImages(assetId, images.filter((_, j) => j !== i))
    setConfirming(null)
    toast('已删除这条链接')
  }

  /** 支持一次粘一整批：换行、空格分开的都算。 */
  const addFromDraft = () => {
    const added = draft
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!added.length) return
    const seen = new Set(images.filter(Boolean))
    const fresh = added.filter((u) => !seen.has(u))
    if (!fresh.length) {
      toast('这些链接已经加过了')
      setDraft('')
      return
    }
    setImages(assetId, [...images, ...fresh])
    setDraft('')
    toast(`已添加 ${fresh.length} 条链接`)
  }

  return (
    <>
      {images.length === 0 ? (
        <div className="image-slot">
          <div>
            <div className="image-slot-icon">▢</div>
            <div className="hint">还没有加图，把生成好的图片链接粘到下面</div>
          </div>
        </div>
      ) : (
        <div className="image-list">
          {images.map((url, i) => (
            // 用下标做 key：拿 url 做 key 的话，改链接时整行会重挂载，输入框会掉焦点
            <ImageRow
              key={i}
              url={url}
              index={i}
              isThumb={i === 0}
              hasOthers={images.length > 1}
              confirming={confirming === i}
              onAskDelete={() => setConfirming(i)}
              onCancelDelete={() => setConfirming(null)}
              onEdit={(next) => updateAt(i, next)}
              onMakeThumb={() => {
                const copy = [...images]
                const [picked] = copy.splice(i, 1)
                setImages(assetId, [picked!, ...copy])
                toast('已设为列表缩略图')
              }}
              onDelete={() => deleteAt(i)}
            />
          ))}
        </div>
      )}

      <div className="search-row" style={{ marginTop: 8 }}>
        <input
          className="input mono"
          placeholder="粘贴图片链接，回车添加（可一次粘多条）"
          value={draft}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addFromDraft()
            }
          }}
        />
        <button type="button" className="btn btn-sm" disabled={!draft.trim()} onClick={addFromDraft}>
          添加
        </button>
      </div>

      {linkWarning(draft) && <div className="hint warn-text">{linkWarning(draft)}</div>}

      {realCount > 0 && (
        <div className="image-slot-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const ok = await copyText(images.filter(Boolean).join('\n'))
              toast(ok ? `已复制 ${realCount} 条链接` : '复制失败', !ok)
            }}
          >
            复制全部链接
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const ok = await copyText(images.find(Boolean) ?? '')
              toast(ok ? '缩略图链接已复制' : '复制失败', !ok)
            }}
          >
            复制缩略图链接
          </button>
        </div>
      )}

      <div className="hint" style={{ marginTop: 6 }}>
        图片本体存在哪里都行，这里只管链接。链接失效时缩略图会显示「链接失效」，
        换一条即可——换掉之后记得重新导出一次备份。
      </div>
    </>
  )
}
