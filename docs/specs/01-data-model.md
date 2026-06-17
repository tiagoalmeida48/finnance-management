# 01 — Modelo de Dados

> ✅ **Verificado contra o banco cloud real (2026-06-17).** Tipos, constraints e índices conferidos no catálogo do PostgreSQL (25 migrations aplicadas). Para migração .NET/EF Core, mapear `NUMERIC(15,2) → decimal`, `UUID → Guid`, `TIMESTAMPTZ → DateTimeOffset`, `DATE → DateOnly`, `TEXT/VARCHAR → string`, `JSONB → string/JsonDocument`.
>
> **12 tabelas em `public`:** profiles, settings_salary, bank_accounts, categories, credit_cards, credit_card_invoices, credit_card_statement_cycles, transactions, system_config, audit_log, **pluggy_items**. ⚠️ **`site_branding` foi REMOVIDA** (não existe mais). Há ainda 1 bucket de storage `avatars` (público).

---

## 1. Tabelas

### 1.1 `profiles` — perfil do usuário (1:1 com auth.users)

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | — (PK, FK → auth.users.id) |
| `full_name` | TEXT | NULL | — |
| `avatar_url` | TEXT | NULL | — |
| `currency` | TEXT | NULL | `'BRL'` |
| `locale` | TEXT | NULL | `'pt-BR'` |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |
| `is_admin` | BOOLEAN | NULL | `false` |

### 1.2 ~~`site_branding`~~ — ❌ REMOVIDA

Tabela **dropada** na migration `drop_site_branding` (junto com o trigger/função singleton). Não existe no banco. Não migrar.

### 1.3 `settings_salary` — vigências salariais

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `user_id` | UUID | NOT NULL | — (PK parte 1, FK → auth.users.id) |
| `date_start` | DATE | NOT NULL | — (PK parte 2) |
| `date_end` | DATE | NOT NULL | `'9999-12-31'` (PK parte 3) |
| `hourly_rate` | NUMERIC(15,2) | NULL | — |
| `base_salary` | NUMERIC(15,2) | NULL | — |
| `inss_discount_percentage` | NUMERIC(15,2) | NULL | — |
| `admin_fee_percentage` | NUMERIC(15,2) | NULL | — |

**PK composta:** `(user_id, date_start, date_end)`.

### 1.4 `bank_accounts` — contas bancárias (soft-delete)

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NULL | — (FK → auth.users.id) |
| `name` | VARCHAR | NULL | — |
| `type` | VARCHAR | NULL | `'checking'` |
| `initial_balance` | NUMERIC(15,2) | NULL | `0` |
| `current_balance` | NUMERIC(15,2) | NULL | `0` |
| `color` | VARCHAR | NULL | `'#8b5cf6'` |
| `icon` | VARCHAR | NULL | `'wallet'` |
| `notes` | TEXT | NULL | — |
| `is_active` | BOOLEAN | NULL | `true` |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |
| `deleted_at` | TIMESTAMPTZ | NULL | — |

> Nota: existe também `pluggy_account_id` no contrato do frontend (integração Pluggy). Confirmar presença no banco cloud (ver overview §6).

### 1.5 `categories` — categorias (soft-delete)

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NULL | — (FK → auth.users.id) |
| `type` | TEXT | NULL | — (CHECK income/expense) |
| `name` | TEXT | NOT NULL | — |
| `color` | TEXT | NULL | — |
| `icon` | TEXT | NULL | — |
| `is_active` | BOOLEAN | NULL | `true` |
| `deleted_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |

### 1.6 `credit_cards` — cartões de crédito (soft-delete)

> ✅ Conferido: as colunas-chave são **NOT NULL** no banco real (a versão inferida das migrations as marcava nullable).

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | **NOT NULL** | — (FK → auth.users.id) |
| `bank_account_id` | UUID | **NOT NULL** | — (FK → bank_accounts.id) |
| `name` | TEXT | **NOT NULL** | — |
| `color` | TEXT | **NOT NULL** | — |
| `credit_limit` | NUMERIC(15,2) | **NOT NULL** | `0` |
| `is_active` | BOOLEAN | **NOT NULL** | `true` |
| `deleted_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` |
| `notes` | TEXT | NULL | — |

> **Colunas removidas:** `closing_day` e `due_day` foram DROPadas (migration `20260405000006`). Lidas hoje via `v_credit_cards_with_cycles`.

### 1.7 `credit_card_invoices` — faturas mensais

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NULL | — (FK → auth.users.id) |
| `card_id` | UUID | NULL | — (FK → credit_cards.id) |
| `month_key` | TEXT | NULL | — (`'yyyy-MM'`) |
| `closing_date` | DATE | NULL | — |
| `due_date` | DATE | NULL | — |
| `total_amount` | NUMERIC(15,2) | NULL | `0` |
| `paid_amount` | NUMERIC(15,2) | NULL | `0` |
| `status` | TEXT | NULL | `'open'` |
| `closed_at` | TIMESTAMPTZ | NULL | — |
| `paid_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |

