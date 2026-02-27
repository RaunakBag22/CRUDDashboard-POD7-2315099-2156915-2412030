# Requirements — Project Apex: Intelligent Inventory Hub

## 1. Project Overview

**Product Name:** Project Apex — Intelligent Inventory Hub
**Type:** Single-Page Web Application (SPA)
**Target User:** Store managers / small business owners
**Core Problem:** Businesses managing inventory through spreadsheets or manual notes lack real-time visibility into stock health, leading to poor decisions and wasted time.

---

## 2. Stakeholders

| Role | Concern |
|---|---|
| Store Manager | Needs fast, accurate view of all inventory at a glance |
| Business Owner | Wants insights (low stock, out-of-stock) to prevent lost sales |
| Developer | Needs clear, well-structured requirements for a clean prototype |

---

## 3. User Story

> *"As a store manager, I want to see all my items in a central dashboard, be able to add, update, and remove stock instantly, and get quick insights into my inventory's health, so I can make smarter decisions and stop wasting time on manual data entry."*

---

## 4. Functional Requirements

### 4.1 Dashboard View

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Display a stats bar with **Total Unique Items**, **Items Low on Stock**, and **Items Out of Stock** | Must Have |
| FR-02 | Stats update immediately after every create, update, or delete operation | Must Have |
| FR-03 | Display all inventory items in a sortable table | Must Have |
| FR-04 | Table columns: Name, SKU, Category, Price, Quantity, Actions | Must Have |
| FR-05 | Clicking any column header sorts the table by that column (asc → desc toggle) | Must Have |
| FR-06 | A single search bar filters the table in real-time across Name, SKU, and Category | Must Have |

### 4.2 Create Item

| ID | Requirement | Priority |
|---|---|---|
| FR-07 | An "Add Item" button opens a modal form | Must Have |
| FR-08 | Form fields: Name, SKU, Category, Price, Quantity | Must Have |
| FR-09 | All fields are required except Image | Must Have |
| FR-10 | SKU must be unique across all existing items | Must Have |
| FR-11 | Price must be a number ≥ 0 | Must Have |
| FR-12 | Quantity must be a non-negative integer | Must Have |
| FR-13 | Inline validation errors are shown without closing the modal | Must Have |
| FR-14 | Submitting a valid form adds the item and closes the modal | Must Have |
| FR-15 | Cancelling or clicking outside the modal discards the form without saving | Must Have |

### 4.3 Update Item

| ID | Requirement | Priority |
|---|---|---|
| FR-16 | Each table row has an "Edit" button | Must Have |
| FR-17 | Clicking Edit opens the same modal pre-populated with the item's current values | Must Have |
| FR-18 | SKU uniqueness check during edit excludes the item's own existing SKU | Must Have |
| FR-19 | Saving a valid edit updates the item in place | Must Have |

### 4.4 Delete Item

| ID | Requirement | Priority |
|---|---|---|
| FR-20 | Each table row has a "Delete" button | Must Have |
| FR-21 | Clicking Delete opens a confirmation dialog before removal | Must Have |
| FR-22 | Confirming deletion removes the item and updates the stats bar | Must Have |
| FR-23 | Cancelling the dialog leaves the item unchanged | Must Have |

### 4.5 Low-Stock Alert

| ID | Requirement | Priority |
|---|---|---|
| FR-24 | Rows with `quantity === 0` are highlighted with a red background | Must Have |
| FR-25 | Rows with `0 < quantity < 10` are highlighted with a yellow/amber background | Must Have |
| FR-26 | A legend below the table explains the colour coding | Must Have |

### 4.6 Data Persistence

| ID | Requirement | Priority |
|---|---|---|
| FR-27 | All inventory data persists across page refreshes via `localStorage` | Must Have |
| FR-28 | On first load (empty storage), the app seeds 10 representative sample items | Must Have |

---

## 5. Stretch / Nice-to-Have Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-S1 | A bar chart visualises total quantity grouped by category | Should Have |
| FR-S2 | Users can upload a product image when creating or editing an item | Could Have |
| FR-S3 | A thumbnail (32 × 32 px) is displayed in the Name column for items with images | Could Have |
| FR-S4 | Checkboxes on each row allow multi-selection for bulk delete | Should Have |
| FR-S5 | A "Delete Selected (n)" button appears in the toolbar when rows are selected | Should Have |
| FR-S6 | Bulk delete shows a single confirmation dialog before removing all selected items | Should Have |
| FR-S7 | An Activity Log panel shows the last 10 actions with timestamp and description | Should Have |
| FR-S8 | A "Clear Log" button empties the activity log | Could Have |
| FR-S9 | CSV import: upload a .csv file, preview with per-row validation, import valid rows via `bulkAdd` | Should Have |
| FR-S10 | Excel export: download a .xlsx file with Inventory + Summary sheets | Should Have |
| FR-S11 | Low-stock toast alerts: reactive notifications for out-of-stock and low-stock items, auto-dismiss after 6s | Should Have |
| FR-S12 | Dark mode: togglable via header button, persisted to localStorage, respects system preference | Should Have |

---

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | The application must function entirely client-side — no backend, no authentication |
| NFR-02 | All interactions (search, sort, CRUD) must feel instant with no perceptible lag |
| NFR-03 | The UI must be responsive and usable on screens ≥ 768 px wide |
| NFR-04 | The codebase must use TypeScript with strict mode enabled |
| NFR-05 | All components must be functional React components with proper typing |
| NFR-06 | The production build must complete without TypeScript or lint errors |
| NFR-07 | The UI must use a modern design system with Inter font, gradient accents, custom animations, and inline SVG icons |
| NFR-08 | Modals must use backdrop blur and entrance animations for a polished feel |
| NFR-09 | Table rows must use semantic visual indicators: avatar placeholders, category badges, SKU chips, and quantity status badges |
| NFR-10 | Dark mode must apply consistently to all components with `dark:` Tailwind variants and CSS variables for third-party elements (chart tooltips) |

---

## 7. Out of Scope (for this prototype)

- User authentication and role-based access
- Multi-user collaboration or real-time sync
- Backend API or database
- Export to CSV / PDF (note: Excel .xlsx export IS implemented)
- Email or push notifications for low-stock alerts
- Mobile-native (iOS / Android) experience

---

## 8. Assumptions & Constraints

- `LOW_STOCK_THRESHOLD` is fixed at **10 units** for this prototype.
- Image uploads store data as base64 inside `localStorage`; large images may hit browser storage limits.
- The app targets modern evergreen browsers (Chrome, Edge, Firefox, Safari).
- No accessibility (WCAG) audit is required for the prototype, though semantic HTML should be used where natural.

---

## 9. Implementation Status

All 28 functional requirements (FR-01 → FR-28), all 12 stretch requirements (FR-S1 → FR-S12), and all 10 non-functional requirements (NFR-01 → NFR-10) are **implemented and passing**. Build passes with 0 TypeScript errors and 0 lint errors.
