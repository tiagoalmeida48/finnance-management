-- =============================================================================
-- RPC Business Rules — finnance-management
--
-- Move all business logic from the frontend TypeScript services to the database.
-- Each function runs as SECURITY DEFINER so it has full access but validates
-- ownership via auth.uid() internally.
--
-- Fases:
--   1. recalculate_invoice_total   — replaces JS fetch+reduce+update
--   2. get_dashboard_stats         — replaces 4 parallel queries + JS reduce
--      get_chart_data              — replaces full-table fetch + JS bucket
--      get_category_distribution   — replaces full-table fetch + JS group
--   3. create_transaction          — atomic installment/recurring creation
--   4. batch_pay_transactions      — atomic batch pay
--      batch_unpay_transactions    — atomic batch unpay
--      batch_delete_transactions   — atomic batch delete
--   5. trg_link_transaction_to_invoice — BEFORE INSERT/UPDATE trigger
--   6. delete_transaction_group    — atomic group delete + recalculate
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FASE 1: recalculate_invoice_total
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_invoice_total(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total  numeric;
  v_paid   numeric;
  v_status text;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN -amount ELSE amount END), 0),
    COALESCE(SUM(CASE WHEN is_paid = true AND type != 'income' THEN amount ELSE 0 END), 0)
  INTO v_total, v_paid
  FROM public.transactions
  WHERE invoice_id = p_invoice_id;

  v_status := CASE
    WHEN v_total > 0 AND v_paid >= v_total THEN 'paid'
    WHEN v_paid > 0 AND v_paid < v_total   THEN 'partial'
    ELSE 'open'
  END;

  UPDATE public.credit_card_invoices
  SET total_amount = v_total,
      paid_amount  = v_paid,
      status       = v_status,
      paid_at      = CASE WHEN v_status = 'paid' THEN now() ELSE NULL END,
      updated_at   = now()
  WHERE id = p_invoice_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- FASE 2: get_dashboard_stats
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_start_date date DEFAULT NULL,
  p_end_date   date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
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
    ),
    'monthly_expenses', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions
      WHERE user_id = auth.uid()
        AND type IN ('expense', 'transfer') AND card_id IS NULL
        AND (p_start_date IS NULL OR payment_date >= p_start_date)
        AND (p_end_date   IS NULL OR payment_date <= p_end_date)
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- FASE 2: get_chart_data
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_chart_data(
  p_start_date date,
  p_end_date   date
)
RETURNS TABLE (month_key text, receita numeric, despesa numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    to_char(payment_date, 'YYYY-MM') AS month_key,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS receita,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'transfer') AND card_id IS NULL
                      THEN amount ELSE 0 END), 0) AS despesa
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND payment_date BETWEEN p_start_date AND p_end_date
  GROUP BY to_char(payment_date, 'YYYY-MM')
  ORDER BY to_char(payment_date, 'YYYY-MM');
$$;

