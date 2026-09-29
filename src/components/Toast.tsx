import { useEffect } from 'react'
import { create } from 'zustand'

interface ToastState {
  message: string | null
  error: boolean
  seq: number
  show: (message: string, error?: boolean) => void
  clear: () => void
}

const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  error: false,
  seq: 0,
  show: (message, error = false) => set({ message, error, seq: get().seq + 1 }),
  clear: () => set({ message: null }),
}))

/** 任意地方都能调用，不需要把 toast 往下传。 */
export function toast(message: string, error = false): void {
  useToastStore.getState().show(message, error)
}

export function ToastHost() {
  const message = useToastStore((s) => s.message)
  const error = useToastStore((s) => s.error)
  const seq = useToastStore((s) => s.seq)
  const clear = useToastStore((s) => s.clear)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(clear, error ? 4000 : 1800)
    return () => clearTimeout(timer)
    // seq 参与依赖：连续弹同样的文案时也要重新计时
  }, [message, seq, error, clear])

  if (!message) return null
  return (
    <div className={error ? 'toast toast-error' : 'toast'} role="status">
      {message}
    </div>
  )
}
