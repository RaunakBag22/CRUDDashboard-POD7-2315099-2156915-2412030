import { useState, useEffect, useCallback, type FC } from 'react'
import type { Item } from '../types'

export interface Toast {
  id: string
  type: 'warning' | 'danger' | 'success'
  title: string
  message: string
}

interface Props {
  items: Item[]
}

const LOW_STOCK_THRESHOLD = 10

const ICONS: Record<Toast['type'], JSX.Element> = {
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  danger: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
}

const BG: Record<Toast['type'], string> = {
  warning: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  danger: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
  success: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
}

const ToastContainer: FC<Props> = ({ items }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id))
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map(t => setTimeout(() => dismiss(t.id), 6000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  useEffect(() => {
    const outOfStock = items.filter(i => i.quantity === 0)
    const lowStock = items.filter(i => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD)
    const newToasts: Toast[] = []

    if (outOfStock.length > 0) {
      const id = `out-of-stock-${outOfStock.length}`
      if (!dismissed.has(id)) {
        newToasts.push({
          id, type: 'danger', title: 'Out of Stock',
          message: outOfStock.length === 1 ? `"${outOfStock[0].name}" is out of stock` : `${outOfStock.length} items are out of stock`,
        })
      }
    }
    if (lowStock.length > 0) {
      const id = `low-stock-${lowStock.length}`
      if (!dismissed.has(id)) {
        newToasts.push({
          id, type: 'warning', title: 'Low Stock Alert',
          message: lowStock.length === 1 ? `"${lowStock[0].name}" has only ${lowStock[0].quantity} units left` : `${lowStock.length} items are running low on stock`,
        })
      }
    }
    setToasts(newToasts)
  }, [items, dismissed])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 max-w-sm">
      {toasts.map(toast => (
        <div key={toast.id} className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg animate-slide-up ${BG[toast.type]}`}>
          <div className="shrink-0 mt-0.5">{ICONS[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => dismiss(toast.id)} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
