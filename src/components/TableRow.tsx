import type { FC } from 'react'
import type { Item } from '../types'

interface Props {
  item: Item
  selected: boolean
  onSelect: (checked: boolean) => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

const TableRow: FC<Props> = ({ item, selected, onSelect, onEdit, onDelete }) => {
  const isOutOfStock = item.quantity === 0
  const isLowStock = item.quantity > 0 && item.quantity < 10

  const rowClass = isOutOfStock
    ? 'bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-950/50'
    : isLowStock
    ? 'bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40'
    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'

  return (
    <tr className={`${rowClass} transition-colors duration-150`}>
      <td className="px-4 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(e.target.checked)}
          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/40 dark:bg-slate-700"
        />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-9 h-9 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-300 text-xs font-bold">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md">{item.sku}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
          {item.category}
        </span>
      </td>
      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">${item.price.toFixed(2)}</td>
      <td className="px-4 py-3.5">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {item.quantity}
          </span>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {item.quantity}
          </span>
        ) : (
          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default TableRow
