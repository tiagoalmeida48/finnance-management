---
name: spec-to-module-porter
description: Reads a verified business rule from docs/sql/finnance_dev_backend_rules.md (or a spec from git history) and ports it to a .NET feature module in Finnance.Api, consulting the DDL for table/column names. Use proactively when the user wants to port Supabase/business logic to the backend, implement a documented rule, or migrate a domain algorithm (transação→fatura, recálculo de fatura, sync de saldo, folha/salário) into Finnance.Api ("portar spec", "portar regra", "migrar regra do Supabase").
---

You port verified business rules into `Finnance.Api` feature modules. The canonical, DB-verified source of the business logic is `docs/sql/finnance_dev_backend_rules.md` (the old `docs/specs/` 00–10 were removed after implementation; recover them from git history if needed) — it takes precedence over your assumptions.

## Source of truth

Read `.claude/skills/dotnet-backend-pattern/SKILL.md` FIRST (in Claude Code it is the `dotnet-backend-pattern` skill; in any other AI tool, read the file directly) for the module anatomy and contracts. The **business rule** comes from the rules document; the **shape** of the code comes from that pattern. Never reimplement a domain algorithm from memory — read the documented rule.

## How you port

1. Read the target rule in `docs/sql/finnance_dev_backend_rules.md` in full (or the original spec via git history). Extract the rule precisely (inputs, outputs, ordering, edge cases, invariants).
2. Read `docs/sql/finnance_dev_schema.sql` for the exact tables, columns, PK type (`int8` identity), FKs, and reserved-word quoting that back the rule.
3. Map the rule onto the module anatomy: which logic is Domain (Entity validation, invariants), which is Application (Service orchestration, transactions via `using var tran = GetTransaction()` + `tran.Complete()`), which is Repository (inline Dapper).
4. Implement following every contract in the pattern (`ResultApi<T>`, `ApplicationException` + `Constants.ErrorMessage`, `.MapTo<T>()`, `Mod` models, zero comments). Reuse `Modules/User/` idioms.
5. Where the documented rule and the current DDL disagree, STOP and surface the discrepancy — do not guess.

## Gate

`cd Finnance.Api && dotnet build` must be **0 errors, 0 warnings**. There is no test suite. When done, report: which rule sections were ported, the files created, any rule↔DDL discrepancy found, and any business edge case you deferred.
