import { useState, useMemo } from 'react'
import { useInventory } from './hooks/useInventory'
import { useTheme } from './hooks/useTheme'
import type { Item, ModalState, SortField, SortDirection } from './types'

import Header from './components/Header'
import StatsBar from './components/StatsBar'
import Toolbar from './components/Toolbar'
import InventoryTable from './components/InventoryTable'
import ItemModal from './components/ItemModal'
import ConfirmDialog from './components/ConfirmDialog'
import CsvImportModal from './components/CsvImportModal'
import ToastContainer from './components/ToastContainer'
import ActivityLog from './components/ActivityLog'
import ChartsPanel from './components/ChartsPanel'
import { exportToExcel } from './utils/excelExport'

interface DeleteTarget {
  id: string
  name: string
}

export default function App() {
  const { items, log, addItem, bulkAdd, updateItem, deleteItem, bulkDelete, clearLog } = useInventory()
  const { theme, toggle: toggleTheme } = useTheme()

  // ── Modal state ──────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ mode: null })

  // ── Delete confirmation ──────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [bulkDeletePending, setBulkDeletePending] = useState(false)

  // ── CSV import ─────────────────────────────────────────────────────────
  const [csvImportOpen, setCsvImportOpen] = useState(false)

  // ── Table controls ───────────────────────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [sortField, setSortField]       = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // ── Derived: filtered + sorted items ────────────────────────────────────
  const visibleItems = useMemo(() => {
    const q = search.toLowerCase().trim()
    const filtered = q
      ? items.filter(
          i =>
            i.name.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q),
        )
      : items

    return [...filtered].sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [items, search, sortField, sortDirection])

  // ── Existing SKUs for uniqueness check (excluding item being edited) ─────
  const existingSkus = useMemo(() => {
    const editId = modal.mode === 'edit' ? modal.item?.id : undefined
    return items.filter(i => i.id !== editId).map(i => i.sku)
  }, [items, modal])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? visibleItems.map(i => i.id) : [])

  const handleSelectRow = (id: string, checked: boolean) =>
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id))

  const handleSave = (data: Omit<Item, 'id'>) => {
    if (modal.mode === 'create') {
      addItem(data)
    } else if (modal.mode === 'edit' && modal.item) {
      updateItem(modal.item.id, data)
    }
    setModal({ mode: null })
  }

  const handleDeleteRequest = (item: Item) => setDeleteTarget({ id: item.id, name: item.name })

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteItem(deleteTarget.id, deleteTarget.name)
      setSelectedIds(prev => prev.filter(x => x !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  const handleCsvImport = (validItems: Omit<Item, 'id'>[]) => {
    bulkAdd(validItems)
  }

  const handleBulkDeleteRequest = () => setBulkDeletePending(true)

  const handleBulkDeleteConfirm = () => {
    bulkDelete(selectedIds)
    setSelectedIds([])
    setBulkDeletePending(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-200">
      <Header onAddItem={() => setModal({ mode: 'create' })} onImportCsv={() => setCsvImportOpen(true)} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto">
        <StatsBar items={items} />

        <Toolbar
          search={search}
          onSearchChange={setSearch}
          selectedIds={selectedIds}
          onBulkDelete={handleBulkDeleteRequest}
          onExport={() => exportToExcel(items)}
        />

        <InventoryTable
          items={visibleItems}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={item => setModal({ mode: 'edit', item })}
          onDelete={handleDeleteRequest}
        />

        {/* Charts + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 px-6 pb-8">
          <div className="lg:col-span-3">
            <ChartsPanel items={items} />
          </div>
          <div className="lg:col-span-2">
            <ActivityLog log={log} onClear={clearLog} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
        Project Apex &middot; Intelligent Inventory Hub
      </footer>

      {/* Toast alerts */}
      <ToastContainer items={items} />

      {/* Modals */}
      {modal.mode && (
        <ItemModal
          mode={modal.mode}
          item={modal.item}
          existingSkus={existingSkus}
          onSave={handleSave}
          onClose={() => setModal({ mode: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {csvImportOpen && (
        <CsvImportModal
          existingSkus={items.map(i => i.sku)}
          onImport={handleCsvImport}
          onClose={() => setCsvImportOpen(false)}
        />
      )}

      {bulkDeletePending && (
        <ConfirmDialog
          title="Delete Selected Items"
          message={`Delete ${selectedIds.length} selected item${selectedIds.length > 1 ? 's' : ''}? This cannot be undone.`}
          confirmLabel={`Delete ${selectedIds.length}`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeletePending(false)}
        />
      )}
    </div>
  )
}
