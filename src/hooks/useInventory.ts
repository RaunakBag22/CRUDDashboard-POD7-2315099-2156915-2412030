import { useState, useEffect, useCallback } from 'react'
import type { Item, LogEntry } from '../types'
import { SEED_ITEMS } from '../data/seedData'

const STORAGE_KEY = 'apex_inventory'
const MAX_LOG = 10

interface Persisted {
  items: Item[]
  log: LogEntry[]
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Persisted
  } catch {
    // corrupted — fall through to seed
  }
  const initial: Persisted = { items: SEED_ITEMS, log: [] }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function makeEntry(message: string): LogEntry {
  return { id: crypto.randomUUID(), timestamp: new Date().toISOString(), message }
}

function prepend(log: LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...log].slice(0, MAX_LOG)
}

// Cache the initial load so localStorage is only parsed once per mount
const initialData = load()

export function useInventory() {
  const [items, setItems] = useState<Item[]>(initialData.items)
  const [log, setLog] = useState<LogEntry[]>(initialData.log)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, log }))
  }, [items, log])

  const addItem = useCallback((data: Omit<Item, 'id'>) => {
    const newItem: Item = { id: crypto.randomUUID(), ...data }
    setItems(prev => [...prev, newItem])
    setLog(prev => prepend(prev, makeEntry(`Item '${data.name}' created`)))
  }, [])

  const bulkAdd = useCallback((dataList: Omit<Item, 'id'>[]) => {
    const newItems = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
    setItems(prev => [...prev, ...newItems])
    setLog(prev => prepend(prev, makeEntry(`${dataList.length} items imported via CSV`)))
  }, [])

  const updateItem = useCallback((id: string, data: Omit<Item, 'id'>) => {
    setItems(prev => prev.map(i => (i.id === id ? { id, ...data } : i)))
    setLog(prev => prepend(prev, makeEntry(`Item '${data.name}' updated`)))
  }, [])

  const deleteItem = useCallback((id: string, name: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setLog(prev => prepend(prev, makeEntry(`Item '${name}' deleted`)))
  }, [])

  const bulkDelete = useCallback((ids: string[]) => {
    const set = new Set(ids)
    setItems(prev => prev.filter(i => !set.has(i.id)))
    setLog(prev => prepend(prev, makeEntry(`${ids.length} items deleted`)))
  }, [])

  const clearLog = useCallback(() => setLog([]), [])

  return { items, log, addItem, bulkAdd, updateItem, deleteItem, bulkDelete, clearLog }
}