**UNIQUE:** `(card_id, month_key)` → `uq_invoices_card_month`.

### 1.8 `credit_card_statement_cycles` — ciclos de vigência de fechamento/vencimento

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NULL | — (FK → auth.users.id) |
| `card_id` | UUID | NULL | — (FK → credit_cards.id) |
| `date_start` | DATE | NULL | — |
| `date_end` | DATE | NULL | `'9999-12-31'` |
| `closing_day` | SMALLINT | NULL | — |
| `due_day` | SMALLINT | NULL | — |
| `notes` | TEXT | NULL | — |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |

**Regra:** apenas 1 ciclo aberto (`date_end = '9999-12-31'`) por cartão — garantido por índice único parcial `uq_card_open_cycle`.

### 1.9 `transactions` — transações (entidade central)

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NULL | — (FK → auth.users.id) |
| `type` | TEXT | NULL | — (CHECK income/expense/transfer) |
| `amount` | NUMERIC(15,2) | NULL | — (CHECK > 0) |
| `payment_date` | DATE | NULL | — |
| `description` | TEXT | NULL | — |
| `account_id` | UUID | NULL | — (FK → bank_accounts.id) |
| `to_account_id` | UUID | NULL | — (FK → bank_accounts.id; só transfer) |
| `card_id` | UUID | NULL | — (FK → credit_cards.id) |
| `category_id` | UUID | NULL | — (FK → categories.id) |
| `created_at` | TIMESTAMPTZ | NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |
| `is_fixed` | BOOLEAN | NULL | `false` |
| `notes` | TEXT | NULL | — |
| `payment_method` | TEXT | NULL | — (CHECK lista) |
| `purchase_date` | DATE | NULL | — |
| `installment_group_id` | UUID | NULL | — (sem FK) |
| `installment_number` | INTEGER | NULL | — |
| `total_installments` | INTEGER | NULL | — |
| `recurring_group_id` | UUID | NULL | — (sem FK) |
| `is_paid` | BOOLEAN | **NOT NULL** | `false` |
| `invoice_id` | UUID | NULL | — (FK → credit_card_invoices.id) |

### 1.10 `system_config` — configuração global key/value

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `key` | TEXT | NOT NULL | — (PK) |
| `value` | NUMERIC | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NULL | `now()` |

**Seed:** `('teto_inss', 1167.89)`.

### 1.11 `audit_log` — log de auditoria

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `table_name` | TEXT | NOT NULL | — |
| `record_id` | UUID | NOT NULL | — |
| `action` | TEXT | NOT NULL | — (CHECK INSERT/UPDATE/DELETE) |
| `old_data` | JSONB | NULL | — |
| `new_data` | JSONB | NULL | — |
| `changed_at` | TIMESTAMPTZ | NOT NULL | `now()` |
| `changed_by` | UUID | NULL | `auth.uid()` |
| `description` | TEXT | NULL | — |

### 1.12 `pluggy_items` — itens/conexões Open Finance (Pluggy)

| Coluna | Tipo | NULL | Default |
|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` (PK) |
| `user_id` | UUID | NOT NULL | — (FK → auth.users.id, **ON DELETE CASCADE**) |
| `item_id` | TEXT | NOT NULL | — (ID do item na Pluggy) |
| `connector` | TEXT | NULL | — |
| `status` | TEXT | NULL | — |
| `last_synced_at` | TIMESTAMPTZ | NULL | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` |

**UNIQUE:** `(user_id, item_id)`. RLS: `user_owns_pluggy_item` (`auth.uid() = user_id`). Trigger `set_updated_at`.

### 1.13 Tabelas removidas
- `site_branding` — **DROPada** (migration `drop_site_branding`).
- `credit_card_statement_period_ranges` — criada na migration inicial e **DROPada** em `infrastructure`. Não existe.

