# hooks.md — Hook Definitions

**Project:** Project Apex — Intelligent Inventory Hub
**Location:** `src/hooks/`

This file is the canonical reference for every custom React hook in the project. It documents signatures, return values, side effects, internal constants, and usage contracts.

---

## Table of Contents

1. [useInventory](#useinventory)
2. [useTheme](#usetheme)

---

## useInventory

**File:** `src/hooks/useInventory.ts`
**Purpose:** Single source of truth for all inventory data and activity log. Owns CRUD operations and handles localStorage persistence.

---

### Import

```ts
import { useInventory } from './hooks/useInventory'
```

---

### Return Type

```ts
interface UseInventoryReturn {
  // ── Read-only state ───────────────────────────────────
  items:      Item[]       // Full list of inventory items (unfiltered, unsorted)
  log:        LogEntry[]   // Activity log, newest-first, max 10 entries

  // ── Mutation methods ──────────────────────────────────
  addItem:    (data: Omit<Item, 'id'>) => void
  bulkAdd:    (dataList: Omit<Item, 'id'>[]) => void
  updateItem: (id: string, data: Omit<Item, 'id'>) => void
  deleteItem: (id: string, name: string) => void
  bulkDelete: (ids: string[]) => void
  clearLog:   () => void
}
```

---

### State

| State Variable | Type | Initial Value | Description |
|---|---|---|---|
| `items` | `Item[]` | Loaded from `localStorage` or seeded from `SEED_ITEMS` | Complete inventory list |
| `log` | `LogEntry[]` | Loaded from `localStorage` or `[]` | Chronological activity log, capped at 10 entries |

---

### Internal Constants

| Constant | Value | Description |
|---|---|---|
| `STORAGE_KEY` | `'apex_inventory'` | localStorage key for persisted state |
| `MAX_LOG` | `10` | Maximum number of activity log entries retained |

---

### Internal Types

```ts
interface Persisted {
  items: Item[]
  log:   LogEntry[]
}
```

Used as the shape for JSON stored in and loaded from `localStorage`.

---

### Internal Helper Functions

| Function | Signature | Description |
|---|---|---|
| `load` | `() => Persisted` | Reads `localStorage[STORAGE_KEY]`. Returns parsed data if present; otherwise seeds `SEED_ITEMS` with an empty log, writes the seed to storage, and returns it. Handles corrupted JSON gracefully (falls through to seed). |
| `makeEntry` | `(message: string) => LogEntry` | Creates a new `LogEntry` with `crypto.randomUUID()` as ID and `new Date().toISOString()` as timestamp. |
| `prepend` | `(log: LogEntry[], entry: LogEntry) => LogEntry[]` | Prepends `entry` to `log` and trims to `MAX_LOG` entries. |

---

### Methods

#### `addItem`

```ts
addItem(data: Omit<Item, 'id'>): void
```

Creates a new inventory item.

| Parameter | Type | Description |
|---|---|---|
| `data` | `Omit<Item, 'id'>` | All item fields except `id`. Must include `name`, `sku`, `category`, `price`, `quantity`. May include `imageUrl`. |

**Behaviour:**
1. Generates a new UUID via `crypto.randomUUID()`.
2. Appends `{ id, ...data }` to the `items` array.
3. Prepends a log entry: `"Item '{name}' created"`.
4. Persistence triggers automatically via the `useEffect` sync.

**Caller responsibility:** Validate that `sku` is unique across existing items *before* calling. The hook does not enforce uniqueness.

---

#### `bulkAdd`

```ts
bulkAdd(dataList: Omit<Item, 'id'>[]): void
```

Creates multiple items in a single state update. Used by CSV import.

| Parameter | Type | Description |
|---|---|---|
| `dataList` | `Omit<Item, 'id'>[]` | Array of item data objects (without `id`) |

**Behaviour:**
1. Maps each entry to a new `Item` with `crypto.randomUUID()`.
2. Appends all new items to `items` in one `setItems` call.
3. Prepends a single log entry: `"{N} items imported via CSV"`.
4. Persistence triggers automatically.

**Note:** Produces one log entry regardless of how many items are added, keeping the log concise. Mirrors the `bulkDelete` pattern.

---

#### `updateItem`

```ts
updateItem(id: string, data: Omit<Item, 'id'>): void
```

Replaces an existing item's fields in place.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | The `id` of the item to update |
| `data` | `Omit<Item, 'id'>` | The new field values (completely replaces old values) |

**Behaviour:**
1. Maps over `items`, replacing the item matching `id` with `{ id, ...data }`.
2. Prepends a log entry: `"Item '{name}' updated"`.
3. If no item matches `id`, the array is unchanged (no error thrown).

**Caller responsibility:** Validate that `sku` is unique (excluding the item being edited) *before* calling.

---

#### `deleteItem`

```ts
deleteItem(id: string, name: string): void
```

Removes a single item by ID.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | The `id` of the item to remove |
| `name` | `string` | The item's display name (used in the log entry) |

**Behaviour:**
1. Filters `items` to exclude the matching `id`.
2. Prepends a log entry: `"Item '{name}' deleted"`.

**Design note:** `name` is passed explicitly by the caller rather than being looked up inside the hook. This avoids stale-closure issues and keeps the hook's state transitions pure.

---

#### `bulkDelete`

```ts
bulkDelete(ids: string[]): void
```

Removes multiple items in a single operation.

| Parameter | Type | Description |
|---|---|---|
| `ids` | `string[]` | Array of item IDs to remove |

**Behaviour:**
1. Converts `ids` to a `Set` for O(1) lookup.
2. Filters `items` to exclude all matching IDs.
3. Prepends a single log entry: `"{n} items deleted"`.

**Note:** Produces one log entry regardless of how many items are deleted, keeping the log concise.

---

#### `clearLog`

```ts
clearLog(): void
```

Empties the activity log.

**Behaviour:**
1. Sets `log` to an empty array `[]`.
2. Persistence triggers automatically.

---

### Side Effects

#### localStorage Sync

```ts
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, log }))
}, [items, log])
```

| Trigger | Any change to `items` or `log` |
|---|---|
| Key | `'apex_inventory'` |
| Shape | `{ items: Item[], log: LogEntry[] }` |
| Timing | Runs after render (React effect), so the UI always reflects the latest state before the write occurs |

#### Initial Load (module-level)

```ts
const initialData = load()
```

Executed once when the module is first imported. The parsed result is stored in a module-level `initialData` constant and used as the initial value for both `useState` calls. This avoids the original bug of calling `load()` twice (which would parse localStorage JSON twice on every mount).

---

### Dependencies

| Dependency | Source | Purpose |
|---|---|---|
| `Item` | `src/types.ts` | Core data model interface |
| `LogEntry` | `src/types.ts` | Activity log entry interface |
| `SEED_ITEMS` | `src/data/seedData.ts` | 10 sample items for first-run seeding |
| `useState` | `react` | State management |
| `useEffect` | `react` | localStorage sync |
| `useCallback` | `react` | Stable function references across re-renders |

---

### Stability Guarantees

All mutation functions (`addItem`, `updateItem`, `deleteItem`, `bulkDelete`, `clearLog`) are wrapped in `useCallback` with an empty dependency array `[]`. Their references are **stable across re-renders** and safe to include in child component dependency arrays or `useEffect` deps without causing unnecessary re-runs.

---

### Usage Example

```tsx
import { useInventory } from './hooks/useInventory'

export default function App() {
  const { items, log, addItem, updateItem, deleteItem, bulkDelete, clearLog } = useInventory()

  // Read
  const totalItems = items.length
  const outOfStock = items.filter(i => i.quantity === 0).length

  // Create
  const handleCreate = (formData: Omit<Item, 'id'>) => {
    addItem(formData)
  }

  // Update
  const handleUpdate = (id: string, formData: Omit<Item, 'id'>) => {
    updateItem(id, formData)
  }

  // Delete single
  const handleDelete = (item: Item) => {
    deleteItem(item.id, item.name)
  }

  // Delete multiple
  const handleBulkDelete = (selectedIds: string[]) => {
    bulkDelete(selectedIds)
  }

  // Clear activity log
  const handleClearLog = () => {
    clearLog()
  }
}
```

---

### Data Flow Diagram

```
┌──────────────────────────────────────────────────┐
│                  App.tsx (consumer)               │
│                                                   │
│  const { items, log, addItem, ... } = useInventory()
│        │                       ▲                  │
│        ▼ (read)                │ (mutate)         │
│   Components                  User Actions        │
└───────│────────────────────────│──────────────────┘
        │                        │
        ▼                        ▼
┌──────────────────────────────────────────────────┐
│               useInventory Hook                   │
│                                                   │
│   items: Item[]  ◄──── setItems ◄── addItem()    │
│   log: LogEntry[] ◄── setLog   ◄── updateItem()  │
│                                ◄── deleteItem()   │
│                                ◄── bulkDelete()   │
│                                ◄── clearLog()     │
│                                                   │
│   useEffect ──► localStorage.setItem(...)         │
└──────────────────────────┬───────────────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ localStorage │
                   │ key:         │
                   │ apex_inventory│
                   └──────────────┘
```

---

### Error Handling

| Scenario | Behaviour |
|---|---|
| Corrupted JSON in localStorage | `load()` catches the parse error and falls through to seeding fresh data |
| Missing localStorage (restricted context) | `load()` catches the access error and returns seed data (not persisted) |
| Delete non-existent ID | `filter` returns unchanged array; no error thrown |
| Update non-existent ID | `map` returns unchanged array; no error thrown |
| Bulk delete with empty array | No items removed; log entry says "0 items deleted" |

---

### Constraints & Limitations

| Constraint | Detail |
|---|---|
| Single-tab only | No cross-tab sync via `storage` event listener. If two tabs are open, each has its own in-memory state and the last-write wins on refresh. |
| Storage quota | `localStorage` is typically 5–10 MB. Base64 images stored in `imageUrl` may exhaust this limit with enough items. |
| No undo | Mutations are immediate and irreversible. There is no undo/redo stack. |
| Log cap | Only the 10 most recent actions are retained. Older entries are silently dropped. |
| No optimistic updates | All mutations are synchronous; there is no pending/loading/error state since there is no network layer. |

---
---

## useTheme

**File:** `src/hooks/useTheme.ts`
**Purpose:** Manages light/dark mode toggle with localStorage persistence and system preference detection.

---

### Import

```ts
import { useTheme } from './hooks/useTheme'
```

---

### Return Type

```ts
interface UseThemeReturn {
  theme:  'light' | 'dark'   // Current active theme
  toggle: () => void          // Switches between light and dark
}
```

---

### Behaviour

1. **Initial load:** Reads `localStorage` key `apex_theme`. If not set, falls back to `window.matchMedia('(prefers-color-scheme: dark)')`.
2. **Toggle:** Switches theme and persists to `localStorage`.
3. **DOM effect:** Adds/removes the `dark` class on `document.documentElement` (`<html>`), which Tailwind's `darkMode: 'class'` strategy uses to apply `dark:` variants.
4. **Stable reference:** `toggle` is wrapped in `useCallback` with empty deps.

### Storage

| Key | Value | Default |
|---|---|---|
| `apex_theme` | `'light'` or `'dark'` | System preference via `matchMedia` |
