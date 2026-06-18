-- =============================================================================
-- RPC Group Operations — finnance-management
--
-- Elimina N updates sequenciais no frontend para operações de grupo:
--   1. batch_change_day          — troca o dia de vencimento de N transações atomicamente
--   2. update_transaction_group  — atualiza campos de um grupo (parcelado/recorrente)
--   3. insert_installment_between — insere parcela entre existentes (shift + create)
--   4. reprocess_invoices_for_card — reprocessamento completo de invoices de um cartão
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. batch_change_day
--    Troca o dia (mantendo mês/ano) de payment_date e purchase_date para
--    cada transação da lista. O trigger trg_link_to_invoice re-linka
--    automaticamente quando payment_date/purchase_date mudam.
--    Após o update, recalcula as invoices que ficaram sem transações
--    (as antigas, se o link mudou).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.batch_change_day(
  p_ids uuid[],
  p_day int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clamped_day    int;
  v_old_inv_ids    uuid[];
  rec              record;
  v_new_payment    date;
  v_new_purchase   date;
  v_last_day       int;
BEGIN
  -- Clamp 1..31
  v_clamped_day := GREATEST(1, LEAST(31, p_day));

  -- Captura invoice_ids ANTES do update para recalcular depois
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_inv_ids
  FROM public.transactions
  WHERE id = ANY(p_ids)
    AND invoice_id IS NOT NULL
    AND user_id = auth.uid();

  -- Atualiza cada transação trocando o dia, preservando mês e ano
  FOR rec IN
    SELECT id, payment_date, purchase_date
    FROM public.transactions
    WHERE id = ANY(p_ids)
      AND user_id = auth.uid()
  LOOP
    -- payment_date
    IF rec.payment_date IS NOT NULL THEN
      v_last_day := EXTRACT(DAY FROM
        date_trunc('month', rec.payment_date) + '1 month'::interval - '1 day'::interval
      )::int;
      v_new_payment := (
        date_trunc('month', rec.payment_date)
        + ((LEAST(v_clamped_day, v_last_day) - 1) || ' days')::interval
      )::date;
    ELSE
      v_new_payment := NULL;
    END IF;

    -- purchase_date
    IF rec.purchase_date IS NOT NULL THEN
      v_last_day := EXTRACT(DAY FROM
        date_trunc('month', rec.purchase_date) + '1 month'::interval - '1 day'::interval
      )::int;
      v_new_purchase := (
        date_trunc('month', rec.purchase_date)
        + ((LEAST(v_clamped_day, v_last_day) - 1) || ' days')::interval
      )::date;
    ELSE
      v_new_purchase := NULL;
    END IF;

    -- Só atualiza se algo mudou (evita triggers desnecessários)
    IF v_new_payment IS DISTINCT FROM rec.payment_date
       OR v_new_purchase IS DISTINCT FROM rec.purchase_date
    THEN
      UPDATE public.transactions
      SET payment_date  = COALESCE(v_new_payment, payment_date),
          purchase_date = v_new_purchase,
          updated_at    = now()
      WHERE id = rec.id;
      -- O trigger trg_link_to_invoice re-linka automaticamente aqui
    END IF;
  END LOOP;

  -- Recalcula invoices antigas (podem ter ficado vazias ou com totais errados)
  IF v_old_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_old_inv_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_old_inv_ids[i]);
    END LOOP;
  END IF;

  -- Recalcula invoices novas (atribuídas pelo trigger)
  PERFORM public.recalculate_invoice_total(DISTINCT t.invoice_id)
  FROM public.transactions t
  WHERE t.id = ANY(p_ids)
    AND t.invoice_id IS NOT NULL
    AND (v_old_inv_ids IS NULL OR NOT (t.invoice_id = ANY(v_old_inv_ids)));
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. update_transaction_group
--    Atualiza campos compartilhados de todas as transações de um grupo.
--    Para datas, preserva mês/ano de cada transação e troca apenas o dia.
--    Para descrição parcelada, reconstrói o sufixo (01/12) automaticamente.
--    Retorna os IDs das transações atualizadas.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_transaction_group(
  p_group_id  uuid,
  p_type      text,    -- 'installment' | 'recurring'
  p_updates   jsonb
)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_col             text;
  v_payment_day     int;
  v_purchase_day    int;
  v_base_desc       text;
  v_has_payment     boolean;
  v_has_purchase    boolean;
  v_has_desc        boolean;
  v_old_inv_ids     uuid[];
  v_updated_ids     uuid[];
  rec               record;
  v_new_payment     date;
  v_new_purchase    date;
  v_new_desc        text;
  v_last_day        int;
  v_set_parts       text[];
  v_set_clause      text;
  v_shared_updates  jsonb;
  k                 text;
  v                 text;
  v_new_inv_ids     uuid[];
