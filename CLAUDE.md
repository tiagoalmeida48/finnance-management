# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal finance management SPA (Portuguese UI) — bank accounts, transactions, credit cards/invoices, monthly tracking, salary simulator, CSV import, Pluggy bank-sync integration, and admin user management. React 19 frontend with a Supabase backend (Auth + PostgreSQL + RLS + RPCs + Edge Functions).

The UI and all user-facing strings are pt-BR. Communicate with the user in pt-BR.

## Commands

Always use **pnpm** (never npm/yarn). Package manager is pinned to `pnpm@10.28.1`.

```bash
pnpm dev          # Vite dev server
pnpm build        # tsc -b (type-check) + vite build
pnpm lint         # eslint .
pnpm format       # prettier --write on src
pnpm preview      # preview the production build
pnpm check:ci     # eslint src + build — run this before considering work done
```

There is **no automated test suite** (Vitest and the test scripts were removed). `check:ci` is the gate: it does not run tests. Verify changes by running the app.

## Architecture

### Data flow (one direction, layered)

```
pages/[domain]  →  shared/hooks/api/ (React Query)  →  shared/services/  →  Supabase
```

- **Pages** render and own local UI state only.
- **API hooks** (`shared/hooks/api/use*.ts`) wrap React Query; query keys are centralized in `src/shared/constants/queryKeys.ts`.
- **Services** (`shared/services/`) are the only place that touches the Supabase client.

### RPCs are the business-logic boundary

Services delegate to Supabase **RPCs** (`SECURITY DEFINER` Postgres functions), not direct table writes, for anything with business rules — transaction creation, batch pay/unpay/delete, installments, invoice recalculation, dashboard aggregations, admin user CRUD. Do not reimplement that logic client-side. When adding a feature with server-side rules, add/extend an RPC migration in `supabase/migrations/` and call it from a service. The `transactions` service is split into submodules under `shared/services/transactions/` (`-core`, `-creation`, `-installments`, `-batch`, `-utils`).

### State

- **Server state** → React Query (all API data).
- **Auth** → Supabase JWT via the AuthProvider in `src/lib/supabase/`; route guards `ProtectedRoute` (logged in) and `AdminRoute` (`profile.is_admin`) in `src/routes/`.
- **UI state** → Zustand (`shared/stores/ui.store.ts`), minimal (e.g. sidebar expand/collapse).
- **Toasts** → context bridge in `shared/contexts/`.

### Routing

React Router v7, all pages lazy-loaded (route-level code splitting) with Suspense + ErrorBoundary. Vite uses manual rollup chunks: `react-core`, `charts`, `supabase`, `motion`.

## Conventions

- **Path alias:** import from `@/...` (maps to `src/`), configured in both `vite.config.ts` and `tsconfig.app.json`.
- **Logic extraction:** each page/feature component pairs with a `use*Logic` / `use*PageLogic` hook (e.g. `useTransactionsPageLogic.ts`) holding the logic; the component stays presentational. Follow this pattern for new pages.
- **Page folders** are organized by type: `components/`, `hooks/`, `modals/`.
- **Shared components** live under `shared/components/` as `ui/` (headless), `forms/`, `layout/`, `composite/`.
- **Forms:** React Hook Form + Zod schemas in `shared/schemas/`, wired via `@hookform/resolvers/zod`.
- **TypeScript is strict** with `noUnusedLocals`/`noUnusedParameters` — unused vars fail the build; prefix intentionally-unused with `_`.

## Design system

CSS custom properties in `src/App.css` are the single source of truth (colors, overlay/sidebar glass tokens, typography, radii). Prefer existing tokens over hardcoded values. `docs/design-system.html` is the visual reference for UI work.

## Database (Supabase) — constraints to respect in migrations

- `bank_accounts.current_balance` is managed by the `trg_sync_account_balance` trigger — **never write it directly**.
- `credit_cards` has no `closing_day`/`due_day` columns — read cycles from the `v_credit_cards_with_cycles` view.
- `payment_method` CHECK: `credit|debit|pix|cash|bill_payment|transfer|other`.
- `transactions.type` uses EN-only enum values; `is_paid` is `NOT NULL DEFAULT FALSE`; monetary columns are `NUMERIC(15,2)`.
- Soft deletes use `deleted_at IS NULL` + `is_active = FALSE` (accounts, cards, categories).
- Invoice linking via `trg_link_transaction_to_invoice` trigger.

### Edge Functions

`supabase/functions/pluggy-sync` and `pluggy-token` (Pluggy open-finance integration). They need `PLUGGY_CLIENT_ID` / `PLUGGY_CLIENT_SECRET` configured in Supabase.

## Environment

Frontend `.env` / `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Branching & deploy

`main` = production, `dev` = active development. Deploys to Vercel as an SPA (all routes → `/index.html`).

## Planned migration

A planned migration off Supabase to a local **.NET Core** backend is documented in `docs/specs/` (11 numbered specs, 00–10, of business rules verified against the live database). This is spec-only — no .NET code yet. Consult it before changing core business algorithms (transaction→invoice linking, invoice recalculation, balance sync, payroll).
