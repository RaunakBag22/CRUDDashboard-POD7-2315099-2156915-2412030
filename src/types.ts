export interface Item {
  id: string
  name: string
  sku: string
  category: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface LogEntry {
  id: string
  timestamp: string // ISO 8601
  message: string
}

export type SortField = keyof Omit<Item, 'id' | 'imageUrl'>
export type SortDirection = 'asc' | 'desc'

export type ModalMode = 'create' | 'edit' | null

export interface ModalState {
  mode: ModalMode
  item?: Item
}
