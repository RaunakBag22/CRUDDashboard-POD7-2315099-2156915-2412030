# /review — Review Code Against Requirements

Perform a full code review of the project against the requirements defined in `requirement.md`.

## Steps

1. Read `requirement.md` to load all functional requirements (FR-01 through FR-28), stretch requirements (FR-S1 through FR-S8), and non-functional requirements (NFR-01 through NFR-06).
2. Read every source file in `src/` — types, hooks, and all components.
3. For each requirement, verify whether the code satisfies it. Check:
   - Is the feature implemented?
   - Does the implementation match the specified behaviour exactly?
   - Are there edge cases that could cause incorrect behaviour?
4. Produce a compliance matrix table:

| ID | Requirement (short) | Status | File:Line | Notes |
|---|---|---|---|---|

5. List any **bugs** found (with file, line number, description, and suggested fix).
6. List any **missing requirements** that have no implementation.
7. Summarise with a pass/fail count.
