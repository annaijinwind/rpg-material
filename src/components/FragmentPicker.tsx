import type { Asset } from '../data/types'
import { FRAGMENT_GROUPS, type FragmentGroup } from '../data/fragments'
import { alreadyPresent, fragmentConflicts } from '../prompt/fragments'
import { useAppStore } from '../store/useAppStore'

/**
 * 额外构件勾选。
 *
 * 现有建筑自带的关键词一个字不动，这里是**往上加**。
 * 单选组（规模 / 院落 / 屋顶）是替换语义——选新的会把同组的旧词从基础里剔掉，
 * 不会出现「两个屋顶」。
 *
 * 每个构件背后是一句集中维护的英文（src/data/fragments.ts），
 * 改那一处，所有用到它的建筑一起变。
 */
export function FragmentPicker({ asset }: { asset: Asset }) {
  const setExtraFragments = useAppStore((s) => s.setExtraFragments)
  const selected = asset.extraFragments ?? []
  const conflicts = fragmentConflicts(asset, selected)

  const toggle = (group: FragmentGroup, fragmentId: string) => {
    const inGroup = group.fragments.map((f) => f.id)
    const isOn = selected.includes(fragmentId)

    if (group.mode === 'single') {
      setExtraFragments(
        asset.id,
        isOn
          ? selected.filter((id) => id !== fragmentId)
          : [...selected.filter((id) => !inGroup.includes(id)), fragmentId],
      )
      return
    }
    setExtraFragments(
      asset.id,
      isOn ? selected.filter((id) => id !== fragmentId) : [...selected, fragmentId],
    )
  }

  /** 单选组里，基础关键词已经命中的那一项（没勾选时也标出来，方便对比）。 */
  const baseHit = (group: FragmentGroup) => group.fragments.find((f) => alreadyPresent(asset, f.en))

  return (
    <>
      <div className="editor-hint">
        <span className="hint">
          在自带关键词之外再加点什么。单选组是替换，多选组是追加。
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setExtraFragments(asset.id, [])}
          >
            清空（{selected.length}）
          </button>
        )}
      </div>

      {conflicts.length > 0 && (
        <ul className="warn-list">
          {conflicts.map((w) => (
            <li key={w}>· {w}</li>
          ))}
        </ul>
      )}

      {FRAGMENT_GROUPS.map((group) => {
        const hit = baseHit(group)
        return (
          <div className="frag-group" key={group.id}>
            <div className="frag-group-head">
              <span className="frag-group-name">{group.zh}</span>
              <span className="hint">{group.hint}</span>
              {group.mode === 'single' && hit && !selected.some((id) => group.fragments.some((f) => f.id === id)) && (
                <span className="hint frag-base">基础里当前是「{hit.zh}」</span>
              )}
            </div>
            <div className="filter-row">
              {group.fragments.map((fragment) => {
                const on = selected.includes(fragment.id)
                const inBase = alreadyPresent(asset, fragment.en)
                return (
                  <button
                    key={fragment.id}
                    type="button"
                    className={on ? 'chip chip-active' : inBase ? 'chip chip-in-base' : 'chip'}
                    title={
                      inBase
                        ? `基础关键词里已经有了：${fragment.en}`
                        : fragment.en
                    }
                    onClick={() => toggle(group, fragment.id)}
                  >
                    {on && <span aria-hidden="true">✓ </span>}
                    {fragment.zh}
                    {inBase && !on && <span className="hint"> ·已有</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="hint" style={{ marginTop: 6 }}>
        构件措辞集中在 <span className="mono">src/data/fragments.ts</span> 一处，
        改那里所有建筑一起变——这是防词汇漂移的关键。
      </div>
    </>
  )
}
