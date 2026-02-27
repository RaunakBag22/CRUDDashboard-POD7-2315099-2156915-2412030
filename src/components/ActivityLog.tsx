import type { FC } from 'react'
import type { LogEntry } from '../types'

interface Props {
  log: LogEntry[]
  onClear: () => void
}

const ActivityLog: FC<Props> = ({ log, onClear }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Activity Log</h3>
        {log.length > 0 && (
          <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full">{log.length}</span>
        )}
      </div>
      {log.length > 0 && (
        <button onClick={onClear} className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
      )}
    </div>
    <div className="px-5 py-3 max-h-60 overflow-y-auto">
      {log.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <svg className="w-8 h-8 text-slate-200 dark:text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-slate-400 dark:text-slate-500 italic text-xs">No activity yet.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {log.map((entry, i) => (
            <li key={entry.id} className={`flex gap-3 items-start py-2 ${i === 0 ? 'animate-slide-up' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{entry.message}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{new Date(entry.timestamp).toLocaleTimeString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)

export default ActivityLog
