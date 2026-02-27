# spec.md — Project Apex: Intelligent Inventory Hub

## 1. Overview

A single-page web application (SPA) that lets store managers view, create, update, and delete inventory items through a modern, polished dashboard. All data is persisted client-side (localStorage) for the prototype. No backend or authentication is required.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite 6) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + custom animations + dark mode (`class` strategy) |
| Font | Inter (Google Fonts) |
| State | React `useState` / `useCallback` |
| Persistence | `localStorage` (keys: `apex_inventory`, `apex_theme`) |
| Charts | Recharts (multi-color `BarChart` with `Cell`) |
| CSV parsing | PapaParse |
| Excel export | SheetJS (xlsx) |
| Linting | ESLint 9 (flat config) + typescript-eslint |

---

## 3. Data Model

### Item

```ts
interface Item {
  id: string;          // uuid via crypto.randomUUID()
  name: string;        // required
  sku: string;         // required, unique
  category: string;    // required
  price: number;       // required, ≥ 0
  quantity: number;    // required, integer ≥ 0
  imageUrl?: string;   // base64 data URL from file upload
}
```

### Activity Log Entry

```ts
interface LogEntry {
  id: string;
  timestamp: string;   // ISO 8601
  message: string;     // e.g. "Item 'T-Shirt' created"
}
```

### Low-Stock Threshold

A constant `LOW_STOCK_THRESHOLD = 10`. Items with `quantity < LOW_STOCK_THRESHOLD` are flagged low-stock; items with `quantity === 0` are flagged out-of-stock.

---

## 4. Application Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: gradient navbar + SVG icon + "Add Item" CTA    │
├─────────────────────────────────────────────────────────┤
│  Stats Bar: [Total Items] [Low Stock] [Out of Stock]    │
│             gradient cards with SVG icons                │
├─────────────────────────────────────────────────────────┤
│  Toolbar: [🔍 Search bar]            [Bulk Delete btn]  │
├─────────────────────────────────────────────────────────┤
│  Inventory Table (rounded-2xl, sortable, filterable)    │
│    ☐ | Name+Avatar | SKU chip | Category badge |        │
│        Price | Qty badge | Edit/Delete SVG buttons      │
│  Legend: ● Out of stock  ● Low stock                    │
├─────────────────────────────┬───────────────────────────┤
│  Charts Panel (3/5 width)   │  Activity Log (2/5 width) │
│  Multi-color bar chart      │  Timeline dots + count    │
├─────────────────────────────┴───────────────────────────┤
│  Footer: "Project Apex · Intelligent Inventory Hub"     │
└─────────────────────────────────────────────────────────┘
         max-width: 1400px, centered, gradient bg
