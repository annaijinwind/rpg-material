/**
 * localStorage 封装。
 *
 * 只存「用户增量」，不存整份目录：目录数据是随代码走的创作内容，
 * 一旦整份写进 localStorage，以后每次改 seed 都会变成无法调和的冲突。
 */

const PREFIX = 'rpg-material:'

export const KEYS = {
  /** 每个素材的状态、备注、提示词覆盖、字段覆盖。 */
  patches: PREFIX + 'patches',
  /** 全局风格配置（视角约束 / 风格块 / 负面词 / 三套模板）。 */
  style: PREFIX + 'style',
  /** 界面偏好：筛选条件、选中项、面板宽度。 */
  ui: PREFIX + 'ui',
} as const

export function loadJson<T>(key: string, fallback: T, check?: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (check && !check(parsed)) {
      console.warn(`[persist] ${key} 数据格式不符，已回退默认值`)
      return fallback
    }
    return parsed as T
  } catch (err) {
    console.warn(`[persist] 读取 ${key} 失败，已回退默认值`, err)
    return fallback
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    // 配额写满时不能把整个应用带崩，提示一下就算了。
    console.warn(`[persist] 写入 ${key} 失败`, err)
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* 忽略 */
  }
}

/** 文本编辑类操作会高频触发写入，统一走这个防抖。 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function downloadJson(filename: string, value: unknown): void {
  downloadText(filename, JSON.stringify(value, null, 2), 'application/json')
}

export function downloadText(filename: string, text: string, mime = 'text/plain'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 复制到剪贴板。非 https / 非 localhost 环境下 Clipboard API 不可用，
 * 退回 execCommand。失败时返回 false，由调用方提示用户手动选中。
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 落到下面的兜底 */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
