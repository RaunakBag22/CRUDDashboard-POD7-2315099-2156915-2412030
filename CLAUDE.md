# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

The application is **fully built and functional**. All MVP and stretch features are implemented. The production build passes with 0 TypeScript and 0 lint errors.

Key documentation:
- [projectbrief.md](projectbrief.md) — original product requirements
- [spec.md](spec.md) — technical specification
- [requirement.md](requirement.md) — formal requirements (FR-01 → FR-28, FR-S1 → FR-S8)
- [plan.md](plan.md) — implementation plan with architecture diagrams
- [hooks.md](hooks.md) — hook API reference
- [prompts.md](prompts.md) — full prompt log across all missions

## Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite 6 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + custom animations + dark mode (`class` strategy) |
| Font | Inter (Google Fonts, loaded via `index.html`) |
| State | React `useState` / `useCallback` (no external state lib) |
| Persistence | `localStorage` (keys: `apex_inventory`, `apex_theme`) |
| Charts | Recharts (multi-color `BarChart` with `Cell`) |
| CSV parsing | PapaParse |
| Excel export | SheetJS (xlsx) |
| IDs | `crypto.randomUUID()` |
| Linting | ESLint 9 (flat config) + typescript-eslint + react-hooks + react-refresh |

## Development Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (Vite, hot-reload)
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint (flat config)
```

## Custom Skills (slash commands)

Defined in `.claude/commands/`:

| Command | What it does |
|---|---|
| `/check` | Run build + lint, report pass/fail table |
| `/review` | Full code review against `requirement.md` |
| `/test-crud` | Generate & run full CRUD test suite (Vitest + Testing Library) |
| `/add-component <Name> <description>` | Scaffold a new React component |
| `/add-hook <useName> <description>` | Scaffold a new custom hook + update `hooks.md` |
| `/reset-data [instructions]` | Regenerate seed data |
| `/deploy-preview` | Production build + Vite preview server |

## Architecture

Single-page application, no routing, no backend. Max-width centered layout (`1400px`).

### Data flow

```
localStorage  ←→  useInventory hook  →  App  →  child components
```

`useInventory` owns `items[]` and `log[]`. It exposes `addItem`, `bulkAdd`, `updateItem`, `deleteItem`, `bulkDelete`, `clearLog`. Every mutation syncs to `localStorage` via `useEffect`. Initial load is cached at module level to avoid double-parsing. `useTheme` manages light/dark mode with `localStorage` persistence + system preference detection.

### Component hierarchy

```
App (max-w-[1400px], gradient background, dark mode support)
├── Header         (gradient navbar, SVG icon, hover-lift Add/Import buttons, dark mode toggle)
├── StatsBar       (3 gradient stat cards with SVG icons)
├── Toolbar        (search, Export Excel button, animated bulk-delete button)
├── InventoryTable (rounded-2xl table, sort indicators, rich empty state)
│   └── TableRow   (avatar placeholder, category badge, quantity badge, SVG action buttons)
├── ChartsPanel    (multi-color Recharts BarChart, 3/5 grid left)
├── ActivityLog    (timeline dots, count badge, scrollable, 2/5 grid right)
├── ItemModal      (backdrop blur + scale-in, drag-drop image upload)
├── CsvImportModal (3-phase: upload → preview → summary, PapaParse)
├── ConfirmDialog  (centered warning icon, backdrop blur + scale-in)
├── ToastContainer (low-stock/out-of-stock alerts, bottom-right, auto-dismiss)
└── Footer         (minimal text)
```

### Design system

- **Dark mode:** `darkMode: 'class'` in Tailwind; toggled via `useTheme` hook; persisted to `localStorage` key `apex_theme`; respects `prefers-color-scheme` on first visit
- **Color palette:** `slate` base, `indigo`/`purple` accents, `emerald` for success, `rose`/`red` for danger, `amber` for warnings
- **Dark palette:** `slate-950`/`slate-900` backgrounds, `slate-700` borders, `slate-200` text; colored accents unchanged
- **Gradients:** Used on header, stat cards, buttons, and modals
- **Shadows:** `shadow-lg` with colored variants (`shadow-indigo-500/25`, `shadow-emerald-500/25`)
- **Animations:** `animate-fade-in`, `animate-slide-up`, `animate-scale-in` (defined in `tailwind.config.js`)
- **Border radius:** `rounded-xl` for inputs/buttons, `rounded-2xl` for cards/tables/modals
- **Icons:** Inline SVGs (Heroicons style), no icon library dependency
- **Chart tooltip:** CSS variables (`--tooltip-bg`, `--tooltip-border`, `--tooltip-color`) for dark mode support

### Key constraints

- `LOW_STOCK_THRESHOLD = 10`: rows with `0 < quantity < 10` get amber highlight; `quantity === 0` gets red highlight.
- Stats bar always receives the **full unfiltered** `items` array; search only affects the table.
- SKU must be unique; uniqueness check during edit excludes the item being edited.
- Delete requires a confirmation dialog before removal.
- Activity log capped at 10 entries; oldest entries silently dropped.

### Hooks configuration

`.claude/settings.json` defines lifecycle hooks:
- **PreToolUse:** Guards against deleting core files (`types.ts`, `App.tsx`, `main.tsx`)
- **PostToolUse (Write):** Auto-lints `.ts`/`.tsx` files after writing
- **PostToolUse (Edit):** Runs `tsc --noEmit` after editing `types.ts` or `useInventory.ts`
- **Stop:** Verifies `npm run build` on agent turn end
- **Notification / SubagentStop:** Appends to `.claude/agent.log`
