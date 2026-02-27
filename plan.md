# Implementation Plan — Project Apex: Intelligent Inventory Hub

## 1. Project Summary

Build a React + TypeScript SPA using Vite and Tailwind CSS that allows store managers to manage inventory through a CRUD dashboard. All data is persisted in `localStorage`. No backend is required.

---

## 2. Tech Stack Decision

| Concern | Decision | Rationale |
|---|---|---|
| Framework | React 18 | Component model maps naturally to dashboard widgets |
| Language | TypeScript (strict) | Catches data-shape bugs early; improves IDE experience |
| Build tool | Vite | Fast HMR, zero-config TS/JSX support |
| Styling | Tailwind CSS v3 + custom animations + dark mode | Utility-first; `darkMode: 'class'` strategy |
| Font | Inter (Google Fonts) | Clean, modern sans-serif; loaded via `index.html` |
| State | `useState` + `useCallback` | No external library needed for this scale |
| Persistence | `localStorage` | Meets the no-backend prototype requirement |
| Charts | Recharts | Declarative, React-native, well-documented |
| CSV parsing | PapaParse | Handles quoted fields, BOM, encoding edge cases |
| Excel export | SheetJS (xlsx) | Client-side .xlsx generation, no server needed |
| ID generation | `crypto.randomUUID()` | Built into modern browsers; no dependency needed |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  (owns modal state, delete-confirm state, selection state)  │
├──────────┬──────────┬───────────────────────────────────────┤
│  Header  │ StatsBar │           Toolbar                     │
├──────────┴──────────┴───────────────────────────────────────┤
│                    InventoryTable                           │
│                    └── TableRow (×n)                        │
├─────────────────────────┬───────────────────────────────────┤
│      ChartsPanel        │         ActivityLog               │
└─────────────────────────┴───────────────────────────────────┘
          ↑ all read from / write to useInventory hook
                           ↕
                      localStorage
```

**Data flow (unidirectional):**
1. `useInventory` hook owns `items[]` and `log[]`.
2. Every mutation in the hook syncs both arrays to `localStorage` via `useEffect`.
3. `App.tsx` reads from the hook and passes data + callbacks down to child components.
4. No child component writes to `localStorage` directly.

---

## 4. File Structure

```
src/
├── types.ts                  ← Item, LogEntry, ModalState, SortField, SortDirection
├── data/
│   └── seedData.ts           ← 10 sample items for first-run seeding
├── hooks/
│   ├── useInventory.ts       ← CRUD + bulkAdd + localStorage persistence (cached init)
│   └── useTheme.ts           ← Dark/light mode toggle + localStorage + system preference
├── utils/
│   ├── csvParser.ts          ← PapaParse wrapper + row validation + template download
│   └── excelExport.ts        ← SheetJS xlsx export (Inventory + Summary sheets)
├── components/
│   ├── Header.tsx            ← Gradient navbar + dark mode toggle + Import CSV + Add Item
│   ├── StatsBar.tsx          ← 3 gradient stat cards with SVG icons
│   ├── Toolbar.tsx           ← Search + Export Excel button + animated bulk-delete
│   ├── InventoryTable.tsx    ← Rounded-2xl table + sort indicators + rich empty state
│   ├── TableRow.tsx          ← Avatar, SKU chip, category badge, qty badge, SVG actions
│   ├── ItemModal.tsx         ← Backdrop blur + scale-in + drag-drop image upload
│   ├── ConfirmDialog.tsx     ← Centered warning icon + backdrop blur + scale-in
│   ├── ActivityLog.tsx       ← Timeline dots + count badge + scrollable
│   ├── ChartsPanel.tsx       ← Multi-color Recharts BarChart with CSS var tooltip
│   ├── CsvImportModal.tsx   ← 3-phase import modal (upload → preview → summary)
│   └── ToastContainer.tsx   ← Low-stock / out-of-stock reactive toast alerts
├── App.tsx                   ← Root: max-w-[1400px], gradient bg, dark mode, footer
├── main.tsx                  ← React DOM entry point
├── index.css                 ← Tailwind directives + custom scrollbar + glass-card
└── vite-env.d.ts             ← Vite client type reference

.claude/
├── settings.json             ← Hooks: auto-lint, type-check, build verify, audit log
└── commands/                 ← Custom skills: /check, /review, /add-component, etc.

