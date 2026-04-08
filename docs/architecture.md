# Arquitetura do Banco de Dados — Finnance Management

Documentação gerada a partir das migrations SQL em `supabase/migrations/`.

---

## Diagrama de Entidades

```
auth.users
  ├── profiles (1:1)
  ├── settings_salary (1:N — por período)
  ├── bank_accounts (1:N)
  │     └── credit_cards (N:1 via bank_account_id)
  │           ├── credit_card_invoices (1:N via card_id)
  │           ├── credit_card_statement_cycles (1:N via card_id)
  │           └── credit_card_statement_period_ranges (1:N via card_id)
  ├── categories (1:N)
  └── transactions (1:N)
        ├── → bank_accounts (account_id, to_account_id)
        ├── → credit_cards (card_id)
        ├── → credit_card_invoices (invoice_id)
        └── → categories (category_id)
```

---

## Tabelas

### `profiles`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | — | FK → auth.users(id) |
| full_name | text | — | |
| avatar_url | text | — | |
| currency | text | 'BRL' | |
| locale | text | 'pt-BR' | |
| is_admin | boolean | false | Controla acesso a site_branding |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

### `site_branding`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | integer PK | — | Singleton (trigger impede > 1 linha) |
| site_title | text | 'FINNANCE' | |
| logo_image | text | — | |
| created_at / updated_at | timestamptz | now() | |

### `settings_salary`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| user_id | uuid | — | PK composta (user_id, date_start, date_end) |
| date_start | date | — | |
| date_end | date | '9999-12-31' | Período aberto |
| hourly_rate | numeric | — | CHECK >= 0 |
| base_salary | numeric | — | CHECK >= 0 |
| inss_discount_percentage | numeric | — | CHECK 0–100 |
| admin_fee_percentage | numeric | — | CHECK 0–100 |

### `bank_accounts`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| name | varchar | — | |
| type | varchar | 'checking' | checking, savings, investment, wallet, other |
| initial_balance | numeric | 0 | |
| current_balance | numeric | 0 | Atualizado por trigger |
| color | varchar | '#8b5cf6' | |
| icon | varchar | 'wallet' | |
| notes | text | — | |
| is_active | boolean | true | |
| deleted_at | timestamp | — | Soft delete |
| created_at / updated_at | timestamptz | now() | |

### `categories`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| name | text | — | |
| type | text | — | CHECK: 'income' \| 'expense' |
| icon | text | — | |
| color | text | — | |
| is_active | boolean | true | |
| deleted_at | timestamptz | — | Soft delete |
| created_at / updated_at | timestamptz | now() | |

### `credit_cards`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| bank_account_id | uuid | — | FK → bank_accounts |
| name | text | — | |
| color | text | — | |
| credit_limit | numeric | 0 | |
| closing_day | integer | — | CHECK 1–31; sincronizado por trigger |
| due_day | integer | — | CHECK 1–31; sincronizado por trigger |
| notes | text | — | |
| is_active | boolean | true | |
| deleted_at | timestamptz | — | Soft delete |
| created_at / updated_at | timestamptz | now() | |

### `credit_card_invoices`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| card_id | uuid | — | FK → credit_cards; UNIQUE(card_id, month_key) |
| month_key | text | — | Formato 'YYYY-MM' |
| closing_date | date | — | |
| due_date | date | — | |
| total_amount | numeric | 0 | |
| paid_amount | numeric | 0 | |
| status | text | 'open' | CHECK: open, closed, partial, paid, overdue |
| closed_at / paid_at | timestamptz | — | |
| created_at / updated_at | timestamptz | now() | |

### `credit_card_statement_cycles`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| card_id | uuid | — | FK → credit_cards |
| date_start | date | — | |
| date_end | date | '9999-12-31' | Ciclo aberto |
| closing_day | smallint | — | |
| due_day | smallint | — | |
| notes | text | — | |
| created_at | timestamptz | now() | |

