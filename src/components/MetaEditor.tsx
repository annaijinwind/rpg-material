import { useState } from 'react'
import type { Asset } from '../data/types'
import { ASSET_BY_ID } from '../data/assets'
import { useAppStore, type AssetPatch } from '../store/useAppStore'

type Fields = NonNullable<AssetPatch['fields']>

/** 可编辑字段的快照，用来和 seed 比对出「哪些被改过」。 */
function snapshot(asset: Asset) {
  return {
    zh: asset.zh,
    en: asset.en,
    size: asset.size ?? '',
    features: asset.features ?? [],
    details: asset.details ?? [],
    aesthetic: asset.aesthetic ?? '',
  }
}

type Snapshot = ReturnType<typeof snapshot>

/**
 * 相对于 seed 算出完整差异。
 *
 * 基线必须是 seed 而不是当前生效的 asset：否则「把尺寸清空」这类改动在第一次
 * 提交后就不再算差异，下一次编辑别的字段时会把它悄悄丢掉。
 * 返回完整集合配合 setFields 的整体替换语义，两边就自洽了。
 */
function diffFromSeed(seed: Asset, draft: Snapshot): Fields {
  const base = snapshot(seed)
  const fields: Fields = {}
  if (draft.zh !== base.zh) fields.zh = draft.zh
  if (draft.en !== base.en) fields.en = draft.en
  if (draft.size !== base.size) fields.size = draft.size
  if (draft.aesthetic !== base.aesthetic) fields.aesthetic = draft.aesthetic
  if (draft.features.join('\n') !== base.features.join('\n')) {
    fields.features = draft.features.map((s) => s.trim()).filter(Boolean)
  }
  if (draft.details.join('\n') !== base.details.join('\n')) {
    fields.details = draft.details.map((s) => s.trim()).filter(Boolean)
  }
  return fields
}

/**
 * 关键词字段编辑。
 *
 * 直接读写 store，不存本地草稿——每次按键立刻生效，上面的提示词同一帧就更新。
 * 之前用「本地草稿 + 防抖落盘」的写法会在首次提交后触发重挂载，输入框会掉焦点。
 */
export function MetaEditor({ asset }: { asset: Asset }) {
  const setFields = useAppStore((s) => s.setFields)
  const seed = ASSET_BY_ID.get(asset.id) ?? asset
  const draft = snapshot(asset)

  const update = (next: Snapshot) => {
    const fields = diffFromSeed(seed, next)
    setFields(asset.id, Object.keys(fields).length ? fields : undefined)
  }

  const changed = Object.keys(diffFromSeed(seed, draft)).length > 0

  return (
    <div>
      <div className="field-row">
        <label className="field-label" htmlFor="meta-zh">
          中文名
        </label>
        <input
          id="meta-zh"
          className="input"
          value={draft.zh}
          onChange={(e) => update({ ...draft, zh: e.target.value })}
        />
      </div>

      <div className="field-row">
        <label className="field-label" htmlFor="meta-en">
          英文名
        </label>
        <input
          id="meta-en"
          className="input"
          value={draft.en}
          spellCheck={false}
          onChange={(e) => update({ ...draft, en: e.target.value })}
        />
      </div>

      {asset.family === 'building' && (
        <div className="field-row">
          <label className="field-label" htmlFor="meta-size">
            建筑尺寸
          </label>
          <input
            id="meta-size"
            className="input"
            value={draft.size}
            placeholder="medium-sized single-story building"
            spellCheck={false}
            onChange={(e) => update({ ...draft, size: e.target.value })}
          />
        </div>
      )}

      <KeywordList
        label={asset.family === 'building' ? '建筑特征' : '主体描述'}
        items={draft.features}
        onChange={(features) => update({ ...draft, features })}
      />

      {asset.family === 'building' && (
        <KeywordList
          label="建筑细节"
          items={draft.details}
          onChange={(details) => update({ ...draft, details })}
        />
      )}

      {asset.family === 'terrain' && (
        <div className="field-row">
          <label className="field-label" htmlFor="meta-aesthetic">
            质感审美
          </label>
          <textarea
            id="meta-aesthetic"
            className="textarea"
            style={{ minHeight: 60 }}
            value={draft.aesthetic}
            spellCheck={false}
            placeholder="留空则不输出这一段"
            onChange={(e) => update({ ...draft, aesthetic: e.target.value })}
          />
        </div>
      )}

      <div className="editor-hint">
        <span className="hint">
          {changed
            ? '已改动，改动即时生效并自动保存到本地'
            : '改动会立刻反映到上面的提示词，并自动保存到本地'}
        </span>
      </div>
    </div>
  )
}

function KeywordList({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [bulk, setBulk] = useState(false)
  const [bulkText, setBulkText] = useState('')

  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      <div>
        {bulk ? (
          <>
            <textarea
              className="textarea"
              style={{ minHeight: 120 }}
              value={bulkText}
              spellCheck={false}
              placeholder="一行一条，逗号不用写"
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="image-slot-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setBulk(false)
                  onChange(
                    bulkText
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }}
              >
                应用
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setBulk(false)}>
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="field-list">
              {items.map((item, i) => (
                <div className="field-item" key={i}>
                  <input
                    className="input"
                    value={item}
                    spellCheck={false}
                    onChange={(e) => {
                      const next = [...items]
                      next[i] = e.target.value
                      onChange(next)
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="删除这条"
                    onClick={() => onChange(items.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="image-slot-actions">
              <button type="button" className="btn btn-sm" onClick={() => onChange([...items, ''])}>
                + 添加一条
              </button>
              <button
                type="button"
                className="btn btn-sm"
                title="一行一条，适合整段粘贴"
                onClick={() => {
                  setBulkText(items.join('\n'))
                  setBulk(true)
                }}
              >
                多行编辑
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
