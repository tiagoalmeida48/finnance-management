# SPECS - Finnance Management

## Stack Atual

### Frontend

- React 19
- TypeScript 5.9
- Vite via `rolldown-vite` 7.2
- React Router 7
- TanStack Query 5
- Zustand 5
- React Hook Form 7
- Zod 4
- Tailwind CSS 4
- Framer Motion 12
- Recharts 3
- Lucide React
- PapaParse
- date-fns 4

### Backend

- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- SQL RPCs
- Supabase Edge Functions em Deno

### Ferramentas

- pnpm 10.28.1
- ESLint 9
- Prettier 3
- Vercel para deploy da SPA

## Variaveis de Ambiente

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Edge Functions:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
```

## Scripts

```bash
pnpm dev
pnpm run build
pnpm run lint
pnpm run preview
pnpm run format
pnpm run check:ci
```

Nao ha scripts de teste no estado atual.

## Estrutura

```text
src/
  routes/AppRouter.tsx
  pages/
    accounts/
    auth/
    cards/
    categories/
    dashboard/
    profile/
    salary-simulator/
    tracking/
    transactions/
    users/
  shared/
    components/
      composite/
      forms/
      layout/
      ui/
    constants/
    contexts/
    hooks/api/
    interfaces/
    schemas/
    services/
      transactions/
    stores/
    theme/
    utils/
  lib/supabase/
  App.css
  index.css
```

## Rotas

| Rota | Guard |
|---|---|
| `/` | redirecionamento |
| `/auth/login` | publico |
| `/auth/register` | redireciona para login |
| `/dashboard` | autenticado |
| `/accounts` | autenticado |
| `/transactions` | autenticado |
| `/categories` | autenticado |
| `/cards` | autenticado |
| `/cards/:id` | autenticado |
| `/tracking` | autenticado |
| `/salary-simulator` | autenticado |
| `/profile` | autenticado |
| `/users` | admin |

## Banco de Dados

### Tabelas

| Tabela | Uso |
|---|---|
| `profiles` | perfil do usuario, avatar, nome e admin |
| `site_branding` | branding singleton |
| `settings_salary` | configuracao salarial por periodo |
| `bank_accounts` | contas e saldos |
| `categories` | categorias de receita/despesa |
| `credit_cards` | cartoes e limites |
| `credit_card_invoices` | faturas por mes |
| `credit_card_statement_cycles` | vigencias de fechamento/vencimento |
| `credit_card_statement_period_ranges` | ranges historicos de fatura |
| `transactions` | movimentacoes financeiras |
| `system_config` | configuracoes globais |
| `audit_log` | auditoria |

### Convencoes

- IDs primarios em UUID, exceto singletons/configuracoes especificas.
- `user_id` vinculado a `auth.users`.
- RLS habilitado nas tabelas de dominio.
- Soft delete via `deleted_at`.
- Datas e dinheiro ficam no banco; formatacao fica no frontend.
- Regras com side effect devem preferir RPC.

## Services

| Arquivo | Responsabilidade |
|---|---|
| `accounts.service.ts` | contas |
| `categories.service.ts` | categorias |
| `cards.service.ts` | cartoes, ciclos e detalhes |
| `dashboard.service.ts` | indicadores e graficos |
| `invoice-reconciliation.service.ts` | recalculo e reprocessamento de faturas |
| `invoices.service.ts` | leitura e acoes de faturas |
| `salary-settings.service.ts` | configuracoes salariais |
| `salary-simulator.service.ts` | calculos de simulacao |
| `transactions.service.ts` | fachada de transacoes |
| `transactions/*` | criacao, batch, core, grupos e helpers |
| `transactions-import.service.ts` | importacao CSV |
| `users.service.ts` | administracao de usuarios |

## Data Fetching

Hooks de API ficam em `src/shared/hooks/api/` e devem:

- usar React Query;
- chamar services, nao Supabase direto;
- usar chaves de `src/shared/constants/queryKeys.ts`;
- invalidar queries relacionadas apos mutations.

## Validacao

- Schemas Zod ficam em `src/shared/schemas/`.
- Interfaces ficam em `src/shared/interfaces/`.
- Retornos do Supabase devem ser parseados quando cruzam a fronteira de service.

## Design System

Fonte de estilos:

- `src/index.css` importa Tailwind e `App.css`.
- `src/App.css` define tokens globais.
- `src/shared/components/ui` contem primitivas reutilizaveis.
- `src/shared/components/composite` contem componentes maiores.

Tokens principais:

- `--color-background`
- `--color-surface`
- `--color-card`
- `--color-primary`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-border`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`

## Edge Functions

| Funcao | Responsabilidade |
|---|---|
| `pluggy-token` | criar connect token da Pluggy para usuario autenticado |
| `pluggy-sync` | buscar transacoes Pluggy, normalizar e retornar previa |

## Qualidade

Estado atual:

- lint disponivel;
- build disponivel;
- testes automatizados removidos.

Comando recomendado antes de merge:

```bash
pnpm run check:ci
```

## Inconsistencias Conhecidas

- `accounts.service.ts` chama `increment_account_balance`, mas a migration correspondente nao foi encontrada.
- `cards.service.ts` chama `create_credit_card_statement_cycle`, mas a migration correspondente nao foi encontrada.
- `dashboard.service.ts` ainda usa uma consulta direta a `transactions` para descobrir a primeira data sem filtro.
- O design system vivo do app esta em `src/App.css` e nos componentes React, nao em um HTML estatico de `docs/`.
