# Clean Code Refactor Checklist

Use this checklist for each touched file during large cleanup waves.

## 1. Scope and Safety

- Confirm the file belongs to active source code.
- Confirm baseline behavior before refactor.
- Confirm line target is 300 lines or less.

## 2. Structure

- Keep one main responsibility per file.
- Keep public API and side effects explicit.
- Move unrelated logic to focused modules.

## 3. Duplication

- Remove copy-pasted logic by extraction.
- Reuse shared types and contracts.
- Delete obsolete wrappers and dead code.

## 4. Readability Without Comments

- Remove non-mandatory comments.
- Use explicit naming for functions, variables, and modules.
- Replace long branches with small named functions when needed.

## 5. Complexity

- Keep function complexity low and testable.
- Reduce deep nesting by early returns and guard clauses.
- Isolate transformation logic from transport and rendering.

## 6. Validation

- Run linter for touched scope.
- Run tests for touched scope.
- Run build for integration confidence.
- Re-run structure audit and confirm no line-limit violations.

## 7. Delivery

- Summarize files split and modules extracted.
- Summarize duplication removed.
- Document any deferred cleanup item with reason.
