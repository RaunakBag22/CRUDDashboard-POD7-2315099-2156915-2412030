# /check — Build + Lint Verification

Run a full health check on the project: TypeScript compilation, Vite production build, and ESLint.

## Steps

1. Run `npm run build` (which runs `tsc -b && vite build`). Report any TypeScript errors or build failures.
2. Run `npm run lint`. Report any linting errors or warnings.
3. Summarise results in a table:

| Check | Status | Details |
|---|---|---|
| TypeScript | PASS/FAIL | error count |
| Vite Build | PASS/FAIL | bundle sizes |
| ESLint | PASS/FAIL | error/warning count |

If all checks pass, respond with a single confirmation line. If any check fails, show the errors and suggest fixes.
