import type { FC } from 'react'
import type { Item, SortField, SortDirection } from '../types'
import TableRow from './TableRow'

interface Props {
  items: Item[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'name',     label: 'Name' },
  { key: 'sku',      label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'price',    label: 'Price' },
  { key: 'quantity', label: 'Qty' },
]

const SortIcon: FC<{ active: boolean; direction: SortDirection }> = ({ active, direction }) => {
  if (!active) return <span className="ml-1 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">&#8597;</span>
  return (
    <span className="ml-1 text-indigo-400 font-bold">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

const InventoryTable: FC<Props> = ({
  items, selectedIds, onSelectAll, onSelectRow,
  sortField, sortDirection, onSort, onEdit, onDelete,
}) => {
  const allSelected = items.length > 0 && items.every(i => selectedIds.includes(i.id))

  return (
    <div className="px-6 pb-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/40 dark:bg-slate-700"
                />
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="group px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  <SortIcon active={sortField === col.key} direction={sortDirection} />
                </th>
              ))}
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">No items found.</p>
                    <p className="text-slate-300 dark:text-slate-600 text-xs">Try adjusting your search or add a new item.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map(item => (
                <TableRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={checked => onSelectRow(item.id, checked)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-rose-300 to-red-400 shadow-sm" />
          Out of stock
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 shadow-sm" />
          Low stock (&lt;10 units)
        </div>
      </div>
    </div>
  )
}

export default InventoryTable
