import Papa from 'papaparse'
import type { Item } from '../types'

export interface CsvRow {
  rowNumber: number
  raw: Record<string, string>
  parsed: Omit<Item, 'id'> | null
  errors: string[]
  status: 'valid' | 'invalid'
}

export interface CsvParseResult {
  rows: CsvRow[]
  validCount: number
  invalidCount: number
  headers: string[]
}

// Column name aliases → canonical field name
const ALIASES: Record<string, string> = {
  name: 'name', product_name: 'name', product: 'name', item: 'name', item_name: 'name',
  sku: 'sku', sku_code: 'sku', code: 'sku',
  category: 'category', cat: 'category', type: 'category',
  price: 'price', unit_price: 'price', cost: 'price',
  quantity: 'quantity', qty: 'quantity', stock: 'quantity', count: 'quantity',
}

const REQUIRED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity'] as const

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase().replace(/\s+/g, '_')
  return ALIASES[key] ?? key
}

export function parseCsvFile(file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: resolve,
      error: reject,
    })
  })
}

export function validateRows(
  parsed: Papa.ParseResult<Record<string, string>>,
  existingSkus: string[],
): CsvParseResult {
  const headers = parsed.meta.fields ?? []
  const missing = REQUIRED_FIELDS.filter(f => !headers.includes(f))

  // If required columns are missing, return all rows as invalid with header error
  if (missing.length > 0) {
    const msg = `Missing required columns: ${missing.join(', ')}. Found: ${headers.join(', ')}`
    return {
      rows: parsed.data.map((raw, i) => ({
        rowNumber: i + 1, raw, parsed: null, errors: [msg], status: 'invalid' as const,
      })),
      validCount: 0,
      invalidCount: parsed.data.length,
      headers,
    }
  }

  const skuSet = new Set(existingSkus.map(s => s.toLowerCase()))
  const rows: CsvRow[] = []

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i]
    const errors: string[] = []

    const name = (raw.name ?? '').trim()
    const sku = (raw.sku ?? '').trim()
    const category = (raw.category ?? '').trim()
    const priceStr = (raw.price ?? '').trim()
    const qtyStr = (raw.quantity ?? '').trim()

    if (!name) errors.push('Name is required')
    if (!sku) errors.push('SKU is required')
    if (!category) errors.push('Category is required')

    const price = parseFloat(priceStr)
    if (!priceStr || isNaN(price) || price < 0) errors.push('Price must be a number ≥ 0')

    const qty = parseInt(qtyStr, 10)
    if (!qtyStr || isNaN(qty) || qty < 0 || String(qty) !== qtyStr)
      errors.push('Quantity must be a whole number ≥ 0')

    // SKU uniqueness: vs inventory + vs earlier rows in this CSV
    if (sku && skuSet.has(sku.toLowerCase())) {
      errors.push('SKU already exists')
    }

    if (errors.length === 0) {
      skuSet.add(sku.toLowerCase())
      rows.push({
        rowNumber: i + 1, raw,
        parsed: { name, sku, category, price, quantity: qty },
        status: 'valid',
        errors: [],
      })
    } else {
      rows.push({ rowNumber: i + 1, raw, parsed: null, status: 'invalid', errors })
    }
  }

  return {
    rows,
    validCount: rows.filter(r => r.status === 'valid').length,
    invalidCount: rows.filter(r => r.status === 'invalid').length,
    headers,
  }
}

export function downloadTemplate() {
  const content = 'name,sku,category,price,quantity\n'
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventory_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