### 1.14 Storage
- Bucket `avatars` (**público**) — armazena avatares de perfil (`profiles.avatar_url`). ⚠️ Advisor de segurança: política pública permite listar todos os arquivos — no .NET, servir com URL escopada/assinada.

---

## 2. Constraints (consolidado)

### Primary Keys
`profiles(id)` · `settings_salary(user_id, date_start, date_end)` · `bank_accounts(id)` · `categories(id)` · `credit_cards(id)` · `credit_card_invoices(id)` · `credit_card_statement_cycles(id)` · `transactions(id)` · `system_config(key)` · `audit_log(id)` · `pluggy_items(id)`

### Foreign Keys

| Tabela.coluna | → Referência | Observação |
|---|---|---|
| `profiles.id` | `auth.users(id)` | |
| `settings_salary.user_id` | `auth.users(id)` | |
| `bank_accounts.user_id` | `auth.users(id)` | |
| `categories.user_id` | `auth.users(id)` | |
| `credit_cards.user_id` | `auth.users(id)` | |
| `credit_cards.bank_account_id` | `bank_accounts(id)` | sem CASCADE |
| `credit_card_invoices.user_id` | `auth.users(id)` | sem CASCADE |
| `credit_card_invoices.card_id` | `credit_cards(id)` | sem CASCADE |
| `credit_card_statement_cycles.user_id` | `auth.users(id)` | **ON DELETE CASCADE** ✅ |
| `credit_card_statement_cycles.card_id` | `credit_cards(id)` | **ON DELETE CASCADE** ✅ |
| `transactions.*` (user/account/to_account/card/category/invoice) | respectivas | sem CASCADE |
| `pluggy_items.user_id` | `auth.users(id)` | **ON DELETE CASCADE** ✅ |

> ✅ **Verificado:** apenas `credit_card_statement_cycles` (2 FKs) e `pluggy_items` têm `ON DELETE CASCADE`. As demais são NO ACTION. A remoção de usuário cascateia via `auth.users` (gerenciado pelo Supabase). **Migração .NET:** definir ON DELETE explicitamente — `Cascade` onde marcado acima, `Restrict` no resto (com soft-delete na frente).

### UNIQUE
- `uq_invoices_card_month` (+ `credit_card_invoices_card_id_month_key_key`, duplicado) → `credit_card_invoices(card_id, month_key)`
- `uq_card_open_cycle` → `credit_card_statement_cycles(card_id) WHERE date_end = '9999-12-31'` (parcial — **1 ciclo aberto/cartão**)
- `credit_card_statement_cycles_card_start_uniq` → `credit_card_statement_cycles(card_id, date_start)` ➕
- `uq_category_user_type_name` → `categories(user_id, type, name) WHERE deleted_at IS NULL` (parcial)
- `settings_one_open_row_per_user` → `settings_salary(user_id) WHERE date_end = '9999-12-31'` (parcial — **1 vigência salarial aberta/usuário**) ➕
- `pluggy_items_user_id_item_id_key` → `pluggy_items(user_id, item_id)` ➕

### CHECK constraints (transcrição exata)

