-- =============================================================================
-- Schema Constraints & Indexes — finnance-management
--
-- Complementa a migration 20260320000000 com constraints de validacao,
-- indices de performance, consistencia de soft-delete e correcoes de DDL.
--
-- CORRECOES APLICADAS:
--  - bank_accounts.deleted_at: timestamp → timestamptz (padronizacao)
--  - transactions.recurring_group_id: DEFAULT NULL (antes gen_random_uuid)
--  - credit_cards.closing_day/due_day: drop columns (redundantes com cycles)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CORRECAO: bank_accounts.deleted_at → timestamptz (era timestamp sem tz)
-- ---------------------------------------------------------------------------
ALTER TABLE public.bank_accounts
  ALTER COLUMN deleted_at TYPE timestamptz USING deleted_at AT TIME ZONE 'UTC';

-- ---------------------------------------------------------------------------
-- 2. CORRECAO: transactions.recurring_group_id DEFAULT NULL
--    gen_random_uuid() criavaUUIDs fantasmas para transacoes nao-recorrentes
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions
  ALTER COLUMN recurring_group_id DROP DEFAULT;

-- ---------------------------------------------------------------------------
-- 3. CORRECAO: drop policies duplicadas
--    A migration 20260222214300 criou policies com nomes legiveis
--    e 20260320000000 criou duplicatas com nomes tecnicos.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can insert own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can update own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can view own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.credit_card_invoices;
DROP POLICY IF EXISTS "Users can delete own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can insert own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can update own bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.bank_accounts;

-- ---------------------------------------------------------------------------
-- 4. PRECISAO NUMERICA (15,2) — ate 999 trilhoes com 2 casas decimais
--    A DDL original tinha numeric sem precisao definida
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions ALTER COLUMN amount TYPE NUMERIC(15,2);
ALTER TABLE public.credit_cards ALTER COLUMN credit_limit TYPE NUMERIC(15,2);
ALTER TABLE public.bank_accounts
  ALTER COLUMN initial_balance TYPE NUMERIC(15,2),
  ALTER COLUMN current_balance TYPE NUMERIC(15,2);
ALTER TABLE public.credit_card_invoices
  ALTER COLUMN total_amount TYPE NUMERIC(15,2),
  ALTER COLUMN paid_amount TYPE NUMERIC(15,2);
ALTER TABLE public.settings_salary
  ALTER COLUMN hourly_rate TYPE NUMERIC(15,2),
  ALTER COLUMN base_salary TYPE NUMERIC(15,2);

-- ---------------------------------------------------------------------------
-- 5. CHECK: VALIDADE DE PARCELAS (transactions)
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions ADD CONSTRAINT chk_installment_total_positive
  CHECK (total_installments IS NULL OR total_installments >= 1);

ALTER TABLE public.transactions ADD CONSTRAINT chk_installment_number_positive
  CHECK (installment_number IS NULL OR installment_number >= 1);

ALTER TABLE public.transactions ADD CONSTRAINT chk_installment_number_valid
  CHECK (
    installment_number IS NULL
    OR total_installments IS NULL
    OR installment_number <= total_installments
  );

ALTER TABLE public.transactions ADD CONSTRAINT chk_installment_complete
  CHECK (
    (installment_number IS NULL AND total_installments IS NULL)
    OR (installment_number IS NOT NULL AND total_installments IS NOT NULL)
  );

-- ---------------------------------------------------------------------------
-- 6. CHECK: LIMITES DE FATURA (credit_card_invoices)
-- ---------------------------------------------------------------------------
ALTER TABLE public.credit_card_invoices ADD CONSTRAINT chk_invoice_total_positive
  CHECK (total_amount >= 0);

ALTER TABLE public.credit_card_invoices ADD CONSTRAINT chk_invoice_paid_amount_bounds
  CHECK (paid_amount >= 0);

-- ---------------------------------------------------------------------------
-- 7. UNIQUE PARCIAL: 1 ciclo aberto por card
--    Garante que so existe 1 ciclo com date_end='9999-12-31' por card
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_card_open_cycle
  ON public.credit_card_statement_cycles(card_id)
  WHERE date_end = '9999-12-31'::date;

-- ---------------------------------------------------------------------------
-- 8. INDICES PARCIAIS EM FKs DE transactions
--    Mais eficientes que indices completos (exclui NULLs)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_card_id
  ON public.transactions(card_id) WHERE card_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
  ON public.transactions(account_id) WHERE account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_to_account_id
  ON public.transactions(to_account_id) WHERE to_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
  ON public.transactions(category_id) WHERE category_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 9. INDICES SOFT-DELETE
--    Otsimizacao das queries .is('deleted_at', null)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active
  ON public.bank_accounts(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_active
  ON public.categories(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_credit_cards_active
  ON public.credit_cards(user_id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 10. CHECK: bank_accounts.type enum
-- ---------------------------------------------------------------------------
ALTER TABLE public.bank_accounts ADD CONSTRAINT chk_bank_account_type
  CHECK (type IN ('checking', 'savings', 'investment', 'wallet', 'other'));

-- ---------------------------------------------------------------------------
-- 11. CATEGORIES: NOT NULL + UNIQUE name per user/type
-- ---------------------------------------------------------------------------
UPDATE public.categories SET name = 'Sem nome' WHERE name IS NULL OR name = '';
ALTER TABLE public.categories ALTER COLUMN name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_category_user_type_name
  ON public.categories(user_id, type, name) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 12. CHECK: statement cycle dates (date_start <= date_end)
-- ---------------------------------------------------------------------------
ALTER TABLE public.credit_card_statement_cycles ADD CONSTRAINT chk_cycle_dates
  CHECK (date_start IS NULL OR date_end IS NULL OR date_start <= date_end);

-- ---------------------------------------------------------------------------
-- 13. CHECK: salary settings percentages e datas
-- ---------------------------------------------------------------------------
ALTER TABLE public.settings_salary ADD CONSTRAINT chk_salary_inss_percentage
  CHECK (inss_discount_percentage >= 0 AND inss_discount_percentage <= 100);

ALTER TABLE public.settings_salary ADD CONSTRAINT chk_salary_admin_percentage
  CHECK (admin_fee_percentage >= 0 AND admin_fee_percentage <= 100);

ALTER TABLE public.settings_salary ADD CONSTRAINT chk_salary_dates
  CHECK (date_start IS NOT NULL AND date_end IS NOT NULL AND date_start <= date_end);

-- ---------------------------------------------------------------------------
-- 14. CONSISTENCIA deleted_at + is_active
--     Se deleted_at esta setado, is_active DEVE ser FALSE
-- ---------------------------------------------------------------------------
ALTER TABLE public.bank_accounts ADD CONSTRAINT chk_bank_account_deletion
  CHECK (deleted_at IS NULL OR is_active = FALSE);

ALTER TABLE public.categories ADD CONSTRAINT chk_category_deletion
  CHECK (deleted_at IS NULL OR is_active = FALSE);

ALTER TABLE public.credit_cards ADD CONSTRAINT chk_card_deletion
  CHECK (deleted_at IS NULL OR is_active = FALSE);

-- ---------------------------------------------------------------------------
-- 15. INDICE COMPOSTO: invoice (card_id, status)
--     Otsimiza filtro de faturas nao-pagas por cartao
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invoices_card_status
  ON public.credit_card_invoices(card_id, status);

-- ---------------------------------------------------------------------------
-- 16. INDICE: categories.type
--     Otsimiza filtro por income/expense
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_categories_type
  ON public.categories(type);
