import type { FC } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: FC<Props> = ({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    onClick={e => { if (e.target === e.currentTarget) onCancel() }}
  >
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-scale-in">
      <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white text-center mb-1">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 rounded-xl transition-all duration-200 shadow-md shadow-red-500/25 hover:shadow-red-500/40">{confirmLabel}</button>
      </div>
    </div>
  </div>
)

export default ConfirmDialog
