# Arquitetura Atual - Finnance Management

Documento revisado a partir do codigo em `src/` e das migrations em `supabase/migrations/`.

## Visao Geral

O Finnance Management e uma SPA React para gestao financeira pessoal. O frontend roda em Vite/React e usa Supabase como backend principal:

- Supabase Auth para sessao do usuario.
- PostgreSQL com RLS para isolamento por `auth.uid()`.
- RPCs SQL para a maior parte das operacoes de leitura/escrita.
- Edge Functions para integracao Pluggy.
- React Query para cache, sincronizacao e invalidacao de dados.

## Camadas do Frontend

```text
src/
  routes/                 # AppRouter, guards e lazy loading
  pages/                  # paginas por dominio
  shared/
    components/           # UI reutilizavel, layout e composites
    constants/            # queryKeys e constantes de dominio
    hooks/api/            # hooks React Query
    interfaces/           # contratos TypeScript
    schemas/              # validacao Zod dos retornos
    services/             # fronteira de dados com Supabase
    stores/               # estado local Zustand
    theme/                # tokens TS derivados do CSS
    utils/                # calculos puros e helpers
  lib/supabase/           # client e AuthProvider
```

## Fluxo de Dados

1. A rota protegida valida sessao no `AuthProvider`.
2. A pagina chama hooks de `src/shared/hooks/api/`.
3. Os hooks usam services de `src/shared/services/`.
4. Os services chamam `supabase.rpc(...)`, `supabase.functions.invoke(...)` ou, em poucos casos, acesso direto a tabela.
5. Os retornos sao normalizados por Zod e expostos para a UI.
6. Mutations invalidam chaves centralizadas em `src/shared/constants/queryKeys.ts`.

## Rotas

| Rota | Pagina | Protecao |
|---|---|---|
| `/` | redireciona para dashboard ou login | publica |
| `/auth/login` | login | publica |
| `/auth/register` | redireciona para login | publica |
| `/dashboard` | dashboard financeiro | autenticada |
| `/accounts` | contas bancarias | autenticada |
| `/transactions` | transacoes e importacao CSV/Pluggy | autenticada |
| `/categories` | categorias | autenticada |
| `/cards` | cartoes de credito | autenticada |
| `/cards/:id` | detalhe de cartao, faturas e ciclos | autenticada |
| `/tracking` | acompanhamento mensal | autenticada |
| `/salary-simulator` | simulador/configuracao salarial | autenticada |
| `/profile` | perfil | autenticada |
| `/users` | gestao de usuarios | admin |

## Backend Supabase

### Tabelas principais

| Tabela | Responsabilidade |
|---|---|
| `profiles` | perfil e flag `is_admin` |
| `bank_accounts` | contas, saldo inicial/atual e vinculo Pluggy |
| `categories` | categorias de receita/despesa |
| `credit_cards` | cartoes sem `closing_day`/`due_day` diretos no modelo final |
| `credit_card_statement_cycles` | vigencias de fechamento/vencimento do cartao |
| `credit_card_invoices` | faturas por `card_id` + `month_key` |
| `transactions` | receitas, despesas, transferencias, parcelas e recorrencias |
| `settings_salary` | configuracoes salariais por periodo |
| `system_config` | parametros globais protegidos |
| `audit_log` | trilha de auditoria para tabelas sensiveis |

### Observacoes de schema

- `credit_cards.closing_day` e `credit_cards.due_day` foram removidos por migration. A fonte correta dos dias de fechamento/vencimento e `credit_card_statement_cycles`.
- As tabelas usam `user_id` para isolamento por usuario.
- Soft delete aparece em contas, categorias, cartoes e transacoes.
- `transactions` suporta `installment_group_id`, `recurring_group_id`, `invoice_id`, `purchase_date`, `payment_date` e `is_paid`.

## RPCs em Uso

As areas abaixo ja operam majoritariamente via RPC:

- contas: `get_accounts`, `create_account`, `update_account`, `delete_account`
- categorias: `get_categories`, `create_category`, `update_category`, `delete_category`
- dashboard: `get_dashboard_stats`, `get_chart_data`, `get_category_distribution`
- cartoes/faturas/ciclos: `get_cards`, `get_card_by_id`, `get_card_stats`, `get_all_card_stats`, `get_invoices_by_card`, `get_cycles_by_card`, `update_cycle`, `delete_cycle`
- transacoes: `get_transactions_paginated`, `get_transactions_summaries`, `create_transaction`, `update_transaction`, `delete_transaction`, `insert_transactions`, `batch_pay_transactions`, `batch_unpay_transactions`, `batch_delete_transactions`, `batch_change_day`
- grupos: `delete_transaction_group`, `insert_installment_between`, `update_transaction_group`
- salario: `get_salary_history`, `get_salary_current`, `get_salary_open`, `create_salary_setting`, `update_salary_setting`, `close_salary_setting`, `reopen_salary_setting`, `delete_salary_setting`
- perfil/admin: `get_profile`, `upsert_profile`, `admin_list_users`, `admin_create_user`, `admin_update_user`, `admin_update_user_password`, `admin_delete_user`
- Pluggy: `commit_pluggy_transactions`

## Integracao Pluggy

`supabase/functions/pluggy-token` cria connect tokens autenticados para o usuario logado.

`supabase/functions/pluggy-sync` consulta transacoes na Pluggy, normaliza valores, detecta possiveis duplicidades e devolve uma previa para revisao no frontend. A confirmacao passa pelo hook `usePluggySync` e grava via `insert_transactions`.

## Design System

O sistema visual atual usa Tailwind CSS v4, CSS variables em `src/App.css` e componentes React em `src/shared/components`.

Tokens principais:

- cores: `--color-background`, `--color-surface`, `--color-card`, `--color-primary`
- texto: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- estados: `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- fontes: `--font-sans`, `--font-heading`

## Pontos de Atencao

- `dashboard.service.ts` ainda usa um acesso direto a `transactions` para descobrir a primeira data quando nao ha filtro.
- `accounts.service.ts` chama `increment_account_balance`, mas essa RPC nao aparece nas migrations atuais.
- `cards.service.ts` chama `create_credit_card_statement_cycle`, mas essa RPC tambem nao aparece nas migrations listadas.
- A pasta de testes e o `vitest.config.ts` foram removidos; a qualidade atual depende de lint/build ate uma nova suite ser criada.
