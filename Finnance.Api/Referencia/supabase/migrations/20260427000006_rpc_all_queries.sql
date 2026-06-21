-- =============================================================================
-- RPCs para todas as queries diretas do frontend
-- Nenhum .from() fica exposto na URL — tudo passa por /rest/v1/rpc/
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ACCOUNTS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_accounts()
RETURNS SETOF public.bank_accounts
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT * FROM public.bank_accounts
  WHERE user_id = auth.uid() AND deleted_at IS NULL
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION public.create_account(
  p_name          text,
  p_type          text,
  p_initial_balance numeric,
  p_color         text DEFAULT NULL,
  p_icon          text DEFAULT NULL,
  p_pluggy_account_id text DEFAULT NULL
)
RETURNS public.bank_accounts
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.bank_accounts;
BEGIN
  INSERT INTO public.bank_accounts (user_id, name, type, initial_balance, current_balance, color, icon, pluggy_account_id)
  VALUES (auth.uid(), p_name, p_type, p_initial_balance, p_initial_balance, p_color, p_icon, p_pluggy_account_id)
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_account(
  p_id            uuid,
  p_name          text DEFAULT NULL,
  p_type          text DEFAULT NULL,
  p_color         text DEFAULT NULL,
  p_icon          text DEFAULT NULL,
  p_pluggy_account_id text DEFAULT NULL,
  p_initial_balance numeric DEFAULT NULL,
  p_current_balance numeric DEFAULT NULL,
  p_is_active     boolean DEFAULT NULL
)
RETURNS public.bank_accounts
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.bank_accounts;
BEGIN
  UPDATE public.bank_accounts SET
    name             = COALESCE(p_name, name),
    type             = COALESCE(p_type, type),
    color            = COALESCE(p_color, color),
    icon             = COALESCE(p_icon, icon),
    pluggy_account_id = COALESCE(p_pluggy_account_id, pluggy_account_id),
    initial_balance  = COALESCE(p_initial_balance, initial_balance),
    current_balance  = COALESCE(p_current_balance, current_balance),
    is_active        = COALESCE(p_is_active, is_active),
    updated_at       = now()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_account(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.bank_accounts
  SET deleted_at = now(), updated_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_categories()
RETURNS SETOF public.categories
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT * FROM public.categories
  WHERE user_id = auth.uid() AND deleted_at IS NULL
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION public.create_category(
  p_name  text,
  p_type  text,
  p_color text DEFAULT NULL,
  p_icon  text DEFAULT NULL
)
RETURNS public.categories
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.categories;
BEGIN
  INSERT INTO public.categories (user_id, name, type, color, icon)
  VALUES (auth.uid(), p_name, p_type, p_color, p_icon)
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_category(
  p_id    uuid,
  p_name  text DEFAULT NULL,
  p_type  text DEFAULT NULL,
  p_color text DEFAULT NULL,
  p_icon  text DEFAULT NULL
)
RETURNS public.categories
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.categories;
BEGIN
  UPDATE public.categories SET
    name       = COALESCE(p_name, name),
    type       = COALESCE(p_type, type),
    color      = COALESCE(p_color, color),
    icon       = COALESCE(p_icon, icon),
    updated_at = now()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Category not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_category(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.categories
  SET deleted_at = now(), is_active = false, updated_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Category not found'; END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- CREDIT CARDS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cards()
RETURNS TABLE (
  id uuid, user_id uuid, bank_account_id uuid, name text, color text,
  credit_limit numeric, is_active boolean, deleted_at timestamptz,
  created_at timestamptz, updated_at timestamptz, notes text,
  cycle_closing_day integer, cycle_due_day integer
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT * FROM public.v_credit_cards_with_cycles
  WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_card_by_id(p_id uuid)
RETURNS TABLE (
  id uuid, user_id uuid, bank_account_id uuid, name text, color text,
  credit_limit numeric, is_active boolean, deleted_at timestamptz,
  created_at timestamptz, updated_at timestamptz, notes text,
  bank_account_name text
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT cc.id, cc.user_id, cc.bank_account_id, cc.name, cc.color,
         cc.credit_limit, cc.is_active, cc.deleted_at, cc.created_at,
         cc.updated_at, cc.notes, ba.name AS bank_account_name
  FROM public.credit_cards cc
  LEFT JOIN public.bank_accounts ba ON ba.id = cc.bank_account_id
  WHERE cc.id = p_id AND cc.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.create_card(
  p_bank_account_id uuid,
  p_name            text,
  p_color           text,
  p_credit_limit    numeric,
  p_notes           text DEFAULT NULL
)
RETURNS public.credit_cards
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.credit_cards;
BEGIN
  INSERT INTO public.credit_cards (user_id, bank_account_id, name, color, credit_limit, notes)
  VALUES (auth.uid(), p_bank_account_id, p_name, p_color, p_credit_limit, p_notes)
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_card(
  p_id              uuid,
  p_name            text DEFAULT NULL,
  p_color           text DEFAULT NULL,
  p_credit_limit    numeric DEFAULT NULL,
  p_bank_account_id uuid DEFAULT NULL,
  p_notes           text DEFAULT NULL,
  p_is_active       boolean DEFAULT NULL
)
RETURNS public.credit_cards
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.credit_cards;
BEGIN
  UPDATE public.credit_cards SET
    name             = COALESCE(p_name, name),
    color            = COALESCE(p_color, color),
    credit_limit     = COALESCE(p_credit_limit, credit_limit),
    bank_account_id  = COALESCE(p_bank_account_id, bank_account_id),
    notes            = COALESCE(p_notes, notes),
    is_active        = COALESCE(p_is_active, is_active),
    updated_at       = now()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Card not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_card(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.credit_cards
  SET deleted_at = now(), is_active = false, updated_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Card not found'; END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- INVOICES
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_invoices_by_card(
  p_card_id uuid,
  p_year    text DEFAULT NULL
)
RETURNS SETOF public.credit_card_invoices
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT i.* FROM public.credit_card_invoices i
  JOIN public.credit_cards cc ON cc.id = i.card_id
  WHERE i.card_id = p_card_id
    AND cc.user_id = auth.uid()
    AND (p_year IS NULL OR (i.month_key >= p_year || '-01' AND i.month_key <= p_year || '-12'))
  ORDER BY i.month_key DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_invoice_by_month(p_card_id uuid, p_month_key text)
RETURNS public.credit_card_invoices
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.credit_card_invoices;
BEGIN
  SELECT i.* INTO v_row
  FROM public.credit_card_invoices i
  JOIN public.credit_cards cc ON cc.id = i.card_id
  WHERE i.card_id = p_card_id AND i.month_key = p_month_key AND cc.user_id = auth.uid();
  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------------
-- CYCLES
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cycles_by_card(p_card_id uuid)
RETURNS SETOF public.credit_card_statement_cycles
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT cyc.* FROM public.credit_card_statement_cycles cyc
  JOIN public.credit_cards cc ON cc.id = cyc.card_id
  WHERE cyc.card_id = p_card_id AND cc.user_id = auth.uid()
  ORDER BY cyc.date_start ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_cycle_by_id(p_id uuid)
RETURNS public.credit_card_statement_cycles
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.credit_card_statement_cycles;
BEGIN
  SELECT cyc.* INTO v_row
  FROM public.credit_card_statement_cycles cyc
  JOIN public.credit_cards cc ON cc.id = cyc.card_id
  WHERE cyc.id = p_id AND cc.user_id = auth.uid();
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cycle(
  p_id          uuid,
  p_closing_day integer,
  p_due_day     integer,
  p_notes       text DEFAULT NULL
)
RETURNS public.credit_card_statement_cycles
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.credit_card_statement_cycles;
BEGIN
  UPDATE public.credit_card_statement_cycles SET
    closing_day = p_closing_day,
    due_day     = p_due_day,
    notes       = p_notes
  WHERE id = p_id
    AND card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid())
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Cycle not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cycle_date_start(p_id uuid, p_date_start date)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.credit_card_statement_cycles SET date_start = p_date_start
  WHERE id = p_id
    AND card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cycle_date_end(p_id uuid, p_date_end date)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.credit_card_statement_cycles SET date_end = p_date_end
  WHERE id = p_id
    AND card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_cycle(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  DELETE FROM public.credit_card_statement_cycles
  WHERE id = p_id
    AND card_id IN (SELECT id FROM public.credit_cards WHERE user_id = auth.uid());
  IF NOT FOUND THEN RAISE EXCEPTION 'Cycle not found'; END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- TRANSACTIONS — leitura
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_transaction_by_id(p_id uuid)
RETURNS TABLE (
  id uuid, user_id uuid, type text, amount numeric, payment_date date,
  purchase_date date, description text, is_paid boolean, is_fixed boolean,
  account_id uuid, to_account_id uuid, category_id uuid, card_id uuid,
  invoice_id uuid, installment_number integer, total_installments integer,
  installment_group_id uuid, recurring_group_id uuid, payment_method text,
  notes text, created_at timestamptz, updated_at timestamptz,
  bank_account_name text, to_bank_account_name text,
  category_name text, category_color text, category_icon text,
  credit_card_name text, credit_card_color text
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT t.id, t.user_id, t.type, t.amount, t.payment_date, t.purchase_date,
         t.description, t.is_paid, t.is_fixed, t.account_id, t.to_account_id,
         t.category_id, t.card_id, t.invoice_id, t.installment_number,
         t.total_installments, t.installment_group_id, t.recurring_group_id,
         t.payment_method, t.notes, t.created_at, t.updated_at,
         ba.name, tba.name, c.name, c.color, c.icon, cc.name, cc.color
  FROM public.transactions t
  LEFT JOIN public.bank_accounts ba  ON ba.id  = t.account_id
  LEFT JOIN public.bank_accounts tba ON tba.id = t.to_account_id
  LEFT JOIN public.categories c      ON c.id   = t.category_id
  LEFT JOIN public.credit_cards cc   ON cc.id  = t.card_id
  WHERE t.id = p_id AND t.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_first_transaction_date()
RETURNS date
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT payment_date FROM public.transactions
  WHERE user_id = auth.uid()
  ORDER BY payment_date ASC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_transactions_by_ids(p_ids uuid[])
RETURNS SETOF public.transactions
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT * FROM public.transactions
  WHERE id = ANY(p_ids) AND user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_transactions_paginated(
  p_start_date        date    DEFAULT NULL,
  p_end_date          date    DEFAULT NULL,
  p_type              text    DEFAULT NULL,
  p_is_paid           boolean DEFAULT NULL,
  p_account_id        uuid    DEFAULT NULL,
  p_card_id           uuid    DEFAULT NULL,
  p_category_id       uuid    DEFAULT NULL,
  p_payment_method    text    DEFAULT NULL,
  p_search            text    DEFAULT NULL,
  p_hide_credit_cards boolean DEFAULT false,
  p_only_credit_cards boolean DEFAULT false,
  p_only_installments boolean DEFAULT false,
  p_sort_field        text    DEFAULT 'payment_date',
  p_sort_asc          boolean DEFAULT false,
  p_limit             integer DEFAULT 50,
  p_offset            integer DEFAULT 0
)
RETURNS TABLE (
  id uuid, user_id uuid, type text, amount numeric, payment_date date,
  purchase_date date, description text, is_paid boolean, is_fixed boolean,
  account_id uuid, to_account_id uuid, category_id uuid, card_id uuid,
  invoice_id uuid, installment_number integer, total_installments integer,
  installment_group_id uuid, recurring_group_id uuid, payment_method text,
  notes text, created_at timestamptz, updated_at timestamptz,
  bank_account_name text, to_bank_account_name text,
  category_name text, category_color text, category_icon text,
  credit_card_name text, credit_card_color text,
  total_count bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_sort   text;
  v_limit  integer := LEAST(GREATEST(p_limit, 1), 10000);
BEGIN
  v_sort := CASE WHEN p_sort_field IN (
    'payment_date','purchase_date','amount','is_paid','payment_method','description','type'
  ) THEN p_sort_field ELSE 'payment_date' END;

  RETURN QUERY EXECUTE format(
    'SELECT t.id, t.user_id, t.type, t.amount, t.payment_date, t.purchase_date,
            t.description, t.is_paid, t.is_fixed, t.account_id, t.to_account_id,
            t.category_id, t.card_id, t.invoice_id, t.installment_number,
            t.total_installments, t.installment_group_id, t.recurring_group_id,
            t.payment_method, t.notes, t.created_at, t.updated_at,
            ba.name, tba.name, c.name, c.color, c.icon, cc.name, cc.color,
            COUNT(*) OVER() AS total_count
     FROM public.transactions t
     LEFT JOIN public.bank_accounts ba  ON ba.id  = t.account_id
     LEFT JOIN public.bank_accounts tba ON tba.id = t.to_account_id
     LEFT JOIN public.categories c      ON c.id   = t.category_id
     LEFT JOIN public.credit_cards cc   ON cc.id  = t.card_id
     WHERE t.user_id = auth.uid()
       AND ($1 IS NULL OR t.payment_date >= $1)
       AND ($2 IS NULL OR t.payment_date <= $2)
       AND ($3 IS NULL OR t.type = $3)
       AND ($4 IS NULL OR t.is_paid = $4)
       AND ($5 IS NULL OR t.account_id = $5)
       AND ($6 IS NULL OR t.card_id = $6)
       AND ($7 IS NULL OR t.category_id = $7)
       AND ($8 IS NULL OR t.payment_method = $8)
       AND ($9 IS NULL OR t.description ILIKE ''%%'' || $9 || ''%%'')
       AND (NOT $10 OR t.card_id IS NULL)
       AND (NOT $11 OR t.card_id IS NOT NULL)
       AND (NOT $12 OR t.installment_group_id IS NOT NULL)
     ORDER BY %I %s
     LIMIT $13 OFFSET $14',
    v_sort, CASE WHEN p_sort_asc THEN 'ASC' ELSE 'DESC' END
  ) USING p_start_date, p_end_date, p_type, p_is_paid, p_account_id,
          p_card_id, p_category_id, p_payment_method, p_search,
          p_hide_credit_cards, p_only_credit_cards, p_only_installments,
          v_limit, p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_transactions_summaries(
  p_start_date        date    DEFAULT NULL,
  p_end_date          date    DEFAULT NULL,
  p_type              text    DEFAULT NULL,
  p_is_paid           boolean DEFAULT NULL,
  p_account_id        uuid    DEFAULT NULL,
  p_card_id           uuid    DEFAULT NULL,
  p_category_id       uuid    DEFAULT NULL,
  p_payment_method    text    DEFAULT NULL,
  p_search            text    DEFAULT NULL,
  p_hide_credit_cards boolean DEFAULT false,
  p_only_credit_cards boolean DEFAULT false,
  p_only_installments boolean DEFAULT false
)
RETURNS TABLE (income numeric, expense numeric, pending numeric)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
    COALESCE(SUM(CASE WHEN t.type IN ('expense','transfer')
                       AND (NOT p_only_credit_cards OR t.card_id IS NOT NULL)
                       AND (NOT p_hide_credit_cards OR t.card_id IS NULL)
                      THEN t.amount ELSE 0 END), 0) AS expense,
    COALESCE(SUM(CASE WHEN NOT t.is_paid THEN t.amount ELSE 0 END), 0) AS pending
  FROM public.transactions t
  WHERE t.user_id = auth.uid()
    AND (p_start_date        IS NULL OR t.payment_date   >= p_start_date)
    AND (p_end_date          IS NULL OR t.payment_date   <= p_end_date)
    AND (p_type              IS NULL OR t.type            = p_type)
    AND (p_is_paid           IS NULL OR t.is_paid         = p_is_paid)
    AND (p_account_id        IS NULL OR t.account_id      = p_account_id)
    AND (p_card_id           IS NULL OR t.card_id         = p_card_id)
    AND (p_category_id       IS NULL OR t.category_id     = p_category_id)
    AND (p_payment_method    IS NULL OR t.payment_method  = p_payment_method)
    AND (p_search            IS NULL OR t.description ILIKE '%' || p_search || '%')
    AND (NOT p_hide_credit_cards OR t.card_id IS NULL)
    AND (NOT p_only_credit_cards OR t.card_id IS NOT NULL)
    AND (NOT p_only_installments OR t.installment_group_id IS NOT NULL);
$$;

-- ---------------------------------------------------------------------------
-- TRANSACTIONS — mutação
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_transaction(p_id uuid, p_updates jsonb)
RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_row public.transactions;
  v_allowed text[] := ARRAY[
    'type','amount','payment_date','purchase_date','description','is_paid','is_fixed',
    'account_id','to_account_id','category_id','card_id','invoice_id',
    'installment_number','total_installments','installment_group_id',
    'recurring_group_id','payment_method','notes'
  ];
  v_key text;
BEGIN
  FOR v_key IN SELECT jsonb_object_keys(p_updates) LOOP
    IF NOT (v_key = ANY(v_allowed)) THEN
      RAISE EXCEPTION 'Field not allowed: %', v_key;
    END IF;
  END LOOP;

  UPDATE public.transactions t
  SET
    type                 = COALESCE((p_updates->>'type'),                 t.type::text)::text,
    amount               = COALESCE((p_updates->>'amount')::numeric,      t.amount),
    payment_date         = COALESCE((p_updates->>'payment_date')::date,   t.payment_date),
    purchase_date        = COALESCE((p_updates->>'purchase_date')::date,  t.purchase_date),
    description          = COALESCE((p_updates->>'description'),          t.description),
    is_paid              = COALESCE((p_updates->>'is_paid')::boolean,     t.is_paid),
    is_fixed             = COALESCE((p_updates->>'is_fixed')::boolean,    t.is_fixed),
    account_id           = COALESCE((p_updates->>'account_id')::uuid,     t.account_id),
    to_account_id        = COALESCE((p_updates->>'to_account_id')::uuid,  t.to_account_id),
    category_id          = COALESCE((p_updates->>'category_id')::uuid,    t.category_id),
    card_id              = COALESCE((p_updates->>'card_id')::uuid,        t.card_id),
    invoice_id           = COALESCE((p_updates->>'invoice_id')::uuid,     t.invoice_id),
    payment_method       = COALESCE((p_updates->>'payment_method'),       t.payment_method),
    notes                = COALESCE((p_updates->>'notes'),                t.notes),
    updated_at           = now()
  WHERE t.id = p_id AND t.user_id = auth.uid()
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_transaction(p_id uuid)
RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.transactions;
BEGIN
  DELETE FROM public.transactions
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_transactions(p_rows jsonb)
RETURNS SETOF public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_row  jsonb;
  v_result public.transactions;
BEGIN
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    INSERT INTO public.transactions (
      user_id, type, amount, payment_date, purchase_date, description,
      is_paid, is_fixed, account_id, to_account_id, category_id, card_id,
      invoice_id, installment_number, total_installments, installment_group_id,
      recurring_group_id, payment_method, notes
    ) VALUES (
      auth.uid(),
      v_row->>'type', (v_row->>'amount')::numeric,
      (v_row->>'payment_date')::date, (v_row->>'purchase_date')::date,
      v_row->>'description', (v_row->>'is_paid')::boolean, (v_row->>'is_fixed')::boolean,
      (v_row->>'account_id')::uuid, (v_row->>'to_account_id')::uuid,
      (v_row->>'category_id')::uuid, (v_row->>'card_id')::uuid,
      (v_row->>'invoice_id')::uuid,
      (v_row->>'installment_number')::integer, (v_row->>'total_installments')::integer,
      (v_row->>'installment_group_id')::uuid, (v_row->>'recurring_group_id')::uuid,
      v_row->>'payment_method', v_row->>'notes'
    ) RETURNING * INTO v_result;
    RETURN NEXT v_result;
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- SALARY SETTINGS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_salary_history()
RETURNS SETOF public.settings_salary
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT * FROM public.settings_salary
  WHERE user_id = auth.uid()
  ORDER BY date_start DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_salary_current()
RETURNS public.settings_salary
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_row public.settings_salary;
  v_today date := CURRENT_DATE;
BEGIN
  SELECT * INTO v_row FROM public.settings_salary
  WHERE user_id = auth.uid()
    AND date_start <= v_today AND date_end >= v_today
  ORDER BY date_start DESC LIMIT 1;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_salary_open()
RETURNS public.settings_salary
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.settings_salary;
BEGIN
  SELECT * INTO v_row FROM public.settings_salary
  WHERE user_id = auth.uid() AND date_end = '9999-12-31'
  ORDER BY date_start DESC LIMIT 1;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_salary_rows_by_user()
RETURNS TABLE(date_start date, date_end date)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT date_start, date_end FROM public.settings_salary
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.create_salary_setting(
  p_date_start               date,
  p_date_end                 date,
  p_hourly_rate              numeric,
  p_base_salary              numeric,
  p_inss_discount_percentage numeric,
  p_admin_fee_percentage     numeric
)
RETURNS public.settings_salary
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.settings_salary;
BEGIN
  INSERT INTO public.settings_salary (
    user_id, date_start, date_end, hourly_rate, base_salary,
    inss_discount_percentage, admin_fee_percentage
  ) VALUES (
    auth.uid(), p_date_start, p_date_end, p_hourly_rate, p_base_salary,
    p_inss_discount_percentage, p_admin_fee_percentage
  ) RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_salary_setting(
  p_original_start           date,
  p_original_end             date,
  p_date_start               date,
  p_date_end                 date,
  p_hourly_rate              numeric,
  p_base_salary              numeric,
  p_inss_discount_percentage numeric,
  p_admin_fee_percentage     numeric
)
RETURNS public.settings_salary
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.settings_salary;
BEGIN
  UPDATE public.settings_salary SET
    date_start               = p_date_start,
    date_end                 = p_date_end,
    hourly_rate              = p_hourly_rate,
    base_salary              = p_base_salary,
    inss_discount_percentage = p_inss_discount_percentage,
    admin_fee_percentage     = p_admin_fee_percentage
  WHERE user_id = auth.uid()
    AND date_start = p_original_start AND date_end = p_original_end
  RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'Salary setting not found'; END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.close_salary_setting(
  p_date_start date, p_original_end date, p_new_end date
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.settings_salary SET date_end = p_new_end
  WHERE user_id = auth.uid()
    AND date_start = p_date_start AND date_end = p_original_end;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_salary_setting(
  p_date_start date, p_date_end date
)
RETURNS TABLE(date_start date, date_end date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  UPDATE public.settings_salary SET date_end = '9999-12-31'
  WHERE user_id = auth.uid()
    AND date_start = p_date_start AND date_end = p_date_end
  RETURNING date_start, date_end;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_salary_setting(
  p_date_start date, p_date_end date
)
RETURNS TABLE(date_start date, date_end date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  DELETE FROM public.settings_salary
  WHERE user_id = auth.uid()
    AND date_start = p_date_start AND date_end = p_date_end
  RETURNING date_start, date_end;
END;
$$;

-- ---------------------------------------------------------------------------
-- PROFILE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_profile(
  p_full_name  text    DEFAULT NULL,
  p_avatar_url text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (auth.uid(), p_full_name, p_avatar_url, now())
  ON CONFLICT (id) DO UPDATE SET
    full_name   = COALESCE(EXCLUDED.full_name,   profiles.full_name),
    avatar_url  = COALESCE(EXCLUDED.avatar_url,  profiles.avatar_url),
    updated_at  = now();
END;
$$;

-- ---------------------------------------------------------------------------
-- PLUGGY — commit de transações importadas
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.commit_pluggy_transactions(p_rows jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row jsonb;
BEGIN
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    INSERT INTO public.transactions (
      user_id, type, amount, payment_date, purchase_date, description,
      is_paid, is_fixed, account_id, card_id,
      installment_number, total_installments, installment_group_id, notes
    ) VALUES (
      auth.uid(),
      v_row->>'type', (v_row->>'amount')::numeric,
      (v_row->>'payment_date')::date, (v_row->>'payment_date')::date,
      v_row->>'description', (v_row->>'isPaid')::boolean, false,
      (v_row->>'accountId')::uuid, (v_row->>'cardId')::uuid,
      (v_row->>'installmentNumber')::integer,
      (v_row->>'totalInstallments')::integer,
      (v_row->>'installmentGroupId')::uuid,
      v_row->>'pluggyId'
    );
  END LOOP;
END;
$$;
