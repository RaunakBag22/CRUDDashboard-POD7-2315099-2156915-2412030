import type { FC } from 'react'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  selectedIds: string[]
  onBulkDelete: () => void
  onExport: () => void
}

const Toolbar: FC<Props> = ({ search, onSearchChange, selectedIds, onBulkDelete, onExport }) => (
  <div className="flex items-center justify-between px-6 py-3 gap-4">
    <div className="relative flex-1 max-w-md">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search by name, SKU, or category..."
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 shadow-sm transition-all duration-200"
      />
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onExport}
        className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Excel
      </button>
      {selectedIds.length > 0 && (
        <button
          onClick={onBulkDelete}
          className="flex items-center gap-2 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 animate-fade-in"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Selected ({selectedIds.length})
        </button>
      )}
    </div>
  </div>
)

export default Toolbar
