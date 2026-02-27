# /add-component — Scaffold a New React Component

Create a new React component following the project's established patterns.

## Arguments

- `$ARGUMENTS` — The component name and a brief description (e.g., `Pagination a paginated navigation bar below the table`)

## Steps

1. Parse the component name from the first word of `$ARGUMENTS`. The rest is the description.
2. Verify that `src/components/{ComponentName}.tsx` does not already exist.
3. Create `src/components/{ComponentName}.tsx` following these conventions:
   - Use `import type { FC } from 'react'`
   - Define a `Props` interface with proper TypeScript types
   - Export the component as `export default ComponentName`
   - Use Tailwind CSS utility classes for styling (no inline styles, no CSS modules)
   - Import shared types from `../types` when needed
4. Show the user the created file and suggest where to wire it in `App.tsx`.
5. Run `npm run build` to verify the new component compiles.

## Conventions (read from existing code)

- All components are functional (`FC<Props>`)
- Props interfaces are defined locally in the component file (not exported)
- Tailwind classes: rounded corners (`rounded-lg` / `rounded-xl`), consistent padding (`px-4 py-3`), border colours from gray/blue/red/yellow palette
- Event handlers are passed as props, not defined internally with side effects
