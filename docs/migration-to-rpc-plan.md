# Status da Migracao para RPCs Supabase

Este documento substitui o plano antigo. A migracao para RPCs deixou de ser apenas proposta: o frontend atual ja usa RPCs para quase todas as operacoes de dominio.

## Objetivo Arquitetural

Manter no banco as operacoes que precisam de seguranca, atomicidade ou agregacao eficiente, e manter no frontend apenas:

- estado de UI;
- cache e invalidacao via React Query;
- validacao de formulario para UX;
- formatacao;
- calculos puros sem I/O.

## Estado Atual

| Area | Estado | Evidencia |
|---|---|---|
| Contas | migrado para RPC | `accounts.service.ts` usa `get_accounts`, `create_account`, `update_account`, `delete_account` |
| Categorias | migrado para RPC | `categories.service.ts` usa CRUD via RPC |
| Dashboard | majoritariamente migrado | stats, grafico e categorias usam RPC; primeira data ainda consulta tabela |
| Cartoes | parcialmente migrado | CRUD e stats via RPC; parte da orquestracao de ciclos continua no cliente |
| Faturas | parcialmente migrado | leitura e reconciliacao via RPC; pagamento precisa ser auditado |
| Transacoes | migrado em grande parte | paginacao, resumo, CRUD, batch e grupos via RPC |
| Salario | migrado para RPC | settings e historico via RPC |
| Perfil | migrado para RPC | `get_profile`, `upsert_profile` |
| Admin | migrado para RPC | funcoes `admin_*` |
| Pluggy | parcialmente server-side | Edge Function para preview; commit final via RPC/insert batch |

## RPCs Centrais

### Leitura e CRUD simples

- `get_accounts`, `create_account`, `update_account`, `delete_account`
- `get_categories`, `create_category`, `update_category`, `delete_category`
- `get_cards`, `get_card_by_id`, `create_card`, `update_card`, `delete_card`
- `get_invoices_by_card`, `get_invoice_by_month`
- `get_salary_history`, `get_salary_current`, `get_salary_open`

### Dashboard

- `get_dashboard_stats`
- `get_chart_data`
- `get_category_distribution`
- `get_card_stats`
- `get_all_card_stats`

### Transacoes

- `get_transaction_by_id`
- `get_first_transaction_date`
- `get_transactions_by_ids`
- `get_transactions_paginated`
- `get_transactions_summaries`
- `create_transaction`
- `update_transaction`
- `delete_transaction`
- `insert_transactions`
- `batch_pay_transactions`
- `batch_unpay_transactions`
- `batch_delete_transactions`
- `batch_change_day`

### Grupos, parcelas e recorrencias

- `delete_transaction_group`
- `insert_installment_between`
- `update_transaction_group`

### Cartoes e ciclos

- `get_cycles_by_card`
- `get_cycle_by_id`
- `update_cycle`
- `update_cycle_date_start`
- `update_cycle_date_end`
- `delete_cycle`
- `reprocess_invoices_for_card`
- `recalculate_invoice_total`

## Pendencias Tecnicas

### 1. Conferir RPCs chamadas mas ausentes nas migrations

O codigo chama estas RPCs, mas elas nao aparecem nas migrations atuais:

- `increment_account_balance`
- `create_credit_card_statement_cycle`

Antes de qualquer deploy limpo, confirmar se essas funcoes existem no banco remoto e criar migrations para elas, ou remover as chamadas.

### 2. Remover acesso direto residual a tabela

`dashboard.service.ts` ainda faz `supabase.from('transactions')` para buscar a primeira `payment_date` quando o dashboard esta sem filtro. O caminho ideal e usar `get_first_transaction_date`.

### 3. Consolidar ciclos de cartao no banco

`cards.service.ts` ainda decide no cliente como inserir, fechar e deletar vigencias. A regra deveria ficar em RPCs atomicas:

- criar ciclo ajustando vizinhos;
- editar ciclo e reprocessar faturas;
- deletar ciclo e religar intervalos;
- impedir exclusao do unico ciclo.

### 4. Auditar pagamento de fatura

O fluxo de pagamento de fatura deve ser atomicamente garantido no banco para evitar duplicidade em abas concorrentes.

### 5. Atualizar tipos gerados do Supabase

O projeto usa interfaces e schemas manuais. Quando o schema estabilizar, gerar tipos do Supabase ajuda a detectar divergencias entre RPCs, tabelas e frontend.

## Decisao Sobre Migrations

Nao apagar nem unificar migrations neste momento.

Motivo: as migrations atuais representam a evolucao aplicada do banco, incluindo schema inicial, constraints, remocao de colunas redundantes, views, RPCs, hardening de seguranca e fixes posteriores. Consolidar em uma unica baseline so e seguro se o banco puder ser recriado do zero e se o historico aplicado no Supabase remoto for descartado conscientemente.

## Proximo Passo Recomendado

1. Criar migrations faltantes para `increment_account_balance` e `create_credit_card_statement_cycle`, se elas forem realmente usadas.
2. Trocar o acesso direto do dashboard por `get_first_transaction_date`.
3. Mover a orquestracao de ciclos de cartao para RPCs atomicas.
4. Depois disso, rodar `pnpm run build` e testar manualmente contas, cartoes, transacoes, faturas, salario e Pluggy.