```sql
-- transactions
CHECK (type IN ('income','expense','transfer'))                                  -- transactions_type_check
CHECK (payment_method IS NULL OR payment_method IN
       ('credit','debit','pix','cash','bill_payment','transfer','other'))        -- transactions_payment_method_check
CHECK (amount > 0)
CHECK (installment_number IS NULL OR installment_number >= 1)                     -- chk_installment_number_positive
CHECK (total_installments IS NULL OR total_installments >= 1)                     -- chk_installment_total_positive
CHECK (installment_number IS NULL OR total_installments IS NULL
       OR installment_number <= total_installments)                              -- chk_installment_number_valid
CHECK ((installment_number IS NULL AND total_installments IS NULL)
       OR (installment_number IS NOT NULL AND total_installments IS NOT NULL))    -- chk_installment_complete
CHECK (type = 'transfer' OR to_account_id IS NULL)                               -- chk_transfer_account
CHECK (card_id IS NULL OR account_id IS NOT NULL)                                -- chk_card_has_account
CHECK (installment_group_id IS NULL OR recurring_group_id IS NULL)               -- chk_group_mutual_exclusive ➕ (não coexistem)
CHECK (recurring_group_id IS NULL OR is_fixed = true)                            -- chk_recurring_requires_is_fixed ➕

-- credit_card_invoices
CHECK (status IN ('open','closed','partial','paid','overdue'))                   -- credit_card_invoices_status_check
CHECK (total_amount >= 0)                                                        -- chk_invoice_total_positive
CHECK (paid_amount >= 0)                                                         -- chk_invoice_paid_amount_bounds

-- bank_accounts
CHECK (type IN ('checking','savings','investment','wallet','other'))            -- chk_bank_account_type
CHECK (deleted_at IS NULL OR is_active = FALSE)                                  -- chk_bank_account_deletion

-- categories
CHECK (type = ANY (ARRAY['income','expense']))
CHECK (deleted_at IS NULL OR is_active = FALSE)                                  -- chk_category_deletion

-- credit_cards
CHECK (deleted_at IS NULL OR is_active = FALSE)                                  -- chk_card_deletion

-- settings_salary
CHECK (hourly_rate >= 0)
CHECK (base_salary >= 0)
CHECK (inss_discount_percentage >= 0 AND inss_discount_percentage <= 100)        -- chk_salary_inss_percentage
CHECK (admin_fee_percentage >= 0 AND admin_fee_percentage <= 100)               -- chk_salary_admin_percentage
CHECK (date_start IS NOT NULL AND date_end IS NOT NULL AND date_start <= date_end) -- chk_salary_dates

-- credit_card_statement_cycles
CHECK (date_start IS NULL OR date_end IS NULL OR date_start <= date_end)         -- chk_cycle_dates
CHECK (date_start <= date_end)                                                   -- credit_card_statement_cycles_valid_dates ➕
CHECK (closing_day BETWEEN 1 AND 31 AND due_day BETWEEN 1 AND 31)               -- credit_card_statement_cycles_valid_days ➕

-- audit_log
CHECK (action IN ('INSERT','UPDATE','DELETE'))
```

> **Migração .NET:** Replicar todos esses CHECKs como (a) constraints do banco (`HasCheckConstraint` no EF Core) **e** (b) validações na camada de aplicação/DTO para mensagens de erro amigáveis. As validações Zod do frontend (ver docs de domínio) já cobrem grande parte na borda.

---

## 3. Índices

| Nome | Tabela | Colunas | Tipo |
|---|---|---|---|
| `idx_transactions_installment_group_id` | transactions | `(installment_group_id)` | parcial `WHERE installment_group_id IS NOT NULL` |
| `idx_transactions_recurring_group_id` | transactions | `(recurring_group_id)` | parcial `WHERE recurring_group_id IS NOT NULL` |
| `idx_transactions_invoice_id` | transactions | `(invoice_id)` | parcial `WHERE invoice_id IS NOT NULL` |
| `idx_transactions_user_payment_date` | transactions | `(user_id, payment_date DESC)` | normal |
| `idx_transactions_card_id` | transactions | `(card_id)` | parcial `WHERE card_id IS NOT NULL` |
| `idx_transactions_account_id` | transactions | `(account_id)` | parcial |
| `idx_transactions_to_account_id` | transactions | `(to_account_id)` | parcial |
| `idx_transactions_category_id` | transactions | `(category_id)` | parcial |
| `idx_bank_accounts_active` | bank_accounts | `(user_id)` | parcial `WHERE deleted_at IS NULL` |
| `idx_categories_active` | categories | `(user_id)` | parcial `WHERE deleted_at IS NULL` |
| `idx_credit_cards_active` | credit_cards | `(user_id)` | parcial `WHERE deleted_at IS NULL` |
| `idx_invoices_card_status` | credit_card_invoices | `(card_id, status)` | normal |
| `idx_categories_type` | categories | `(type)` | normal |
| `uq_card_open_cycle` | credit_card_statement_cycles | `(card_id)` | **UNIQUE** parcial `WHERE date_end = '9999-12-31'` |
| `uq_category_user_type_name` | categories | `(user_id, type, name)` | **UNIQUE** parcial `WHERE deleted_at IS NULL` |

---

## 4. Views

Todas com `security_invoker = true` (herdam RLS das tabelas base).

