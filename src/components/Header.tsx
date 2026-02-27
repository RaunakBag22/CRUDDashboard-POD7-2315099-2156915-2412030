import type { FC } from 'react'

interface Props {
  onAddItem: () => void
  onImportCsv: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const Header: FC<Props> = ({ onAddItem, onImportCsv, theme, onToggleTheme }) => (
  <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shadow-xl relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none" />

    <div className="flex items-center gap-4 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold tracking-tight">Apex Inventory</h1>
        <p className="text-slate-400 text-xs font-medium tracking-wide">Intelligent Inventory Hub</p>
      </div>
    </div>

    <div className="flex items-center gap-3 relative z-10">
      <button
        onClick={onToggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <button
        onClick={onImportCsv}
        className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm">Import CSV</span>
      </button>
      <button
        onClick={onAddItem}
        className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm">Add Item</span>
      </button>
    </div>
  </header>
)

export default Header