-- ---------------------------------------------------------------------------
-- FASE 2: get_category_distribution
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_distribution(
  p_start_date date DEFAULT NULL,
  p_end_date   date DEFAULT NULL
)
RETURNS TABLE (category_name text, total numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(c.name, 'Geral') AS category_name,
    COALESCE(SUM(t.amount), 0) AS total
  FROM public.transactions t
  LEFT JOIN public.categories c ON c.id = t.category_id
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND (p_start_date IS NULL OR t.payment_date >= p_start_date)
    AND (p_end_date   IS NULL OR t.payment_date <= p_end_date)
  GROUP BY COALESCE(c.name, 'Geral')
  ORDER BY total DESC;
$$;

-- ---------------------------------------------------------------------------
-- FASE 3: create_transaction (atomic — installment, recurring, simple)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_transaction(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id            uuid := auth.uid();
  v_group_id           uuid;
  v_total_installments int;
  v_repeat_count       int;
  v_is_installment     boolean;
  v_is_fixed           boolean;
  v_tx_id              uuid;
  i                    int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF (p_data->>'amount')::numeric <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  v_total_installments := COALESCE((p_data->>'total_installments')::int, 1);
  v_repeat_count       := COALESCE((p_data->>'repeat_count')::int, 1);
  v_is_installment     := COALESCE((p_data->>'is_installment')::boolean, false);
  v_is_fixed           := COALESCE((p_data->>'is_fixed')::boolean, false);

  IF v_is_installment OR v_total_installments > 1 THEN
    -- Criar N parcelas atomicamente
    v_group_id := gen_random_uuid();
    FOR i IN 1..v_total_installments LOOP
      INSERT INTO public.transactions (
        user_id, type, amount, payment_date, purchase_date,
        description, account_id, card_id, category_id,
        payment_method, is_paid, is_fixed,
        installment_group_id, installment_number, total_installments,
        recurring_group_id
      ) VALUES (
        v_user_id,
        p_data->>'type',
        COALESCE(
          (p_data->'installment_amounts'->(i-1))::numeric,
          (p_data->>'amount')::numeric
        ),
        ((p_data->>'payment_date')::date + ((i-1) || ' months')::interval)::date,
        CASE WHEN p_data->>'purchase_date' IS NOT NULL AND p_data->>'purchase_date' != 'null'
             THEN ((p_data->>'purchase_date')::date + ((i-1) || ' months')::interval)::date
             ELSE NULL END,
        p_data->>'description' || ' (' ||
          lpad(i::text, 2, '0') || '/' || lpad(v_total_installments::text, 2, '0') || ')',
        (p_data->>'account_id')::uuid,
        CASE WHEN p_data->>'card_id' IS NOT NULL AND p_data->>'card_id' != 'null'
             THEN (p_data->>'card_id')::uuid ELSE NULL END,
        CASE WHEN p_data->>'category_id' IS NOT NULL AND p_data->>'category_id' != 'null'
             THEN (p_data->>'category_id')::uuid ELSE NULL END,
        NULLIF(p_data->>'payment_method', ''),
        false,
        false,
        v_group_id,
        i,
        v_total_installments,
        NULL
      ) RETURNING id INTO v_tx_id;
    END LOOP;

  ELSIF v_is_fixed AND v_repeat_count > 1 THEN
    -- Criar N recorrências atomicamente
    v_group_id := gen_random_uuid();
    FOR i IN 0..(v_repeat_count - 1) LOOP
      INSERT INTO public.transactions (
        user_id, type, amount, payment_date, purchase_date,
        description, account_id, card_id, category_id,
        payment_method, is_paid, is_fixed,
        recurring_group_id, installment_group_id, total_installments
      ) VALUES (
        v_user_id,
        p_data->>'type',
        (p_data->>'amount')::numeric,
        ((p_data->>'payment_date')::date + (i || ' months')::interval)::date,
        CASE WHEN p_data->>'purchase_date' IS NOT NULL AND p_data->>'purchase_date' != 'null'
             THEN ((p_data->>'purchase_date')::date + (i || ' months')::interval)::date
             ELSE NULL END,
        p_data->>'description',
        (p_data->>'account_id')::uuid,
        CASE WHEN p_data->>'card_id' IS NOT NULL AND p_data->>'card_id' != 'null'
             THEN (p_data->>'card_id')::uuid ELSE NULL END,
        CASE WHEN p_data->>'category_id' IS NOT NULL AND p_data->>'category_id' != 'null'
             THEN (p_data->>'category_id')::uuid ELSE NULL END,
        NULLIF(p_data->>'payment_method', ''),
        false,
        true,
        v_group_id,
        NULL,
        1
      ) RETURNING id INTO v_tx_id;
    END LOOP;

  ELSE
    -- Transação simples
    INSERT INTO public.transactions (
      user_id, type, amount, payment_date, purchase_date,
      description, account_id, to_account_id, card_id, category_id,
      payment_method, notes, is_paid, is_fixed,
      recurring_group_id, total_installments
    ) VALUES (
      v_user_id,
      p_data->>'type',
      (p_data->>'amount')::numeric,
      (p_data->>'payment_date')::date,
      CASE WHEN p_data->>'purchase_date' IS NOT NULL AND p_data->>'purchase_date' != 'null'
           THEN (p_data->>'purchase_date')::date ELSE NULL END,
      p_data->>'description',
      CASE WHEN p_data->>'account_id' IS NOT NULL AND p_data->>'account_id' != 'null'
           THEN (p_data->>'account_id')::uuid ELSE NULL END,
      CASE WHEN p_data->>'to_account_id' IS NOT NULL AND p_data->>'to_account_id' != 'null'
           THEN (p_data->>'to_account_id')::uuid ELSE NULL END,
      CASE WHEN p_data->>'card_id' IS NOT NULL AND p_data->>'card_id' != 'null'
           THEN (p_data->>'card_id')::uuid ELSE NULL END,
      CASE WHEN p_data->>'category_id' IS NOT NULL AND p_data->>'category_id' != 'null'
           THEN (p_data->>'category_id')::uuid ELSE NULL END,
      NULLIF(p_data->>'payment_method', ''),
      NULLIF(p_data->>'notes', ''),
      COALESCE((p_data->>'is_paid')::boolean, false),
      COALESCE((p_data->>'is_fixed')::boolean, false),
      CASE WHEN COALESCE((p_data->>'is_fixed')::boolean, false)
                AND p_data->>'recurring_group_id' IS NOT NULL
                AND p_data->>'recurring_group_id' != 'null'
           THEN (p_data->>'recurring_group_id')::uuid ELSE NULL END,
      1
    ) RETURNING id INTO v_tx_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_tx_id,
    'group_id', v_group_id
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- FASE 4: batch_pay_transactions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.batch_pay_transactions(
  p_ids          uuid[],
  p_account_id   uuid,
  p_payment_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_ids uuid[];
BEGIN
  -- Captura invoice_ids antes do update (pode mudar se trigger re-linkar)
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_invoice_ids
  FROM public.transactions
  WHERE id = ANY(p_ids) AND invoice_id IS NOT NULL AND user_id = auth.uid();

  UPDATE public.transactions
  SET is_paid      = true,
      payment_date = p_payment_date,
      account_id   = p_account_id,
      updated_at   = now()
  WHERE id = ANY(p_ids)
    AND user_id = auth.uid();

  -- Recalcular todas as invoices afetadas
  IF v_invoice_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_invoice_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_invoice_ids[i]);
    END LOOP;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- FASE 4: batch_unpay_transactions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.batch_unpay_transactions(p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_invoice_ids
  FROM public.transactions
  WHERE id = ANY(p_ids) AND invoice_id IS NOT NULL AND user_id = auth.uid();

  UPDATE public.transactions
  SET is_paid    = false,
      updated_at = now()
  WHERE id = ANY(p_ids)
    AND user_id = auth.uid();

  IF v_invoice_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_invoice_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_invoice_ids[i]);
    END LOOP;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- FASE 4: batch_delete_transactions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.batch_delete_transactions(p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_invoice_ids
  FROM public.transactions
  WHERE id = ANY(p_ids) AND invoice_id IS NOT NULL AND user_id = auth.uid();

  DELETE FROM public.transactions
  WHERE id = ANY(p_ids)
    AND user_id = auth.uid();

  IF v_invoice_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_invoice_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_invoice_ids[i]);
    END LOOP;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- FASE 5: trg_link_transaction_to_invoice (BEFORE INSERT/UPDATE trigger)
--
-- Calcula o month_key da fatura com base no ciclo do cartão e faz upsert
-- na tabela credit_card_invoices, preenchendo NEW.invoice_id antes do INSERT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_link_transaction_to_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_closing_day  int;
  v_due_day      int;
  v_anchor_date  date;
  v_day_of_month int;
  v_shift        int;
  v_month_key    text;
  v_invoice_id   uuid;
  v_closing_date date;
  v_due_date     date;
  v_last_day     int;
BEGIN
  -- Só processa transações de cartão
  IF NEW.card_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Busca ciclo aberto do cartão (date_end = sentinel 9999-12-31)
  SELECT closing_day, due_day
  INTO v_closing_day, v_due_day
  FROM public.credit_card_statement_cycles
  WHERE card_id = NEW.card_id AND date_end = '9999-12-31'::date
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Âncora: purchase_date tem prioridade sobre payment_date
  v_anchor_date := COALESCE(NEW.purchase_date, NEW.payment_date);
  IF v_anchor_date IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determina shift de meses para calcular o mês da fatura:
  --   +1 se o dia da âncora ultrapassou o dia de fechamento (compra já vai para próxima fatura)
  --   +1 se closing_day >= due_day (fechamento e vencimento em meses diferentes)
  v_day_of_month := EXTRACT(DAY FROM v_anchor_date)::int;
  v_shift := 0;
  IF v_day_of_month > v_closing_day THEN
    v_shift := v_shift + 1;
  END IF;
  IF v_closing_day >= v_due_day THEN
    v_shift := v_shift + 1;
  END IF;

  v_month_key := to_char(v_anchor_date + (v_shift || ' months')::interval, 'YYYY-MM');

  -- Calcular closing_date (dia de fechamento no mês anterior ao vencimento)
  v_closing_date := (date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
                     + ((v_closing_day - 1) || ' days')::interval)::date;

  -- Calcular due_date (clampado ao último dia do mês)
  v_last_day := EXTRACT(DAY FROM
    (date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
     + '1 month'::interval - '1 day'::interval)
  )::int;
  v_due_date := (date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
                 + ((LEAST(v_due_day, v_last_day) - 1) || ' days')::interval)::date;

  -- Buscar invoice existente para esse cartão + mês
  SELECT id INTO v_invoice_id
  FROM public.credit_card_invoices
  WHERE card_id = NEW.card_id AND month_key = v_month_key
  LIMIT 1;

  -- Criar invoice se não existir
  IF v_invoice_id IS NULL THEN
    INSERT INTO public.credit_card_invoices (user_id, card_id, month_key, closing_date, due_date)
    VALUES (NEW.user_id, NEW.card_id, v_month_key, v_closing_date, v_due_date)
    RETURNING id INTO v_invoice_id;
  END IF;

  NEW.invoice_id := v_invoice_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_to_invoice ON public.transactions;
CREATE TRIGGER trg_link_to_invoice
  BEFORE INSERT OR UPDATE OF card_id, purchase_date, payment_date
  ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_link_transaction_to_invoice();

-- ---------------------------------------------------------------------------
-- FASE 6: delete_transaction_group
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_transaction_group(
  p_group_id uuid,
  p_type     text  -- 'installment' | 'recurring'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_col      text;
  v_inv_ids  uuid[];
  i          int;
BEGIN
  IF p_type NOT IN ('installment', 'recurring') THEN
    RAISE EXCEPTION 'p_type must be installment or recurring, got: %', p_type;
  END IF;

  v_col := CASE p_type
    WHEN 'installment' THEN 'installment_group_id'
    ELSE 'recurring_group_id'
  END;

  EXECUTE format(
    'SELECT ARRAY_AGG(DISTINCT invoice_id)
     FROM public.transactions
     WHERE %I = $1 AND invoice_id IS NOT NULL AND user_id = $2',
    v_col
  ) USING p_group_id, auth.uid() INTO v_inv_ids;

  EXECUTE format(
    'DELETE FROM public.transactions WHERE %I = $1 AND user_id = $2',
    v_col
  ) USING p_group_id, auth.uid();

  IF v_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_inv_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_inv_ids[i]);
    END LOOP;
  END IF;
END;
$$;
