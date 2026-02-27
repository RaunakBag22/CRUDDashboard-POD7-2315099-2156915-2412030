# /add-hook — Scaffold a New Custom React Hook

Create a new custom React hook following the project's established patterns.

## Arguments

- `$ARGUMENTS` — The hook name and a brief description (e.g., `useSearch manages search state with debouncing`)

## Steps

1. Parse the hook name from the first word of `$ARGUMENTS` (must start with `use`). The rest is the description.
2. Verify that `src/hooks/{hookName}.ts` does not already exist.
3. Create `src/hooks/{hookName}.ts` following these conventions:
   - Import types from `../types` when referencing shared interfaces
   - Export the hook as a named export: `export function useHookName()`
   - Define a clear return type (either inline or as a named interface)
   - Wrap mutation functions in `useCallback` for stable references
   - If the hook reads/writes localStorage, follow the pattern in `useInventory.ts`:
     - Define a `load()` function with try/catch for corrupted data
     - Sync via `useEffect` on state change
   - Keep side effects (localStorage, DOM, timers) inside `useEffect`
4. Update `hooks.md` with a new section documenting the hook's signature, return type, methods, and side effects.
5. Run `npm run build` to verify the new hook compiles.
