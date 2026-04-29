-- Corrige cast varchar→text em get_transactions_paginated, get_transaction_by_id, get_card_by_id
-- bank_accounts.name/type/color/icon são varchar(255/50/7/50) mas as funções declaram text

CREATE OR REPLACE FUNCTION public.get_transaction_by_id(p_id uuid)
RETURNS TABLE(id uuid, user_id uuid, type text, amount numeric, payment_date date,
  purchase_date date, description text, is_paid boolean, is_fixed boolean,
  account_id uuid, to_account_id uuid, category_id uuid, card_id uuid,
  invoice_id uuid, installment_number integer, total_installments integer,
  installment_group_id uuid, recurring_group_id uuid, payment_method text,
  notes text, created_at timestamptz, updated_at timestamptz,
  bank_account_name text, to_bank_account_name text,
  category_name text, category_color text, category_icon text,
  credit_card_name text, credit_card_color text)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT t.id, t.user_id, t.type, t.amount, t.payment_date, t.purchase_date,
         t.description, t.is_paid, t.is_fixed, t.account_id, t.to_account_id,
         t.category_id, t.card_id, t.invoice_id, t.installment_number,
         t.total_installments, t.installment_group_id, t.recurring_group_id,
         t.payment_method, t.notes, t.created_at, t.updated_at,
         ba.name::text, tba.name::text, c.name::text, c.color::text, c.icon::text,
         cc.name::text, cc.color::text
  FROM public.transactions t
  LEFT JOIN public.bank_accounts ba  ON ba.id  = t.account_id
  LEFT JOIN public.bank_accounts tba ON tba.id = t.to_account_id
  LEFT JOIN public.categories c      ON c.id   = t.category_id
  LEFT JOIN public.credit_cards cc   ON cc.id  = t.card_id
  WHERE t.id = p_id AND t.user_id = auth.uid();
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
RETURNS TABLE(id uuid, user_id uuid, type text, amount numeric, payment_date date,
  purchase_date date, description text, is_paid boolean, is_fixed boolean,
  account_id uuid, to_account_id uuid, category_id uuid, card_id uuid,
  invoice_id uuid, installment_number integer, total_installments integer,
  installment_group_id uuid, recurring_group_id uuid, payment_method text,
  notes text, created_at timestamptz, updated_at timestamptz,
  bank_account_name text, to_bank_account_name text,
  category_name text, category_color text, category_icon text,
  credit_card_name text, credit_card_color text, total_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_sort  text;
  v_limit integer := LEAST(GREATEST(p_limit, 1), 10000);
BEGIN
  v_sort := CASE WHEN p_sort_field IN (
    'payment_date','purchase_date','amount','is_paid','payment_method','description','type'
  ) THEN p_sort_field ELSE 'payment_date' END;

  RETURN QUERY EXECUTE format(
    'SELECT t.id, t.user_id, t.type::text, t.amount, t.payment_date, t.purchase_date,
            t.description::text, t.is_paid, t.is_fixed, t.account_id, t.to_account_id,
            t.category_id, t.card_id, t.invoice_id, t.installment_number,
            t.total_installments, t.installment_group_id, t.recurring_group_id,
            t.payment_method::text, t.notes::text, t.created_at, t.updated_at,
            ba.name::text, tba.name::text, c.name::text, c.color::text, c.icon::text,
            cc.name::text, cc.color::text,
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

CREATE OR REPLACE FUNCTION public.get_card_by_id(p_id uuid)
RETURNS TABLE(id uuid, user_id uuid, bank_account_id uuid, name text, color text,
  credit_limit numeric, is_active boolean, deleted_at timestamptz,
  created_at timestamptz, updated_at timestamptz, notes text, bank_account_name text)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT cc.id, cc.user_id, cc.bank_account_id, cc.name::text, cc.color::text,
         cc.credit_limit, cc.is_active, cc.deleted_at, cc.created_at,
         cc.updated_at, cc.notes::text, ba.name::text
  FROM public.credit_cards cc
  LEFT JOIN public.bank_accounts ba ON ba.id = cc.bank_account_id
  WHERE cc.id = p_id AND cc.user_id = auth.uid();
$$;