### 4.1 `v_credit_cards_with_cycles`
Cartão + dias do ciclo vigente. Substitui as colunas removidas `closing_day`/`due_day`.
```sql
SELECT cc.id, cc.user_id, cc.bank_account_id, cc.name, cc.color,
       cc.credit_limit, cc.is_active, cc.deleted_at, cc.created_at, cc.updated_at, cc.notes,
       cyc.closing_day AS cycle_closing_day,
       cyc.due_day     AS cycle_due_day
FROM credit_cards cc
LEFT JOIN credit_card_statement_cycles cyc
  ON cyc.card_id = cc.id AND cyc.date_end = '9999-12-31';
```

### 4.2 `v_card_limits`
Uso e limite disponível por cartão.
```sql
SELECT cc.id AS card_id, cc.credit_limit,
  COALESCE(SUM(CASE WHEN inv.status <> 'paid'
                    THEN (inv.total_amount - inv.paid_amount) ELSE 0 END), 0) AS total_usage,
  (cc.credit_limit - COALESCE(SUM(CASE WHEN inv.status <> 'paid'
                    THEN (inv.total_amount - inv.paid_amount) ELSE 0 END), 0)) AS available_limit
FROM credit_cards cc
LEFT JOIN credit_card_invoices inv ON inv.card_id = cc.id
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.credit_limit;
```

### 4.3 `v_installment_groups`
Agregação por grupo de parcelamento.
```sql
SELECT installment_group_id AS group_id, user_id,
  MAX(total_installments) AS declared_count,
  COUNT(*) AS actual_count,
  SUM(amount) AS total_amount,
  SUM(CASE WHEN is_paid THEN amount ELSE 0 END) AS paid_amount,
  COUNT(CASE WHEN is_paid THEN 1 END) AS paid_count,
  MIN(payment_date) AS first_payment_date,
  MAX(payment_date) AS last_payment_date
FROM transactions
WHERE installment_group_id IS NOT NULL
GROUP BY installment_group_id, user_id;
```

### 4.4 `v_recurring_groups`
Agregação por grupo de recorrência (estrutura análoga a 4.3, usando `recurring_group_id` e `total_count` no lugar de declared/actual).

> **Migração .NET:** Views são read-models. Recriar como queries LINQ/projeções no EF Core, ou manter como views no Postgres local.

---

## 5. Soft-delete (resumo)

| Tabela | Colunas | CHECK de consistência |
|---|---|---|
| `bank_accounts` | `deleted_at`, `is_active` | `deleted_at IS NULL OR is_active = FALSE` |
| `categories` | `deleted_at`, `is_active` | idem |
| `credit_cards` | `deleted_at`, `is_active` | idem |

Demais tabelas usam **hard delete**.

---

## 6. Grafo de Relacionamentos

```
auth.users (identidade — substituível por ASP.NET Identity)
├── profiles            (id → users.id)               [1:1]
├── settings_salary     (user_id)                      [1:N, PK composta]
├── bank_accounts       (user_id)                      [1:N, soft-delete]
│   └── credit_cards    (bank_account_id)              [1:N, soft-delete]
│       ├── credit_card_statement_cycles (card_id)     [1:N; 1 aberto/cartão]
│       ├── credit_card_invoices (card_id)             [1:N; UNIQUE card+month_key]
│       └── transactions (card_id)
├── categories          (user_id)                      [1:N, soft-delete]
├── pluggy_items        (user_id)                      [1:N; CASCADE] ➕
└── transactions        (user_id)                      [1:N]
    ├── account_id      → bank_accounts
    ├── to_account_id   → bank_accounts  [só transfer]
    ├── card_id         → credit_cards   [nullable]
    ├── category_id     → categories     [nullable]
    └── invoice_id      → credit_card_invoices [nullable]

audit_log        (standalone; populado por triggers de auditoria)
system_config    (standalone; key/value global)

NOTA: profiles é criado AUTOMATICAMENTE ao inserir em auth.users (trigger on_auth_user_created → handle_new_user).
NOTA: site_branding foi REMOVIDA.
```

### Agrupamentos lógicos sem FK
| Coluna | Semântica |
|---|---|
| `transactions.installment_group_id` | Agrupa N parcelas. UUID compartilhado, sem tabela-mãe. Read-model: `v_installment_groups`. |
| `transactions.recurring_group_id` | Agrupa transações recorrentes. UUID compartilhado. Read-model: `v_recurring_groups`. |

> **Migração .NET:** Esses grupos não têm entidade própria. Manter como colunas Guid nullable e expor via queries de agregação. Avaliar (opcionalmente) promover a entidades `InstallmentGroup`/`RecurringGroup` se facilitar — mas isso muda o modelo, decisão de design.
