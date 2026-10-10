import type { Asset } from '../data/types'
import { FRAGMENT_GROUPS } from '../data/fragments'

/**
 * 把勾选的构件 id 解析成英文短语。
 *
 * 刻意按**构件库的顺序**输出，而不是用户勾选的顺序——这样同样的选择无论怎么点出来，
 * 提示词都是同一串，存档 diff 也稳定。
 */
export interface ResolvedFragments {
  features: string[]
  details: string[]
  /** 规模构件会替换建筑尺寸，没选就是 undefined。 */
  size?: string
  /**
   * 要从建筑自带关键词里剔除的短语。
   *
   * 单选组（规模 / 院落 / 屋顶）选中之后是**替换**语义，不是追加：
   * 民宅 details 里本来就有 `gray tiled roof`，再勾「双层檐」会变成两个屋顶。
   * 所以选了哪一组，就把这一组自己的词汇从基础里剔掉，再追加选中的那个。
   * 多选组（门面 / 布局 / 点缀）是纯追加，不剔。
   */
  superseded: string[]
  /** 库里已经不存在的 id（改过构件库之后可能留下），在界面上提示。 */
  unknown: string[]
}

const norm = (s: string) => s.trim().toLowerCase()

/** 去掉被构件取代的自带关键词。 */
export function applySuperseded(
  base: readonly string[] | undefined,
  superseded: readonly string[],
): string[] {
  if (!base?.length || !superseded.length) return [...(base ?? [])]
  const drop = new Set(superseded.map(norm))
  return base.filter((k) => !drop.has(norm(k)))
}

export function resolveFragments(ids: readonly string[] | undefined): ResolvedFragments {
  const out: ResolvedFragments = {
    features: [],
    details: [],
    superseded: [],
    unknown: [],
  }
  if (!ids?.length) return out

  const selected = new Set(ids)

  for (const group of FRAGMENT_GROUPS) {
    let pickedHere = group.fragments.filter((f) => selected.has(f.id))
    if (!pickedHere.length) continue

    // 单选组里理论上只有一个生效。界面上点不出两个，但存档被手改过、或者
    // 以后构件库调整过，就可能出现多个——按库顺序只留第一个，保证结果可预期。
    if (group.mode === 'single' && pickedHere.length > 1) {
      pickedHere = [pickedHere[0]!]
    }

    // 单选组：这一组的词汇都作废，只留选中的那个
    if (group.mode === 'single') {
      out.superseded.push(...group.fragments.map((f) => f.en))
    }

    for (const fragment of pickedHere) {
      selected.delete(fragment.id) // 标记已处理，剩下的就是未知 id
      if (fragment.target === 'features') out.features.push(fragment.en)
      else if (fragment.target === 'details') out.details.push(fragment.en)
      else out.size = fragment.en
    }
  }

  // 被单选组淘汰掉的那个 id 也要从 unknown 里排除，它只是没生效，不是不存在
  for (const group of FRAGMENT_GROUPS) {
    if (group.mode !== 'single') continue
    for (const f of group.fragments) selected.delete(f.id)
  }

  out.unknown = [...selected]
  return out
}

/**
 * 勾选的构件和这栋建筑本身打不打架。
 *
 * 只提示不拦截——组合是否合理，最后是你看着出图判断，不是规则能穷举的。
 * 规则刻意写得少而准，宁可漏报也不要天天误报（现在提示词长度警告就是误报太多，等于没有）。
 */
export function fragmentConflicts(asset: Asset, ids: readonly string[] | undefined): string[] {
  if (!ids?.length) return []
  const resolved = resolveFragments(ids)
  const size = (resolved.size ?? asset.size ?? '').toLowerCase()
  const picked = [...resolved.features, ...resolved.details].map((s) => s.toLowerCase())
  const has = (needle: string) => picked.some((s) => s.includes(needle))

  const warnings: string[] = []

  if (size.includes('single-story') && (has('two-story') || has('balcony') || has('upper-floor'))) {
    warnings.push('基础是单层建筑，却勾了楼上相关的构件（两层 / 阳台 / 楼上窗户）')
  }
  if (size.includes('small') && (has('large courtyard') || has('large front courtyard') || has('grand'))) {
    warnings.push('基础是小建筑，却勾了大型院落类的构件，尺度会对不上')
  }
  if (size.includes('two-story') && has('single-story')) {
    warnings.push('基础是两层，却勾了单层的规模构件')
  }

  return warnings
}

/** 这个构件的措辞是不是已经在这栋建筑的关键词里了（避免勾出重复词）。 */
export function alreadyPresent(asset: Asset, en: string): boolean {
  const target = norm(en)
  return [...(asset.features ?? []), ...(asset.details ?? [])].some((k) => norm(k) === target)
}
