-- =============================================================================
-- Security: Views UNRESTRICTED → security_invoker = true
-- Todas as 4 views passam a herdar o RLS das tabelas base,
-- filtrando automaticamente pelo usuario autenticado.
-- =============================================================================

-- v_card_limits: sem filtro user_id — expoe dados de todos os cartoes
CREATE OR REPLACE VIEW public.v_card_limits
WITH (security_invoker = true)
AS
SELECT
  cc.id AS card_id,
  cc.credit_limit,
  COALESCE(SUM(
    CASE WHEN inv.status <> 'paid' THEN (inv.total_amount - inv.paid_amount)
         ELSE 0
    END), 0) AS total_usage,
  (cc.credit_limit - COALESCE(SUM(
    CASE WHEN inv.status <> 'paid' THEN (inv.total_amount - inv.paid_amount)
         ELSE 0
    END), 0)) AS available_limit
FROM credit_cards cc
LEFT JOIN credit_card_invoices inv ON inv.card_id = cc.id
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.credit_limit;

-- v_credit_cards_with_cycles: expoe todos os cartoes sem filtro user_id
CREATE OR REPLACE VIEW public.v_credit_cards_with_cycles
WITH (security_invoker = true)
AS
SELECT
  cc.id,
  cc.user_id,
  cc.bank_account_id,
  cc.name,
  cc.color,
  cc.credit_limit,
  cc.is_active,
  cc.deleted_at,
  cc.created_at,
  cc.updated_at,
  cc.notes,
  cyc.closing_day AS cycle_closing_day,
  cyc.due_day     AS cycle_due_day
FROM credit_cards cc
LEFT JOIN credit_card_statement_cycles cyc
  ON cyc.card_id = cc.id AND cyc.date_end = '9999-12-31'::date;

-- v_installment_groups: agrupa transacoes sem filtrar pelo usuario chamador
CREATE OR REPLACE VIEW public.v_installment_groups
WITH (security_invoker = true)
AS
SELECT
  installment_group_id AS group_id,
  user_id,
  MAX(total_installments) AS declared_count,
  COUNT(*)               AS actual_count,
  SUM(amount)            AS total_amount,
  SUM(CASE WHEN is_paid THEN amount ELSE 0 END) AS paid_amount,
  COUNT(CASE WHEN is_paid THEN 1 END)            AS paid_count,
  MIN(payment_date) AS first_payment_date,
  MAX(payment_date) AS last_payment_date
FROM transactions
WHERE installment_group_id IS NOT NULL
GROUP BY installment_group_id, user_id;

-- v_recurring_groups: mesmo problema — agrupa sem filtrar usuario
CREATE OR REPLACE VIEW public.v_recurring_groups
WITH (security_invoker = true)
AS
SELECT
  recurring_group_id AS group_id,
  user_id,
  COUNT(*)  AS total_count,
  SUM(amount) AS total_amount,
  SUM(CASE WHEN is_paid THEN amount ELSE 0 END) AS paid_amount,
  COUNT(CASE WHEN is_paid THEN 1 END)            AS paid_count,
  MIN(payment_date) AS first_payment_date,
  MAX(payment_date) AS last_payment_date
FROM transactions
WHERE recurring_group_id IS NOT NULL
GROUP BY recurring_group_id, user_id;