```

---

## 5. Feature Specifications

### 5.1 Stats Bar

Displays three gradient stat cards with SVG icons, derived from the current item list:

| Stat | Derivation | Card Style |
|---|---|---|
| Total Unique Items | `items.length` | Blue → Indigo gradient, cube icon |
| Items Low on Stock | `items.filter(i => i.quantity > 0 && i.quantity < 10).length` | Amber → Orange gradient, warning icon |
| Items Out of Stock | `items.filter(i => i.quantity === 0).length` | Rose → Red gradient, ban icon |

Each card has a decorative circle accent and responsive layout (`grid-cols-1 sm:grid-cols-3`). Stats update reactively whenever the item list changes and always reflect the **full unfiltered** list.

---

### 5.2 Inventory Table

- Container: `rounded-2xl` with `border-slate-200` and `shadow-sm`.
- Columns: Checkbox, Name, SKU, Category, Price, Quantity, Actions.
- **Name column:** Shows an avatar placeholder (first letter, gradient background) when no image is set; shows a `9×9` thumbnail with ring when `imageUrl` exists.
- **SKU column:** Displayed in a `font-mono` chip (`bg-slate-100 rounded-md`).
- **Category column:** Displayed as an indigo pill badge (`bg-indigo-50 text-indigo-700 rounded-full`).
- **Quantity column:** Status badge with dot indicator — red for out-of-stock, amber for low-stock, plain text for normal.
- **Sorting:** Clicking any column header sorts ascending; clicking again sorts descending. Inactive columns show a faded `↕` on hover; active column shows bold `↑` or `↓` in indigo.
- **Row highlighting:** Out of stock: `bg-red-50/80`; Low stock: `bg-amber-50/80`; Normal: transparent with `hover:bg-slate-50`.
- **Actions column:** Edit (indigo, pencil SVG) and Delete (red, trash SVG) buttons.
- **Empty state:** Centered cube icon + "No items found." + subtitle hint.
- **Legend:** Gradient dot indicators below the table.

---

### 5.3 Search & Filter

- Search input with magnifying glass SVG icon, `rounded-xl`, indigo focus ring.
- Filters the table in real-time (on every keystroke).
- Matches against **Name**, **SKU**, and **Category** fields (case-insensitive, substring match).
- The stats bar always reflects the **full** unfiltered list, not the filtered view.

---

### 5.4 Create Item

- Triggered by the "Add Item" button (gradient green with rotating `+` icon, hover-lift effect).
- Opens a **modal dialog** with backdrop blur (`bg-slate-900/60 backdrop-blur-sm`) and `animate-scale-in` entrance:
  - Close `X` button in header
  - Subtitle description text
  - Name (text, required, placeholder hint)
  - SKU + Category side by side (text, required)
  - Price + Quantity side by side (number, required)
  - Image upload: drag-drop style area with upload icon; shows `80×80` preview with "Remove" option
- Validation: all required fields must be non-empty; price ≥ 0; quantity is valid integer ≥ 0; SKU unique. Errors shown with red dot + message.
- Save button: gradient indigo → purple. Cancel: slate.
- On cancel / clicking backdrop: discard changes and close.

---

### 5.5 Update Item

- Triggered by the "Edit" button (indigo, pencil SVG) on a table row.
- Reuses the same modal form, pre-populated with the item's current values via `useEffect`.
- Same validation rules as Create. SKU uniqueness check excludes the item being edited.
- Save button text changes to "Save Changes".

---

### 5.6 Delete Item

- Triggered by the "Delete" button (red, trash SVG) on a table row.
- Opens a confirmation dialog with backdrop blur and `animate-scale-in`:
  - Centered warning icon in red circle
  - Centered title + message
  - Full-width Cancel (slate) and Delete (gradient red → rose) buttons
- On confirm: removes the item from state, persists to localStorage, appends log entry.
- On cancel / clicking backdrop: closes with no change.

---

### 5.7 Low-Stock Alert (Visual)

- Rows where `quantity === 0`: `bg-red-50/80` background, red quantity badge with dot.
- Rows where `0 < quantity < 10`: `bg-amber-50/80` background, amber quantity badge with dot.
- Gradient dot legend below the table (rose-to-red dot + amber-to-orange dot).

---

## 6. Stretch Goal Specifications

### 6.1 Data Visualization

- A panel below the table (left side, 3/5 width on large screens).
- Section header with bar-chart SVG icon.
- **Multi-color bar chart**: each category gets a distinct color from a rotating palette (`indigo`, `violet`, `purple`, `pink`, `rose`, `orange`, `yellow`, `green`).
- Uses Recharts `BarChart` + `Cell` + styled `Tooltip` (rounded corners, shadow).
- Updates reactively with item list changes.

### 6.2 Image Uploads

- Drag-drop style upload area with image icon, hover state.
- File input accepts `image/*`, hidden behind styled label.
- On selection, FileReader converts to base64 data URL stored in `item.imageUrl`.
- `80×80` preview with "Remove" button in modal.
- `36×36` thumbnail with ring in table (or avatar placeholder if no image).

### 6.3 Bulk Delete

- Indigo checkbox in each row + "Select All" checkbox in header.
- "Delete Selected (n)" button with trash SVG appears in toolbar with `animate-fade-in` when ≥ 1 row is checked.
- Clicking opens a single confirmation dialog (same design as single delete).
- On confirm: removes all selected items; clears selection state.

### 6.4 Activity Log

- Right side panel (2/5 width on large screens).
- Section header with clock SVG icon + indigo count badge showing entry count.
- Timeline-style layout: each entry has an indigo dot, message, and mono timestamp below.
- Newest entry animates in with `animate-slide-up`.
- Scrollable body (`max-h-60 overflow-y-auto`) for long logs.
- Empty state: clipboard SVG icon + italic "No activity yet."
- "Clear all" button in header (red on hover).
- Log persisted to localStorage alongside items; capped at 10 entries.

---

## 7. Persistence

- On every state change (create, update, delete): serialize `{ items, log }` to `localStorage` under the key `apex_inventory`.
- On app load: read from `localStorage`; if no data exists, seed with 10 sample items.
- Initial load is cached at module level (`const initialData = load()`) to avoid double-parsing.

---

## 8. Sample Seed Data

```json
[
  { "id": "1",  "name": "Classic T-Shirt",   "sku": "TS-001", "category": "Apparel",     "price": 19.99, "quantity": 42 },
  { "id": "2",  "name": "Running Shoes",     "sku": "SH-042", "category": "Footwear",    "price": 89.99, "quantity": 8  },
  { "id": "3",  "name": "Water Bottle",      "sku": "WB-007", "category": "Accessories", "price": 12.49, "quantity": 0  },
  { "id": "4",  "name": "Yoga Mat",          "sku": "YM-003", "category": "Fitness",     "price": 34.99, "quantity": 15 },
  { "id": "5",  "name": "Wireless Earbuds",  "sku": "WE-101", "category": "Electronics", "price": 59.99, "quantity": 3  },
  { "id": "6",  "name": "Resistance Bands",  "sku": "RB-009", "category": "Fitness",     "price": 14.99, "quantity": 27 },
  { "id": "7",  "name": "Canvas Backpack",   "sku": "CB-055", "category": "Accessories", "price": 44.99, "quantity": 6  },
  { "id": "8",  "name": "Denim Jacket",      "sku": "DJ-021", "category": "Apparel",     "price": 74.99, "quantity": 0  },
  { "id": "9",  "name": "USB-C Hub",         "sku": "UH-300", "category": "Electronics", "price": 29.99, "quantity": 11 },
  { "id": "10", "name": "Leather Sneakers",  "sku": "LS-088", "category": "Footwear",    "price": 110.0, "quantity": 4  }
]
```

---

## 9. Component Tree

```
App (max-w-[1400px], gradient bg, dark mode)
├── Header (gradient navbar, SVG cube icon, dark mode toggle, Import CSV + Add Item buttons)
├── StatsBar (3 gradient cards with SVG icons, responsive grid)
├── Toolbar (search, Export Excel button, animated bulk-delete button)
├── InventoryTable (rounded-2xl, sort indicators, rich empty state)
│   └── TableRow ×n (avatar, SKU chip, category badge, qty badge, SVG actions)
├── ChartsPanel (multi-color Recharts BarChart, CSS var tooltip, 3/5 grid)
├── ActivityLog (timeline dots, count badge, scrollable, 2/5 grid)
├── ItemModal (backdrop blur, scale-in, drag-drop image upload)
├── CsvImportModal (3-phase: upload → preview → summary, PapaParse)
├── ConfirmDialog (centered warning icon, backdrop blur, scale-in)
├── ToastContainer (low-stock/out-of-stock reactive alerts, bottom-right)
└── Footer (minimal centered text)
```

---

## 10. Acceptance Criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Stats bar shows correct counts on initial load and after every CRUD operation. | PASS |
| 2 | Table displays all items with correct column values. | PASS |
| 3 | Clicking a column header sorts that column; clicking again reverses order. | PASS |
| 4 | Search input filters rows in real-time across name, SKU, and category. | PASS |
| 5 | "Add Item" opens a modal; submitting a valid form adds the item to the table and updates stats. | PASS |
| 6 | Submitting with missing or invalid fields shows inline validation errors without closing the modal. | PASS |
| 7 | "Edit" opens the modal pre-filled; saving updates the row in place. | PASS |
| 8 | "Delete" shows a confirmation dialog; confirming removes the row; cancelling does not. | PASS |
| 9 | Rows with quantity 0 have a red tint; rows with 1–9 have a yellow/amber tint. | PASS |
| 10 | Data survives a full page refresh (localStorage persistence). | PASS |
| 11 | `npm run build` exits with 0 TypeScript and 0 lint errors. | PASS |
| 12 | Stretch: chart, activity log, image upload, and bulk delete all functional. | PASS |
| 13 | CSV import: upload, preview with per-row validation, import valid rows. | PASS |
| 14 | Excel export: downloads .xlsx with Inventory + Summary sheets. | PASS |
| 15 | Low-stock toast alerts appear reactively, auto-dismiss after 6s. | PASS |
| 16 | Dark mode: togglable, persisted, respects system preference, all components styled. | PASS |

---

## 11. Design System

| Token | Value |
|---|---|
| Font family | `Inter`, system-ui, -apple-system, sans-serif |
| Base palette | `slate` (backgrounds, borders, text) |
| Accent | `indigo` / `purple` (interactive elements, links, badges) |
| Success | `emerald` / `green` (Add button, Save button) |
| Danger | `rose` / `red` (Delete, Out of stock) |
| Warning | `amber` / `orange` (Low stock) |
| Border radius (inputs) | `rounded-xl` (12px) |
| Border radius (cards) | `rounded-2xl` (16px) |
| Animations | `fade-in` (0.2s), `slide-up` (0.25s), `scale-in` (0.2s) |
| Shadows | `shadow-sm` on cards, `shadow-lg` with colored tints on buttons |
| Icons | Inline SVGs (Heroicons-style), no icon library |
| Scrollbar | Custom thin 6px, slate-colored (dark: slate-600) |
| Dark mode | `darkMode: 'class'`; CSS variables for chart tooltip; `useTheme` hook with `localStorage` key `apex_theme` |
| Dark backgrounds | `slate-950` (body), `slate-900` (cards/modals), `slate-800` (inputs/headers) |
| Dark borders | `slate-700` (primary), `slate-800` (dividers) |
| Dark text | `slate-200` (primary), `slate-400`/`slate-500` (secondary) |