### `transactions`
| Coluna | Tipo | Default | Notas |
|--------|------|---------|-------|
| id | uuid PK | gen_random_uuid() | |
| user_id | uuid | — | FK → auth.users |
| type | text | — | CHECK: income, expense, transfer |
| amount | numeric | — | CHECK > 0 |
| description | text | — | |
| payment_date | date | — | |
| purchase_date | date | — | |
| account_id | uuid | — | FK → bank_accounts |
| to_account_id | uuid | — | FK → bank_accounts; CHECK: só em transfers |
| card_id | uuid | — | FK → credit_cards; CHECK: requer account_id |
| invoice_id | uuid | — | FK → credit_card_invoices |
| category_id | uuid | — | FK → categories |
| is_fixed | boolean | false | |
| is_paid | boolean | false | NOT NULL |
| installment_group_id | uuid | — | Agrupa parcelas |
| installment_number | integer | — | |
| total_installments | integer | — | |
| recurring_group_id | uuid | gen_random_uuid() | Agrupa recorrências |
| notes | text | — | |
| payment_method | text | — | CHECK: credit, debit, pix, cash, bill_payment, transfer, other |
| created_at / updated_at | timestamptz | now() | |

---

## Índices

| Tabela | Índice | Colunas | Tipo |
|--------|--------|---------|------|
| transactions | idx_transactions_installment_group_id | installment_group_id | Parcial (WHERE NOT NULL) |
| transactions | idx_transactions_recurring_group_id | recurring_group_id | Parcial (WHERE NOT NULL) |
| transactions | idx_transactions_invoice_id | invoice_id | Parcial (WHERE NOT NULL) |
| transactions | idx_transactions_user_payment_date | (user_id, payment_date DESC) | Composto |

---

## RLS (Row Level Security)

Todas as tabelas possuem RLS habilitado.

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | id = auth.uid() | id = auth.uid() | id = auth.uid() | — |
| site_branding | PUBLIC (todos) | Apenas admin | Apenas admin | — |
| settings_salary | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| bank_accounts | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| categories | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| credit_cards | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| credit_card_invoices | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| credit_card_statement_cycles | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |
| transactions | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() | user_id = auth.uid() |

---

## Triggers

| Trigger | Tabela | Evento | Função | Descrição |
|---------|--------|--------|--------|-----------|
| trg_sync_account_balance | transactions | AFTER INSERT/UPDATE/DELETE | sync_account_balance_on_transaction() | Sincroniza `current_balance` das contas automaticamente |
| trg_salary_no_overlap | settings_salary | BEFORE INSERT/UPDATE | check_salary_period_no_overlap() | Impede sobreposição de períodos salariais |
| trg_sync_card_closing_due_day | credit_card_statement_cycles | AFTER INSERT/UPDATE | sync_card_closing_due_day() | Sincroniza closing/due_day do cartão com o ciclo aberto |
| trg_site_branding_singleton | site_branding | BEFORE INSERT | enforce_site_branding_singleton() | Impede mais de uma linha na tabela |

---

## Funções RPC

| Função | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| get_dashboard_stats_aggregated | p_start_date?, p_end_date? | total_income, total_expense | Totais de receitas/despesas para o período |
| get_dashboard_chart_data | p_start_date, p_end_date | month_key, total_income, total_expense | Agregação mensal para gráficos |
| get_category_distribution | p_start_date?, p_end_date? | category_name, total_amount | Distribuição de despesas por categoria |

Todas as RPCs usam `SECURITY DEFINER` e filtram por `auth.uid()`.

---

## Constraints de Integridade

| Constraint | Tabela | Regra |
|-----------|--------|-------|
| transactions_type_check | transactions | type IN ('income', 'expense', 'transfer') |
| transactions_payment_method_check | transactions | NULL ou IN ('credit', 'debit', 'pix', 'cash', 'bill_payment', 'transfer', 'other') |
| chk_transfer_account | transactions | type = 'transfer' OR to_account_id IS NULL |
| chk_card_has_account | transactions | card_id IS NULL OR account_id IS NOT NULL |
| uq_invoices_card_month | credit_card_invoices | UNIQUE(card_id, month_key) |
| credit_card_invoices_status_check | credit_card_invoices | status IN ('open', 'closed', 'partial', 'paid', 'overdue') |