Config files:
├── eslint.config.js          ← ESLint 9 flat config (TS + React hooks + refresh)
├── tailwind.config.js        ← darkMode:'class' + Inter font + fade-in/slide-up/scale-in
├── .gitignore                ← node_modules, dist, IDE, OS, env
```

---

## 5. Implementation Phases

### Phase 1 — Project Scaffolding
**Goal:** Working dev server with React + TS + Tailwind.

| Task | Output |
|---|---|
| Write `package.json` with all dependencies | `package.json` |
| Configure Vite, TypeScript, Tailwind, PostCSS | `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js` |
| Create `index.html` and `src/main.tsx` | App shell renders without error |
| Add Tailwind directives to `src/index.css` | Tailwind classes work |
| Run `npm install` | `node_modules/` populated |

---

### Phase 2 — Data Layer
**Goal:** Stable, tested data model and hook before any UI is built.

| Task | Output |
|---|---|
| Define `Item`, `LogEntry`, `ModalState`, `SortField` interfaces | `src/types.ts` |
| Write 10 representative seed items | `src/data/seedData.ts` |
| Implement `useInventory` hook | `src/hooks/useInventory.ts` |

**`useInventory` contract:**

```ts
{
  items: Item[]
  log: LogEntry[]
  addItem(data: Omit<Item, 'id'>): void
  updateItem(id: string, data: Omit<Item, 'id'>): void
  deleteItem(id: string, name: string): void
  bulkDelete(ids: string[]): void
  clearLog(): void
}
```

**Storage key:** `apex_inventory`
**Log cap:** 10 entries (trim on prepend)

---

### Phase 3 — Core UI Components (MVP)
**Goal:** Dashboard is visible and interactive with all MVP features.

#### 3a — Layout Shell
- `Header.tsx` — gradient navbar (`slate-900` → `slate-800`) with SVG cube icon, app name, and hover-lift "Add Item" CTA (gradient green, rotating `+` icon).
- `StatsBar.tsx` — 3 gradient stat cards (blue/amber/rose) with SVG icons and decorative circle accents. Responsive (`grid-cols-1 sm:grid-cols-3`).

#### 3b — Inventory Table
- `InventoryTable.tsx` — `rounded-2xl` table with sort indicators (faded `↕` on hover, bold `↑`/`↓` active). Rich empty state with icon + subtitle. Gradient dot legend.
- `TableRow.tsx` — avatar placeholder (first letter) or thumbnail with ring, SKU in mono chip, category in indigo pill badge, quantity in status badge with dot indicator, SVG Edit/Delete buttons. Backgrounds: `bg-red-50/80` (out), `bg-amber-50/80` (low), transparent (normal).

#### 3c — CRUD Modals
- `ItemModal.tsx` — single component handling Create and Edit. Backdrop blur (`bg-slate-900/60 backdrop-blur-sm`) with `animate-scale-in`. Close X button, subtitle, placeholder hints, drag-drop style image upload with preview and Remove option. Gradient Save button (indigo → purple). Inline validation with red dot + message.
- `ConfirmDialog.tsx` — centered warning icon in red circle, full-width buttons, gradient red → rose Confirm. Reused for single-delete and bulk-delete.

#### 3d — App Wiring (`App.tsx`)
- Derives `visibleItems` (filtered + sorted) with `useMemo`.
- Derives `existingSkus` excluding the item under edit.
- Manages `modal`, `deleteTarget`, `bulkDeletePending`, `search`, `selectedIds`, `sortField`, `sortDirection` as local state.
- Passes all data and callbacks down; no prop drilling beyond one level.

---

### Phase 4 — Stretch Features
**Goal:** Add value-adds once the MVP is stable.

| Feature | Component | Notes |
|---|---|---|
| Bar chart | `ChartsPanel.tsx` | Multi-color bars (one color per category via `Cell`); styled tooltip with rounded corners and shadow |
| Activity log | `ActivityLog.tsx` | Timeline dots + count badge + scrollable `max-h-60`; newest entry slides in with `animate-slide-up` |
| Image upload | Inside `ItemModal.tsx` | Drag-drop style upload area; `80×80` preview with Remove; avatar placeholder in `TableRow` |
| Bulk delete | `Toolbar.tsx` + `ConfirmDialog.tsx` | Checkbox state in `App`; "Delete Selected (n)" with trash SVG appears with `animate-fade-in` |

---

### Phase 5 — Build Verification
**Goal:** Zero TypeScript and lint errors; production build succeeds.

| Task | Command |
|---|---|
| Type-check + build | `npm run build` |
| Local preview of production build | `npm run preview` |
| Lint | `npm run lint` |

---

## 6. Key Design Decisions

### Single modal for Create + Edit
The `ItemModal` receives a `mode: 'create' | 'edit'` prop and an optional `item`. A `useEffect` resets form state whenever mode or item changes. This avoids duplicating form logic in two separate components.

### Stats reflect unfiltered data
The `StatsBar` always receives the full `items` array from the hook, not the `visibleItems` derived list. This ensures stats show true inventory health regardless of active search.

### `deleteItem` accepts name explicitly
The hook's `deleteItem(id, name)` signature receives the item name from the caller rather than looking it up inside the hook. This avoids a stale-closure issue and keeps the hook pure with respect to its state.

### No external state manager
At this scale (single page, ~10 components, one data entity), React's built-in `useState` + `useCallback` is sufficient. Introducing Redux or Zustand would add complexity with no benefit.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `localStorage` quota exceeded by base64 images | Medium | Low | Warn user; images are optional |
| Stale `selectedIds` after delete | Low | Medium | Filter `selectedIds` on every delete/bulk-delete |
| SKU uniqueness check misses edge case during edit | Low | High | Exclude current item's id from the check in `existingSkus` derivation |
| Recharts bundle size bloat | High | Low | Acceptable for prototype; code-split if needed later |

---

## 8. Definition of Done

- [x] `npm run build` exits with code 0 (no TS or lint errors).
- [x] `npm run lint` exits with code 0.
- [x] Stats bar shows correct counts on load and after every mutation.
- [x] Sorting works on all 5 columns, toggling asc/desc.
- [x] Search filters rows in real-time across name, SKU, and category.
- [x] Create, Edit, Delete all work with proper validation and confirmation.
- [x] Low-stock rows are visually highlighted correctly.
- [x] Data survives a full page refresh.
- [x] Stretch: chart, activity log, image upload, and bulk delete all functional.
- [x] Modern UI: Inter font, gradients, animations, SVG icons, backdrop blur, polished components.
- [x] `.claude/settings.json` hooks configured (auto-lint, type-check, build verify).
- [x] `.claude/commands/` skills created (/check, /review, /test-crud, /add-component, /add-hook, /reset-data, /deploy-preview).
- [x] CSV import: PapaParse parsing, per-row validation, 3-phase modal, `bulkAdd` hook method.
- [x] Excel export: 2-sheet .xlsx (Inventory + Summary) via SheetJS.
- [x] Low-stock toast alerts: reactive `ToastContainer`, auto-dismiss, dismissible.
- [x] Dark mode: `useTheme` hook, system preference detection, localStorage persistence, all 12 components styled.
