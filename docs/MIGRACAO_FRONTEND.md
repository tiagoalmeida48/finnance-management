# Migração do Frontend — Referencia → Finnance.Api/Frontend

Status da replicação do frontend legado (`docs/Referencia`, React + Supabase) para o app em produção (`Finnance.Api/Frontend`, React + API .NET). A migração **porta funcionalidade/UX** para o padrão atual (folder-by-type `features/<feat>/`, `apiClient`, RHF+Zod, React Query, strings pt-BR inline, sem comentários) — nunca é cópia literal. Fonte de verdade do padrão: skill `frontend-reference-port`. Agentes: `frontend-reference-auditor` (mapeia gap) e `frontend-feature-porter` (porta uma feature).

> Endpoints que faltam no backend para completar features estão em [`REFATORACAO_BACKEND.md`](./REFATORACAO_BACKEND.md).

## Já existentes antes da migração (paridade)

`accounts`, `auth`, `cards` (parcial), `categories`, `dashboard` (parcial), `salary` (parcial), `transactions` (parcial).

## Gap mapeado pela auditoria (2026-06-21)

| Feature | Status origem | Endpoints .NET | Risco | Ação |
|---|---|---|---|---|
| **users** | MISSING | prontos | baixo | portar (rota AdminRoute) |
| **profile** | MISSING | prontos (exceto avatar) | baixo | portar sem avatar; avatar → backend |
| **salary-simulator** | PARTIAL | prontos | baixo | completar tabs/payroll |
| **tracking** (BillTracking) | MISSING | prontos | médio | portar; lógica de ciclo de fatura conforme API |
| **dashboard** | PARTIAL | prontos | médio | completar charts/summary/recent (sem Pluggy) |
| **cards** | PARTIAL | prontos | alto | portar detalhes/statement no que a API suporta |
| **transactions** | PARTIAL | falta import | alto | portar; import CSV → backend |

## Resultado do port (2026-06-21)

7 features portadas no padrão folder-by-type (~70 arquivos novos), `pnpm check:ci` **verde** (eslint + tsc + vite build), zero comentários, arquivos novos ≤ 300 linhas. Rotas em `app/AppRouter.tsx` e itens em `layouts/Sidebar.tsx` costurados.

| Feature | Rota | Menu | Portado | Pendências (backend) |
|---|---|---|---|---|
| **users** | `/users` (AdminRoute) | Usuários | CRUD completo (list/create/update/reset-senha/delete) | — |
| **profile** | `/profile` | Perfil | ver/editar nome, trocar senha | self-service de nome/senha são admin-only hoje; avatar inexistente |
| **salary-simulator** | `/salary` | Salário | simulador + settings + calculadora de folha (payroll) | remover vigência atual (delete-current) |
| **tracking** | `/tracking` | Acompanhamento | acompanhamento mensal, toggle pago, pay modal | — |
| **dashboard** | `/` | Dashboard | charts (cash-flow, categorias), summary, recent, filtros | Pluggy não portado; `recent` sem nome de categoria |
| **cards** | `/cards/:id` | Cartões | detalhe do cartão, ciclos/faturas no que a API suporta | transações por cartão/fatura, pagar fatura, delete de ciclo |
| **transactions** | `/transactions` | Transações | tabela, filtros, form, batch, pay-bill parcial | import CSV, endpoint dedicado de pay-bill |

Fluxos substituídos por idioms do destino: `ActionMenuPopover`→botões inline; banner inline→toast; `messages` i18n→strings pt-BR inline.

## Decisões transversais

- **Sem Supabase**: toda chamada `supabase.*` vira `apiClient.{get,post,put,delete}` para rotas .NET kebab-case.
- **Sem i18n**: `@/shared/i18n/messages` → strings pt-BR inline.
- **Pluggy** (sync bancário automático) não é portado — dependia de Edge Functions/Supabase; é decisão de produto se/como reimplementar no backend.
- Rotas adicionadas em `app/AppRouter.tsx` e menu em `layouts/Sidebar.tsx` (costura centralizada para evitar conflito entre ports paralelos).
- Gate: `pnpm check:ci` (eslint + tsc + vite build) verde após a costura.