BEGIN
  IF p_type NOT IN ('installment', 'recurring') THEN
    RAISE EXCEPTION 'p_type must be installment or recurring';
  END IF;

  v_col := CASE p_type WHEN 'installment' THEN 'installment_group_id' ELSE 'recurring_group_id' END;

  -- Captura invoice_ids antes do update
  EXECUTE format(
    'SELECT ARRAY_AGG(DISTINCT invoice_id) FROM public.transactions
     WHERE %I = $1 AND invoice_id IS NOT NULL AND user_id = $2',
    v_col
  ) USING p_group_id, auth.uid() INTO v_old_inv_ids;

  -- Extrair flags de quais campos estão presentes
  v_has_payment  := p_updates ? 'payment_date';
  v_has_purchase := p_updates ? 'purchase_date';
  v_has_desc     := p_updates ? 'description';

  v_payment_day  := CASE WHEN v_has_payment AND p_updates->>'payment_date' IS NOT NULL
                         THEN EXTRACT(DAY FROM (p_updates->>'payment_date')::date)::int
                         ELSE NULL END;
  v_purchase_day := CASE WHEN v_has_purchase AND p_updates->>'purchase_date' IS NOT NULL
                         THEN EXTRACT(DAY FROM (p_updates->>'purchase_date')::date)::int
                         ELSE NULL END;

  -- base description (strip suffix "01/12")
  v_base_desc := CASE WHEN v_has_desc
                      THEN regexp_replace(
                             p_updates->>'description',
                             '\s*\(\d+/\d+\)\s*$', '', 'g'
                           )
                      ELSE NULL END;

  -- Campos compartilhados que não dependem de por-transação
  -- (excluímos payment_date, purchase_date, description — processados por-transação)
  v_updated_ids := ARRAY[]::uuid[];

  FOR rec IN EXECUTE format(
    'SELECT id, payment_date, purchase_date, description,
            installment_number, total_installments
     FROM public.transactions
     WHERE %I = $1 AND user_id = $2
     ORDER BY %s',
    v_col,
    CASE p_type WHEN 'installment' THEN 'installment_number ASC NULLS LAST'
                ELSE 'payment_date ASC NULLS LAST' END
  ) USING p_group_id, auth.uid()
  LOOP
    v_set_parts := ARRAY[]::text[];

    -- payment_date: troca o dia preservando mês/ano
    IF v_has_payment AND rec.payment_date IS NOT NULL AND v_payment_day IS NOT NULL THEN
      v_last_day := EXTRACT(DAY FROM
        date_trunc('month', rec.payment_date) + '1 month'::interval - '1 day'::interval
      )::int;
      v_new_payment := (
        date_trunc('month', rec.payment_date)
        + ((LEAST(v_payment_day, v_last_day) - 1) || ' days')::interval
      )::date;
      IF v_new_payment IS DISTINCT FROM rec.payment_date THEN
        v_set_parts := v_set_parts || format('payment_date = %L', v_new_payment);
      END IF;
    END IF;

    -- purchase_date: null → seta null; dia → troca dia
    IF v_has_purchase THEN
      IF p_updates->>'purchase_date' IS NULL THEN
        IF rec.purchase_date IS NOT NULL THEN
          v_set_parts := v_set_parts || 'purchase_date = NULL';
        END IF;
      ELSIF rec.purchase_date IS NOT NULL AND v_purchase_day IS NOT NULL THEN
        v_last_day := EXTRACT(DAY FROM
          date_trunc('month', rec.purchase_date) + '1 month'::interval - '1 day'::interval
        )::int;
        v_new_purchase := (
          date_trunc('month', rec.purchase_date)
          + ((LEAST(v_purchase_day, v_last_day) - 1) || ' days')::interval
        )::date;
        IF v_new_purchase IS DISTINCT FROM rec.purchase_date THEN
          v_set_parts := v_set_parts || format('purchase_date = %L', v_new_purchase);
        END IF;
      END IF;
    END IF;

    -- description
    IF v_has_desc THEN
      IF p_type = 'installment' THEN
        v_new_desc := COALESCE(v_base_desc, regexp_replace(
          rec.description, '\s*\(\d+/\d+\)\s*$', '', 'g'
        )) || ' (' ||
          lpad((rec.installment_number)::text, 2, '0') || '/' ||
          lpad((rec.total_installments)::text, 2, '0') || ')';
      ELSE
        v_new_desc := p_updates->>'description';
      END IF;
      IF v_new_desc IS DISTINCT FROM rec.description THEN
        v_set_parts := v_set_parts || format('description = %L', v_new_desc);
      END IF;
    END IF;

    -- Campos extras (amount, category_id, etc.) que não dependem de por-transação
    FOR k, v IN SELECT * FROM jsonb_each_text(
      p_updates - 'payment_date' - 'purchase_date' - 'description'
    ) LOOP
      v_set_parts := v_set_parts || format('%I = %L', k, v);
    END LOOP;

    IF array_length(v_set_parts, 1) > 0 THEN
      v_set_clause := array_to_string(v_set_parts, ', ');
      EXECUTE format(
        'UPDATE public.transactions SET %s, updated_at = now() WHERE id = %L',
        v_set_clause, rec.id
      );
      v_updated_ids := v_updated_ids || rec.id;
    END IF;
  END LOOP;

  -- Recalcula todas as invoices afetadas (antigas + novas atribuídas pelo trigger)
  IF v_old_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_old_inv_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_old_inv_ids[i]);
    END LOOP;
  END IF;

  -- Invoices novas (trigger pode ter re-linkado para meses diferentes)
  EXECUTE format(
    'SELECT ARRAY_AGG(DISTINCT invoice_id) FROM public.transactions
     WHERE %I = $1 AND invoice_id IS NOT NULL AND user_id = $2',
    v_col
  ) USING p_group_id, auth.uid() INTO v_new_inv_ids;

  IF v_new_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_new_inv_ids, 1) LOOP
      IF v_old_inv_ids IS NULL OR NOT (v_new_inv_ids[i] = ANY(v_old_inv_ids)) THEN
        PERFORM public.recalculate_invoice_total(v_new_inv_ids[i]);
      END IF;
    END LOOP;
  END IF;

  RETURN v_updated_ids;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. insert_installment_between
