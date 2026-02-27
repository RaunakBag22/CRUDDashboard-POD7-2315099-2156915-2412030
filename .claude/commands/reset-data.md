# /reset-data — Reset Seed Data

Regenerate or modify the seed data used to populate the dashboard on first load.

## Steps

1. Read the current seed data file at `src/data/seedData.ts`.
2. If the user provided `$ARGUMENTS`, use that as instructions for what to change (e.g., "add 5 more electronics items", "change all quantities to 0", "use realistic product names").
3. If no arguments provided, regenerate with the default 10 items from `spec.md` section 8.
4. Write the updated `src/data/seedData.ts`, ensuring:
   - Every item conforms to the `Item` interface from `../types`
   - Each `id` is a unique string
   - Each `sku` is unique and follows the `XX-NNN` pattern
   - Prices are realistic positive numbers
   - Quantities include a mix: some 0 (out of stock), some 1-9 (low stock), some 10+ (normal)
   - Categories are varied (at least 4 distinct categories)
5. Remind the user to clear `localStorage` (key: `apex_inventory`) in the browser to see the new seed data, since the app only seeds when storage is empty.
6. Run `npm run build` to verify the file compiles.
