import * as XLSX from 'xlsx'
import type { Item } from '../types'

export function exportToExcel(items: Item[], filename = 'inventory_export') {
  const data = items.map(item => ({
    Name: item.name,
    SKU: item.sku,
    Category: item.category,
    Price: item.price,
    Quantity: item.quantity,
    Status: item.quantity === 0 ? 'Out of Stock' : item.quantity < 10 ? 'Low Stock' : 'In Stock',
  }))

  const ws = XLSX.utils.json_to_sheet(data)

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Name
    { wch: 12 }, // SKU
    { wch: 15 }, // Category
    { wch: 10 }, // Price
    { wch: 10 }, // Quantity
    { wch: 14 }, // Status
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory')

  // Add a summary sheet
  const totalItems = items.length
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity < 10).length
  const outOfStock = items.filter(i => i.quantity === 0).length
  const totalValue = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const summary = [
    { Metric: 'Total Unique Items', Value: totalItems },
    { Metric: 'In Stock', Value: totalItems - lowStock - outOfStock },
    { Metric: 'Low Stock (< 10)', Value: lowStock },
    { Metric: 'Out of Stock', Value: outOfStock },
    { Metric: 'Total Inventory Value', Value: `$${totalValue.toFixed(2)}` },
    { Metric: 'Export Date', Value: new Date().toLocaleDateString() },
  ]

  const summaryWs = XLSX.utils.json_to_sheet(summary)
  summaryWs['!cols'] = [{ wch: 22 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  XLSX.writeFile(wb, `${filename}.xlsx`)
}
