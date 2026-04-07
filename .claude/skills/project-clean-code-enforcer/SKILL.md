---
name: project-clean-code-enforcer
description: Validate and refactor repository structure with strict clean-code rules. Use when asked to enforce a 300-line max per source file, remove non-mandatory comments, eliminate duplicated code, split oversized files, and apply clean-code principles across the whole project ("clean code", "duplicidade", "arquivo grande", "max 300 linhas").
---

# Project Clean Code Enforcer

Apply a deterministic workflow to audit and refactor the full codebase without changing behavior.

## Non-Negotiable Rules

- Keep source files at 300 lines or less after refactor.
- Remove non-mandatory comments from touched files.
- Eliminate duplicated logic by extracting shared modules.
- Preserve runtime behavior and public contracts.
- Validate with project lint, tests, and build before finalizing.

Preserve only mandatory legal or compliance headers when required.

## Workflow

1. Define scope and exclude generated/vendor folders.
2. Run structural audit with:
   `pwsh -File .agent/skills/project-clean-code-enforcer/scripts/audit-project-structure.ps1 -Root . -MaxLines 300 -OutFile structure-audit-report.json`
3. Prioritize execution:
   - First: files above 300 lines.
   - Second: exact duplicate files (same normalized content hash).
   - Third: repeated local logic found during refactor.
4. Refactor oversized files in safe slices:
   - Extract pure utilities to shared modules.
   - Extract UI blocks into smaller components.
   - Extract state/effects into hooks or services.
   - Keep each module with one clear responsibility.
5. Remove comments and make intent explicit through naming, function boundaries, and data flow.
6. Remove duplication:
   - Consolidate repeated business logic.
   - Reuse shared types/contracts.
   - Delete dead wrappers created by prior copy-paste.
7. Validate behavior:
   - Run the repository lint command.
   - Run relevant tests for touched areas.
   - Run project build.
   - Re-run audit script and confirm line-limit compliance.
8. Report outcome:
   - Files split and new modules created.
   - Duplicated blocks removed.
   - Remaining violations and deferral rationale.

## Refactor Tactics

### Split a large page or component

- Move orchestration/state to a focused hook.
- Move presentational sections to dedicated components.
- Move formatting/mapping helpers to utilities.
- Keep page/component focused on composition and wiring.

### Split a large service module

- Separate transport calls from domain transformations.
- Keep one use case per function when feasible.
- Co-locate types/contracts used by multiple service functions.

### Deduplication hierarchy

- Prefer small pure function extraction first.
- Prefer composition over inheritance.
- Create abstractions only after at least two stable call sites.

## Definition of Done

- No targeted source file exceeds 300 lines.
- No avoidable duplicate logic remains in touched scope.
- Non-mandatory comments removed in touched files.
- Lint/tests/build pass or failures are explicitly documented.
- Existing user flows are preserved.

## Resources

- Use `references/clean-code-refactor-checklist.md` as the per-file quality checklist.
- Use `scripts/audit-project-structure.ps1` for repeatable line and duplication audit.
