import { useEffect, useRef, useState } from 'react'
import { FAMILY_LABEL, STATUS_LABEL, type AssetFamily, type AssetStatus } from '../data/types'
import { useAppStore } from '../store/useAppStore'
import { useFilteredAssets } from '../store/selectors'

export const SEARCH_INPUT_ID = 'asset-search'

/** 供全局快捷键聚焦搜索框。 */
export function focusSearch(): void {
  const el = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null
  el?.focus()
  el?.select()
}

const FAMILIES: AssetFamily[] = ['building', 'terrain', 'decoration']
const STATUSES: AssetStatus[] = ['todo', 'generated', 'approved', 'rejected']
const PHASES = [1, 2, 3] as const

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function Toolbar() {
  const query = useAppStore((s) => s.query)
  const setQuery = useAppStore((s) => s.setQuery)
  const resetQuery = useAppStore((s) => s.resetQuery)
  const results = useFilteredAssets()

  // 输入框用本地草稿，避免受控组件在中文输入法组词阶段被打断。
  const [draft, setDraft] = useState(query.text)
  const composing = useRef(false)

  useEffect(() => {
    setDraft(query.text)
  }, [query.text])

  const commit = (text: string) => setQuery({ text })

  const phaseRelevant = query.families.length === 0 || query.families.includes('building')
  const hasFilter = Boolean(
    query.text ||
      query.families.length ||
      query.categories.length ||
      query.phases.length ||
      query.statuses.length,
  )

  return (
    <div className="list-toolbar">
      <div className="search-row">
        <span className="search-icon">⌕</span>
        <input
          id={SEARCH_INPUT_ID}
          className="input"
          type="search"
          placeholder="搜素材：中文名 / 英文 / 简拼 / 关键词"
          value={draft}
          title="按 Ctrl/⌘ + K 快速聚焦"
          onCompositionStart={() => {
            composing.current = true
          }}
          onCompositionEnd={(e) => {
            composing.current = false
            setDraft(e.currentTarget.value)
            commit(e.currentTarget.value)
          }}
          onChange={(e) => {
            setDraft(e.target.value)
            // 输入法组词中间态不提交，否则「tiejiang」会先筛出空结果闪一下
            if (!composing.current) commit(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft('')
              commit('')
            }
          }}
        />
        {draft && (
          <button
            type="button"
            className="search-clear"
            title="清空"
            onClick={() => {
              setDraft('')
              commit('')
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-row">
        <span className="filter-label">类别</span>
        {FAMILIES.map((f) => (
          <button
            key={f}
            type="button"
            className={query.families.includes(f) ? 'chip chip-active' : 'chip'}
            onClick={() => setQuery({ families: toggle(query.families, f) })}
          >
            {FAMILY_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <span className="filter-label">状态</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={query.statuses.includes(s) ? 'chip chip-active' : 'chip'}
            onClick={() => setQuery({ statuses: toggle(query.statuses, s) })}
          >
            <i className={`status-dot status-${s}`} />
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {phaseRelevant && (
        <div className="filter-row">
          <span className="filter-label">阶段</span>
          {PHASES.map((p) => (
            <button
              key={p}
              type="button"
              className={query.phases.includes(p) ? 'chip chip-active' : 'chip'}
              title="仅建筑有阶段划分，来自文档 §13"
              onClick={() => setQuery({ phases: toggle(query.phases, p) })}
            >
              {['一', '二', '三'][p - 1]}期
            </button>
          ))}
        </div>
      )}

      <div className="result-line">
        <span>
          共 <b>{results.length}</b> 项
          {query.text.trim() && ' · 按相关度排序'}
        </span>
        {hasFilter && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetQuery}>
            重置筛选
          </button>
        )}
      </div>
    </div>
  )
}
