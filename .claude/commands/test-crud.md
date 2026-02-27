# /test-crud — Generate & Run CRUD Test Suite

Set up the Vitest testing framework (if not already installed) and generate a comprehensive test suite covering all CRUD operations, CSV import, validation logic, and localStorage persistence. Then run the tests and report results.

## Steps

### 1. Check if Vitest is installed

Look at `package.json` for `vitest` in devDependencies. If missing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Then add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Create or update `vite.config.ts` to include the test config:
```ts
/// <reference types="vitest" />
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock crypto.randomUUID
let counter = 0
Object.defineProperty(window.crypto, 'randomUUID', {
  value: () => `test-uuid-${++counter}`,
})
```

### 2. Generate test files

Create the following test files. Each test file should use `describe`/`it` blocks with clear names. Use the project's actual source code interfaces (`Item`, `LogEntry`, `Omit<Item, 'id'>`) for type safety.

#### `src/hooks/__tests__/useInventory.test.ts`

Test the `useInventory` hook using `renderHook` from `@testing-library/react`. Cover:

**Create (addItem):**
- Adds an item with all required fields → items array grows by 1
- Generated item has a UUID `id`
- Log entry is created: "Item '{name}' created"
- Item is persisted to localStorage

**Bulk Create (bulkAdd):**
- Adds N items in one call → items array grows by N
- Single log entry: "{N} items imported via CSV"
- All items get unique UUIDs

**Read (items):**
- Initial load returns seed data (10 items from `SEED_ITEMS`)
- Items are the correct shape (id, name, sku, category, price, quantity)

**Update (updateItem):**
- Updates the correct item by ID
- Other items remain unchanged
- Log entry: "Item '{name}' updated"
- Updated item is persisted to localStorage

**Delete (deleteItem):**
- Removes the correct item by ID
- Other items remain unchanged
- Log entry: "Item '{name}' deleted"

**Bulk Delete (bulkDelete):**
- Removes multiple items by ID array
- Single log entry: "{N} items deleted"
- Non-targeted items remain unchanged

**Activity Log:**
- Log is capped at 10 entries (MAX_LOG)
- `clearLog()` empties the log
- Log entries have id, timestamp (ISO 8601), and message

**Persistence:**
- Items survive re-mount (read back from localStorage)
- Corrupted localStorage falls back to seed data

#### `src/utils/__tests__/csvParser.test.ts`

Test the CSV parser utility functions. Cover:

**parseCsvFile:**
- Parses a valid CSV with correct headers → returns rows with data
- (Use `new File([csvContent], 'test.csv', { type: 'text/csv' })`)

**validateRows — valid data:**
- All required fields present → status: 'valid', parsed has correct types
- Price and quantity are correctly parsed as numbers

**validateRows — field validation:**
- Missing name → error "Name is required"
- Missing SKU → error "SKU is required"
- Missing category → error "Category is required"
- Negative price → error about price
- Non-integer quantity (e.g. "5.5") → error about quantity
- Empty price/quantity string → error

**validateRows — SKU uniqueness:**
- SKU matching existing inventory → error "SKU already exists"
- Duplicate SKU within same CSV → second occurrence gets error
- Case-insensitive SKU check (e.g. "ab-100" matches "AB-100")

**validateRows — missing columns:**
- CSV missing required column → all rows invalid with column error message
- Error message lists which columns are missing and which were found

**validateRows — column aliases:**
- "qty" column → maps to "quantity"
- "product_name" → maps to "name"
- "unit_price" → maps to "price"

**downloadTemplate:**
- Returns a CSV string starting with the correct header row

#### `src/components/__tests__/ItemModal.test.tsx`

Test the ItemModal form validation and rendering using `render` + `screen` + `userEvent`. Cover:

**Create mode:**
- Renders with title "Add New Item"
- All form fields are present and empty
- Submitting empty form shows validation errors without closing
- Submitting valid form calls `onSave` with correct data
- Cancel button calls `onClose`
- Clicking backdrop calls `onClose`

**Edit mode:**
- Renders with title "Edit Item"
- Form fields are pre-populated from `item` prop
- Save button text is "Save Changes"

**Validation rules:**
- Empty name → "Name is required"
- Empty SKU → "SKU is required"
- Duplicate SKU → "SKU already exists"
- Negative price → price error
- Decimal quantity → quantity error

### 3. Run the tests

```bash
npm run test
```

### 4. Report results

Show the output from Vitest and summarise in a table:

| Suite | Tests | Pass | Fail |
|---|---|---|---|
| useInventory.test.ts | N | N | 0 |
| csvParser.test.ts | N | N | 0 |
| ItemModal.test.tsx | N | N | 0 |
| **Total** | **N** | **N** | **0** |

If any tests fail, investigate and fix the test or the source code. Re-run until all pass.

### 5. Update documentation

- Add test commands to `CLAUDE.md` under Development Commands
- Update `hooks.md` if any hook behaviour was clarified by tests
- Update `changelog.md` with a new entry for the test suite generation
