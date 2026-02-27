import { useState, useRef, type FC, type DragEvent } from 'react'
import type { Item } from '../types'
import { parseCsvFile, validateRows, downloadTemplate, type CsvParseResult } from '../utils/csvParser'

interface Props {
  existingSkus: string[]
  onImport: (items: Omit<Item, 'id'>[]) => void
  onClose: () => void
}

type Phase = 'upload' | 'preview' | 'summary'

const CsvImportModal: FC<Props> = ({ existingSkus, onImport, onClose }) => {
  const [phase, setPhase] = useState<Phase>('upload')
  const [result, setResult] = useState<CsvParseResult | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setFileError('')
    if (!file.name.toLowerCase().endsWith('.csv')) { setFileError('Please upload a .csv file'); return }
    try {
      const parsed = await parseCsvFile(file)
      const validated = validateRows(parsed, existingSkus)
      setResult(validated)
      setPhase('preview')
    } catch { setFileError('Failed to parse the CSV file. Please check the format.') }
  }

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragActive(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragActive(true) }
  const onDragLeave = () => setDragActive(false)

  const handleImport = () => {
    if (!result) return
    const validItems = result.rows.filter(r => r.status === 'valid' && r.parsed).map(r => r.parsed!)
    onImport(validItems)
    setImportedCount(validItems.length)
    setPhase('summary')
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import from CSV</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {phase === 'upload' && 'Upload a CSV file with your inventory data.'}
              {phase === 'preview' && 'Review the data before importing.'}
              {phase === 'summary' && 'Import complete.'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {phase === 'upload' && (
          <div className="px-6 py-6 flex-1">
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl px-6 py-12 cursor-pointer transition-all duration-200 ${dragActive ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${dragActive ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <svg className={`w-7 h-7 transition-colors ${dragActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{dragActive ? 'Drop your file here' : 'Drag & drop your CSV file here'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">or click to browse</p>
              </div>
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
            {fileError && <p className="text-red-500 text-xs mt-3 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{fileError}</p>}
            <div className="mt-4 flex items-center justify-between">
              <button onClick={downloadTemplate} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download CSV template
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Required: name, sku, category, price, quantity</p>
            </div>
          </div>
        )}

        {phase === 'preview' && result && (
          <div className="flex-1 flex flex-col min-h-0 px-6 pb-2">
            <div className="flex items-center justify-between py-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{result.validCount} valid
                </span>
                {result.invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{result.invalidCount} invalid
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{result.rows.length} rows total</p>
            </div>
            <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 min-h-0">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 w-10">#</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">Name</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">SKU</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">Category</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">Price</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">Qty</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 w-16">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.rows.map(row => (
                    <tr key={row.rowNumber} className={row.status === 'valid' ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'bg-red-50/40 dark:bg-red-950/20'}>
                      <td className="px-3 py-2 text-slate-400 font-mono">{row.rowNumber}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.raw.name || '—'}</td>
                      <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">{row.raw.sku || '—'}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.raw.category || '—'}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.raw.price || '—'}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.raw.quantity || '—'}</td>
                      <td className="px-3 py-2">
                        {row.status === 'valid' ? (
                          <span className="text-emerald-600 dark:text-emerald-400" title="Valid">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : (
                          <span className="text-red-500 dark:text-red-400 cursor-help" title={row.errors.join('; ')}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{importedCount} item{importedCount !== 1 ? 's' : ''} imported</p>
              {result && result.invalidCount > 0 && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{result.invalidCount} row{result.invalidCount !== 1 ? 's' : ''} skipped due to errors</p>}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-3 px-6 pb-6 pt-3 shrink-0">
          {phase === 'upload' && (
            <div className="flex justify-end w-full">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
            </div>
          )}
          {phase === 'preview' && (
            <>
              <button onClick={() => { setPhase('upload'); setResult(null) }} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Back</button>
              <button onClick={handleImport} disabled={!result || result.validCount === 0} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                Import {result?.validCount ?? 0} Item{(result?.validCount ?? 0) !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {phase === 'summary' && (
            <div className="flex justify-end w-full">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CsvImportModal
