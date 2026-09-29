import { useMemo } from 'react'
import { CATEGORY_ORDER, FAMILY_LABEL, categoryLabel, type AssetStatus } from '../data/types'
import { useAppStore } from '../store/useAppStore'
import { filterAssets, useEffectiveAssets } from '../store/selectors'

interface Bucket {
  total: number
  done: number
}

/**
 * 分类树。
 *
 * 计数基于「当前筛选结果」而排除分类本身——这样选中某个分类后，
 * 旁边的数字仍然告诉你还有多少同类素材，而不是塌成 0。
 * done 的口径是「已生成 + 已通过」，也就是能拿去拼地图的数量。
 */
export function Sidebar() {
  const assets = useEffectiveAssets()
  const patches = useAppStore((s) => s.patches)
  const query = useAppStore((s) => s.query)
  const setQuery = useAppStore((s) => s.setQuery)
  const select = useAppStore((s) => s.select)

  const { byCategory, byFamily, overall } = useMemo(() => {
    const statusOf = (id: string) => patches[id]?.status ?? 'todo'
    const scoped = filterAssets(assets, { ...query, categories: [] }, statusOf)
    const isDone = (s: AssetStatus) => s === 'generated' || s === 'approved'

    const byCategory: Record<string, Bucket> = {}
    const byFamily: Record<string, Bucket> = {}
    const overall: Bucket = { total: 0, done: 0 }

    for (const asset of scoped) {
      const status = statusOf(asset.id)
      const done = isDone(status) ? 1 : 0
      const cat = (byCategory[asset.category] ??= { total: 0, done: 0 })
      cat.total++
      cat.done += done
      const fam = (byFamily[asset.family] ??= { total: 0, done: 0 })
      fam.total++
      fam.done += done
      overall.total++
      overall.done += done
    }
    return { byCategory, byFamily, overall }
  }, [assets, patches, query])

  const activeCategory = query.categories.length === 1 ? query.categories[0] : null

  const pickCategory = (name: string | null) => {
    setQuery({ categories: name ? [name] : [] })
    select(null)
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-search">
        <button
          type="button"
          className={activeCategory === null ? 'cat-item active' : 'cat-item'}
          onClick={() => pickCategory(null)}
        >
          <span className="cat-name">全部素材</span>
          <span className="cat-count">
            {overall.done}/{overall.total}
          </span>
        </button>
      </div>

      {CATEGORY_ORDER.map(({ family, categories }) => {
        const familyBucket = byFamily[family]
        if (!familyBucket) return null
        const visibleCategories = categories.filter((c) => byCategory[c])
        if (!visibleCategories.length) return null

        return (
          <div className="cat-group" key={family}>
            <div className="cat-group-head">
              {FAMILY_LABEL[family]} · {familyBucket.done}/{familyBucket.total}
            </div>
            {visibleCategories.map((name) => {
              const bucket = byCategory[name]!
              return (
                <button
                  key={name}
                  type="button"
                  className={
                    (activeCategory === name ? 'cat-item active' : 'cat-item') +
                    (bucket.done === bucket.total ? ' done' : '')
                  }
                  onClick={() => pickCategory(name)}
                >
                  <span className="cat-name">{categoryLabel(name)}</span>
                  <span className="cat-count">
                    {bucket.done}/{bucket.total}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}

      <div className="sidebar-foot">
        <div className="hint">
          <span className="kbd">Ctrl/⌘ K</span> 搜索 · <span className="kbd">↑</span>
          <span className="kbd">↓</span> 切换素材
        </div>
        <div className="hint" style={{ marginTop: 6 }}>
          数字为「已生成 / 总数」
        </div>
      </div>
    </nav>
  )
}