--    Dado o ID de uma transação parcelada, insere uma nova parcela logo após
--    ela: incrementa o número/total de todas as parcelas >= posição de inserção
--    e cria a nova com os dados da transação selecionada.
--    Tudo em uma única transação atômica.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.insert_installment_between(p_transaction_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id              uuid := auth.uid();
  v_selected             record;
  v_group_id             uuid;
  v_current_total        int;
  v_insertion_number     int;
  v_new_total            int;
  v_base_desc            text;
  v_next_rec             record;
  v_inserted_payment     date;
  v_inserted_purchase    date;
  v_new_tx_id            uuid;
  rec                    record;
  v_old_inv_ids          uuid[];
  v_new_inv_ids          uuid[];
BEGIN
  -- Carrega a transação selecionada
  SELECT id, installment_group_id, installment_number, total_installments,
         payment_date, purchase_date, description,
         type, amount, account_id, card_id, category_id, payment_method, notes,
         is_fixed
  INTO v_selected
  FROM public.transactions
  WHERE id = p_transaction_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or not owned by current user';
  END IF;

  v_group_id := v_selected.installment_group_id;
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Selected transaction does not belong to an installment group';
  END IF;

  -- Total atual do grupo
  SELECT MAX(GREATEST(COALESCE(installment_number, 1), COALESCE(total_installments, 1)))
  INTO v_current_total
  FROM public.transactions
  WHERE installment_group_id = v_group_id AND user_id = v_user_id;

  v_current_total    := COALESCE(v_current_total, 1);
  v_insertion_number := LEAST(COALESCE(v_selected.installment_number, 1) + 1, v_current_total + 1);
  v_new_total        := v_current_total + 1;
  v_base_desc        := COALESCE(
    regexp_replace(v_selected.description, '\s*\(\d+/\d+\)\s*$', '', 'g'),
    'Parcela'
  );

  -- Captura invoice_ids antes das mudanças
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_inv_ids
  FROM public.transactions
  WHERE installment_group_id = v_group_id AND invoice_id IS NOT NULL AND user_id = v_user_id;

  -- Busca a parcela que está na posição de inserção (se existir) para usar como âncora de data
  SELECT payment_date, purchase_date INTO v_next_rec
  FROM public.transactions
  WHERE installment_group_id = v_group_id
    AND installment_number = v_insertion_number
    AND user_id = v_user_id;

  -- Define datas da nova parcela
  IF v_next_rec.payment_date IS NOT NULL THEN
    v_inserted_payment := v_next_rec.payment_date;
  ELSE
    v_inserted_payment := (v_selected.payment_date + '1 month'::interval)::date;
  END IF;

  IF v_next_rec.purchase_date IS NOT NULL THEN
    v_inserted_purchase := v_next_rec.purchase_date;
  ELSIF v_selected.purchase_date IS NOT NULL THEN
    v_inserted_purchase := (v_selected.purchase_date + '1 month'::interval)::date;
  ELSE
    v_inserted_purchase := NULL;
  END IF;

  -- Shift: incrementa número e datas das parcelas >= posição de inserção (ordem decrescente)
  FOR rec IN
    SELECT id, installment_number, payment_date, purchase_date
    FROM public.transactions
    WHERE installment_group_id = v_group_id
      AND installment_number >= v_insertion_number
      AND user_id = v_user_id
    ORDER BY installment_number DESC
  LOOP
    UPDATE public.transactions
    SET installment_number  = rec.installment_number + 1,
        total_installments  = v_new_total,
        description         = v_base_desc || ' (' ||
                              lpad((rec.installment_number + 1)::text, 2, '0') || '/' ||
                              lpad(v_new_total::text, 2, '0') || ')',
        payment_date        = (rec.payment_date + '1 month'::interval)::date,
        purchase_date       = CASE WHEN rec.purchase_date IS NOT NULL
                                   THEN (rec.purchase_date + '1 month'::interval)::date
                                   ELSE NULL END,
        updated_at          = now()
    WHERE id = rec.id;
  END LOOP;

  -- Atualiza total das parcelas antes da posição de inserção
  UPDATE public.transactions
  SET total_installments = v_new_total,
      description        = v_base_desc || ' (' ||
                           lpad(installment_number::text, 2, '0') || '/' ||
                           lpad(v_new_total::text, 2, '0') || ')',
      updated_at         = now()
  WHERE installment_group_id = v_group_id
    AND installment_number < v_insertion_number
    AND user_id = v_user_id;

  -- Insere a nova parcela
  INSERT INTO public.transactions (
    user_id, type, amount, payment_date, purchase_date, description,
    account_id, card_id, category_id, payment_method, notes,
    is_paid, is_fixed, total_installments, installment_number, installment_group_id,
    recurring_group_id
  ) VALUES (
    v_user_id,
    v_selected.type,
    v_selected.amount,
    v_inserted_payment,
    v_inserted_purchase,
    v_base_desc || ' (' ||
      lpad(v_insertion_number::text, 2, '0') || '/' ||
      lpad(v_new_total::text, 2, '0') || ')',
    v_selected.account_id,
    v_selected.card_id,
    v_selected.category_id,
    v_selected.payment_method,
    v_selected.notes,
    false,
    false,
    v_new_total,
    v_insertion_number,
    v_group_id,
    NULL
  ) RETURNING id INTO v_new_tx_id;

  -- Recalcula invoices antigas
  IF v_old_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_old_inv_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_old_inv_ids[i]);
    END LOOP;
  END IF;

  -- Recalcula invoices novas (trigger pode ter criado/linkado diferentes)
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_new_inv_ids
  FROM public.transactions
  WHERE installment_group_id = v_group_id AND invoice_id IS NOT NULL AND user_id = v_user_id;

  IF v_new_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_new_inv_ids, 1) LOOP
      IF v_old_inv_ids IS NULL OR NOT (v_new_inv_ids[i] = ANY(v_old_inv_ids)) THEN
        PERFORM public.recalculate_invoice_total(v_new_inv_ids[i]);
      END IF;
    END LOOP;
  END IF;

  RETURN v_new_tx_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. reprocess_invoices_for_card
