CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_start_date date DEFAULT NULL,
  p_end_date   date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_income    numeric := 0;
  v_first_tx_month date;
  v_filter_month   date;
BEGIN
  SELECT date_trunc('month', MIN(payment_date))
  INTO v_first_tx_month
  FROM public.transactions
  WHERE user_id = auth.uid();

  IF p_start_date IS NULL THEN
    SELECT COALESCE(SUM(initial_balance), 0)
    INTO v_base_income
    FROM public.bank_accounts
    WHERE user_id = auth.uid() AND deleted_at IS NULL;
  ELSE
    v_filter_month := date_trunc('month', p_start_date);
    IF v_first_tx_month IS NOT NULL AND v_filter_month <= v_first_tx_month THEN
      SELECT COALESCE(SUM(initial_balance), 0)
      INTO v_base_income
      FROM public.bank_accounts
      WHERE user_id = auth.uid() AND deleted_at IS NULL;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'total_balance', (
      SELECT COALESCE(SUM(current_balance), 0)
      FROM public.bank_accounts
      WHERE user_id = auth.uid() AND deleted_at IS NULL AND is_active = TRUE
    ),
    'total_available_limit', (
      SELECT COALESCE(SUM(vcl.available_limit), 0)
      FROM public.v_card_limits vcl
      WHERE vcl.card_id IN (
        SELECT id FROM public.credit_cards
        WHERE user_id = auth.uid() AND deleted_at IS NULL
      )
    ),
    'monthly_income', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE user_id = auth.uid() AND type = 'income'
        AND (p_start_date IS NULL OR payment_date >= p_start_date)
        AND (p_end_date   IS NULL OR payment_date <= p_end_date)
    ) + v_base_income,
    'monthly_expenses', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE user_id = auth.uid()
        AND type IN ('expense', 'transfer') AND card_id IS NULL
        AND (p_start_date IS NULL OR payment_date >= p_start_date)
        AND (p_end_date   IS NULL OR payment_date <= p_end_date)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_card_stats(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  card_id          uuid,
  usage            numeric,
  current_invoice  numeric,
  available_limit  numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH unpaid AS (
    SELECT
      i.card_id,
      SUM(i.total_amount - i.paid_amount) AS usage
    FROM public.credit_card_invoices i
    JOIN public.credit_cards c ON c.id = i.card_id
    WHERE c.user_id = COALESCE(p_user_id, auth.uid())
      AND c.deleted_at IS NULL
      AND i.status != 'paid'
    GROUP BY i.card_id
  ),
  current_inv AS (
    SELECT
      i.card_id,
      (i.total_amount - i.paid_amount) AS current_invoice
    FROM public.credit_card_invoices i
    JOIN public.credit_cards c ON c.id = i.card_id
    WHERE c.user_id = COALESCE(p_user_id, auth.uid())
      AND c.deleted_at IS NULL
      AND i.month_key = to_char(CURRENT_DATE, 'YYYY-MM')
  )
  SELECT
    c.id                                          AS card_id,
    COALESCE(u.usage, 0)                          AS usage,
    COALESCE(ci.current_invoice, 0)               AS current_invoice,
    c.credit_limit - COALESCE(u.usage, 0)         AS available_limit
  FROM public.credit_cards c
  LEFT JOIN unpaid     u  ON u.card_id  = c.id
  LEFT JOIN current_inv ci ON ci.card_id = c.id
  WHERE c.user_id = COALESCE(p_user_id, auth.uid())
    AND c.deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_card_stats(p_card_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'usage',           COALESCE(u.usage, 0),
    'current_invoice', COALESCE(ci.current_invoice, 0),
    'available_limit', c.credit_limit - COALESCE(u.usage, 0)
  )
  FROM public.credit_cards c
  LEFT JOIN (
    SELECT card_id, SUM(total_amount - paid_amount) AS usage
    FROM public.credit_card_invoices
    WHERE card_id = p_card_id AND status != 'paid'
    GROUP BY card_id
  ) u ON u.card_id = c.id
  LEFT JOIN (
    SELECT card_id, (total_amount - paid_amount) AS current_invoice
    FROM public.credit_card_invoices
    WHERE card_id = p_card_id
      AND month_key = to_char(CURRENT_DATE, 'YYYY-MM')
  ) ci ON ci.card_id = c.id
  WHERE c.id = p_card_id
    AND c.user_id = auth.uid();
$$;