--    Reprocessa completamente as invoices de um cartão a partir de uma data:
--    - Usa o mesmo algoritmo de shift do trigger trg_link_to_invoice
--    - Atualiza invoice_id de todas as transações do cartão >= fromDate
--    - Cria invoices faltantes
--    - Remove invoices vazias
--    - Recalcula totais
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reprocess_invoices_for_card(
  p_card_id   uuid,
  p_from_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id      uuid := auth.uid();
  v_closing_day  int;
  v_due_day      int;
  rec            record;
  v_anchor       date;
  v_day          int;
  v_shift        int;
  v_month_key    text;
  v_invoice_id   uuid;
  v_closing_date date;
  v_due_date     date;
  v_last_day     int;
  v_inv_ids      uuid[];
BEGIN
  -- Verifica ownership do cartão
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_cards
    WHERE id = p_card_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Card not found or not owned by current user';
  END IF;

  -- Ciclo aberto
  SELECT closing_day, due_day
  INTO v_closing_day, v_due_day
  FROM public.credit_card_statement_cycles
  WHERE card_id = p_card_id AND date_end = '9999-12-31'::date
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No open statement cycle found for card %', p_card_id;
  END IF;

  -- Para cada transação do cartão >= from_date, recalcula o invoice_id correto
  FOR rec IN
    SELECT id, user_id, purchase_date, payment_date, invoice_id
    FROM public.transactions
    WHERE card_id = p_card_id
      AND user_id = v_user_id
      AND (
        (payment_date  IS NOT NULL AND payment_date  >= p_from_date) OR
        (purchase_date IS NOT NULL AND purchase_date >= p_from_date)
      )
  LOOP
    v_anchor := COALESCE(rec.purchase_date, rec.payment_date);
    IF v_anchor IS NULL THEN CONTINUE; END IF;

    -- Mesmo algoritmo de shift do trigger
    v_day := EXTRACT(DAY FROM v_anchor)::int;
    v_shift := 0;
    IF v_day > v_closing_day THEN v_shift := v_shift + 1; END IF;
    IF v_closing_day >= v_due_day THEN v_shift := v_shift + 1; END IF;

    v_month_key := to_char(v_anchor + (v_shift || ' months')::interval, 'YYYY-MM');

    -- closing_date
    v_closing_date := (
      date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
      + ((v_closing_day - 1) || ' days')::interval
    )::date;

    -- due_date
    v_last_day := EXTRACT(DAY FROM (
      date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
      + '1 month'::interval - '1 day'::interval
    ))::int;
    v_due_date := (
      date_trunc('month', to_date(v_month_key || '-01', 'YYYY-MM-DD'))
      + ((LEAST(v_due_day, v_last_day) - 1) || ' days')::interval
    )::date;

    -- Busca ou cria invoice
    SELECT id INTO v_invoice_id
    FROM public.credit_card_invoices
    WHERE card_id = p_card_id AND month_key = v_month_key
    LIMIT 1;

    IF v_invoice_id IS NULL THEN
      INSERT INTO public.credit_card_invoices (user_id, card_id, month_key, closing_date, due_date)
      VALUES (v_user_id, p_card_id, v_month_key, v_closing_date, v_due_date)
      RETURNING id INTO v_invoice_id;
    END IF;

    -- Atualiza invoice_id diretamente (sem disparar trigger — só muda invoice_id)
    IF rec.invoice_id IS DISTINCT FROM v_invoice_id THEN
      UPDATE public.transactions
      SET invoice_id = v_invoice_id, updated_at = now()
      WHERE id = rec.id;
    END IF;
  END LOOP;

  -- Recalcula todos os totais das invoices deste cartão
  SELECT ARRAY_AGG(DISTINCT id) INTO v_inv_ids
  FROM public.credit_card_invoices
  WHERE card_id = p_card_id;

  IF v_inv_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_inv_ids, 1) LOOP
      PERFORM public.recalculate_invoice_total(v_inv_ids[i]);
    END LOOP;
  END IF;

  -- Remove invoices vazias
  DELETE FROM public.credit_card_invoices
  WHERE card_id = p_card_id
    AND id NOT IN (
      SELECT DISTINCT invoice_id
      FROM public.transactions
      WHERE card_id = p_card_id AND invoice_id IS NOT NULL
    );
END;
$$;
