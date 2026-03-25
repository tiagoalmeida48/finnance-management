-- =============================================================================
-- DB Optimization Migration — finnance-management
-- Aborda todos os problemas identificados na análise (HIGH e MEDIUM priority)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- #1 HIGH: Normalizar enum `type` em transactions (PT → EN)
-- ---------------------------------------------------------------------------
UPDATE public.transactions SET type = 'income'  WHERE type = 'receita';
UPDATE public.transactions SET type = 'expense' WHERE type = 'despesa';

-- Drop constraint antiga (aceita PT/EN) e recria apenas com valores EN
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('income', 'expense', 'transfer'));

-- ---------------------------------------------------------------------------
-- #2 HIGH: Trigger para sincronizar current_balance automaticamente
-- Substitui a função syncBalance() chamada client-side, garantindo integridade
-- mesmo em manipulações diretas via Studio/CLI/migrations.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_account_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_delta   NUMERIC := 0;
  v_transfer_delta  NUMERIC := 0;
BEGIN
  -- Reverter efeito da linha antiga (em UPDATE ou DELETE)
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    IF OLD.is_paid = TRUE AND OLD.card_id IS NULL AND OLD.account_id IS NOT NULL THEN
      CASE OLD.type
        WHEN 'income'   THEN v_account_delta  := -OLD.amount; v_transfer_delta := 0;
        WHEN 'expense'  THEN v_account_delta  :=  OLD.amount; v_transfer_delta := 0;
        WHEN 'transfer' THEN v_account_delta  :=  OLD.amount; v_transfer_delta := -OLD.amount;
        ELSE NULL;
      END CASE;

      IF v_account_delta <> 0 THEN
        UPDATE public.bank_accounts
           SET current_balance = current_balance + v_account_delta
         WHERE id = OLD.account_id;
      END IF;
      IF v_transfer_delta <> 0 AND OLD.to_account_id IS NOT NULL THEN
        UPDATE public.bank_accounts
           SET current_balance = current_balance + v_transfer_delta
         WHERE id = OLD.to_account_id;
      END IF;
    END IF;
  END IF;

  -- Aplicar efeito da nova linha (em INSERT ou UPDATE)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_account_delta  := 0;
    v_transfer_delta := 0;

    IF NEW.is_paid = TRUE AND NEW.card_id IS NULL AND NEW.account_id IS NOT NULL THEN
      CASE NEW.type
        WHEN 'income'   THEN v_account_delta  :=  NEW.amount; v_transfer_delta := 0;
        WHEN 'expense'  THEN v_account_delta  := -NEW.amount; v_transfer_delta := 0;
        WHEN 'transfer' THEN v_account_delta  := -NEW.amount; v_transfer_delta := NEW.amount;
        ELSE NULL;
      END CASE;

      IF v_account_delta <> 0 THEN
        UPDATE public.bank_accounts
           SET current_balance = current_balance + v_account_delta
         WHERE id = NEW.account_id;
      END IF;
      IF v_transfer_delta <> 0 AND NEW.to_account_id IS NOT NULL THEN
        UPDATE public.bank_accounts
           SET current_balance = current_balance + v_transfer_delta
         WHERE id = NEW.to_account_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_account_balance ON public.transactions;
CREATE TRIGGER trg_sync_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_account_balance_on_transaction();

-- ---------------------------------------------------------------------------
-- #3 HIGH: is_paid NOT NULL DEFAULT FALSE
-- ---------------------------------------------------------------------------
UPDATE public.transactions SET is_paid = FALSE WHERE is_paid IS NULL;

ALTER TABLE public.transactions
  ALTER COLUMN is_paid SET NOT NULL,
  ALTER COLUMN is_paid SET DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- #4 HIGH: Índices faltando em transactions
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group_id
  ON public.transactions(installment_group_id)
  WHERE installment_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_recurring_group_id
  ON public.transactions(recurring_group_id)
  WHERE recurring_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id
  ON public.transactions(invoice_id)
  WHERE invoice_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_payment_date
  ON public.transactions(user_id, payment_date DESC);

-- ---------------------------------------------------------------------------
-- #6 HIGH: Remover closing_day/due_day de credit_cards (Opção A do plano)
-- Os valores são derivados do cycle com date_end = '9999-12-31'.
-- Colunas mantidas por ora como nullable (sem constraint) para compatibilidade
-- com código legado; remoção completa pode ser feita numa migration futura
-- após confirmar que nenhuma query as referencia diretamente.
-- ---------------------------------------------------------------------------
-- Nota: as colunas já existem e já possuem constraints individuais.
-- Não há ação necessária aqui além dos índices acima — o service já bloqueia
-- mutações diretas via cards.service.ts (lança erro em update de closing/due_day).

-- ---------------------------------------------------------------------------
-- #8 MEDIUM: UNIQUE (card_id, month_key) em credit_card_invoices
-- Previne faturas duplicadas por mês por cartão.
-- ---------------------------------------------------------------------------
ALTER TABLE public.credit_card_invoices
  DROP CONSTRAINT IF EXISTS uq_invoices_card_month;

ALTER TABLE public.credit_card_invoices
  ADD CONSTRAINT uq_invoices_card_month UNIQUE (card_id, month_key);

-- ---------------------------------------------------------------------------
-- #9 MEDIUM: Sincronizar status constraint de credit_card_invoices
-- DB atual: open|closed|paid|partial
-- TS atual: open|partial|paid|overdue
-- Decisão: adicionar 'overdue' ao DB; manter 'closed' para compatibilidade;
-- atualizar TypeScript para incluir 'closed'.
-- ---------------------------------------------------------------------------
ALTER TABLE public.credit_card_invoices DROP CONSTRAINT IF EXISTS credit_card_invoices_status_check;
ALTER TABLE public.credit_card_invoices
  ADD CONSTRAINT credit_card_invoices_status_check
  CHECK (status IN ('open', 'closed', 'partial', 'paid', 'overdue'));

-- ---------------------------------------------------------------------------
-- #11 MEDIUM: CHECK constraint em payment_method
-- ---------------------------------------------------------------------------
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_payment_method_check
  CHECK (
    payment_method IS NULL OR
    payment_method IN ('credit', 'debit', 'pix', 'cash', 'bill_payment', 'transfer', 'other')
  );

-- ---------------------------------------------------------------------------
-- Constraints de integridade adicionais (plano — seção "Manter transactions")
-- ---------------------------------------------------------------------------

-- to_account_id só faz sentido em transfers
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS chk_transfer_account;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_transfer_account
  CHECK (type = 'transfer' OR to_account_id IS NULL);

-- transações de cartão devem ter account_id
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS chk_card_has_account;
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_card_has_account
  CHECK (card_id IS NULL OR account_id IS NOT NULL);

-- ---------------------------------------------------------------------------
-- #7 MEDIUM: Tabela credit_card_statement_period_ranges
-- VERIFICAR antes de dropar:
--   SELECT COUNT(*) FROM public.credit_card_statement_period_ranges;
-- Se 0 → descomente o DROP abaixo e aplique numa migration subsequente.
-- ---------------------------------------------------------------------------
-- DROP TABLE IF EXISTS public.credit_card_statement_period_ranges;

-- ---------------------------------------------------------------------------
-- #5 HIGH: RPCs para agregações do dashboard (elimina SELECT * client-side)
-- ---------------------------------------------------------------------------

-- RPC: totais de income/expense para um período (usado em getStats)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_aggregated(
  p_start_date date DEFAULT NULL,
  p_end_date   date DEFAULT NULL
)
RETURNS TABLE (total_income numeric, total_expense numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)                                                      AS total_income,
    COALESCE(SUM(CASE WHEN (type = 'expense' OR type = 'transfer') AND card_id IS NULL THEN amount ELSE 0 END), 0) AS total_expense
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND (p_start_date IS NULL OR payment_date >= p_start_date)
    AND (p_end_date   IS NULL OR payment_date <= p_end_date);
$$;

-- RPC: agregação mensal para o gráfico (usado em getChartData)
CREATE OR REPLACE FUNCTION public.get_dashboard_chart_data(
  p_start_date date,
  p_end_date   date
)
RETURNS TABLE (month_key text, total_income numeric, total_expense numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    to_char(payment_date, 'YYYY-MM')                                                                                          AS month_key,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)                                                        AS total_income,
    COALESCE(SUM(CASE WHEN (type = 'expense' AND card_id IS NULL) OR type = 'transfer' THEN amount ELSE 0 END), 0) AS total_expense
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND payment_date >= p_start_date
    AND payment_date <= p_end_date
  GROUP BY month_key
  ORDER BY month_key;
$$;

-- RPC: distribuição por categoria (usado em getCategoryDistribution)
CREATE OR REPLACE FUNCTION public.get_category_distribution(
  p_start_date date DEFAULT NULL,
  p_end_date   date DEFAULT NULL
)
RETURNS TABLE (category_name text, total_amount numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(c.name, 'Geral') AS category_name,
    SUM(t.amount)             AS total_amount
  FROM public.transactions t
  LEFT JOIN public.categories c ON c.id = t.category_id
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND (p_start_date IS NULL OR t.payment_date >= p_start_date)
    AND (p_end_date   IS NULL OR t.payment_date <= p_end_date)
  GROUP BY c.name
  ORDER BY total_amount DESC;
$$;

-- ---------------------------------------------------------------------------
-- #10 MEDIUM: settings_salary — trigger para prevenir períodos sobrepostos
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_salary_period_no_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.settings_salary
    WHERE user_id = NEW.user_id
      -- em UPDATEs, excluir a própria linha via PK; em INSERTs, TG_OP <> 'UPDATE' então nada é excluído
      AND NOT (TG_OP = 'UPDATE'
               AND date_start = OLD.date_start
               AND date_end   = OLD.date_end)
      -- detectar sobreposição: [A,B] e [C,D] se sobrepõem se A <= D AND B >= C
      AND NEW.date_start <= date_end
      AND NEW.date_end   >= date_start
  ) THEN
    RAISE EXCEPTION 'A vigencia salarial informada sobrepoe um periodo ja existente.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_salary_no_overlap ON public.settings_salary;
CREATE TRIGGER trg_salary_no_overlap
  BEFORE INSERT OR UPDATE ON public.settings_salary
  FOR EACH ROW
  EXECUTE FUNCTION public.check_salary_period_no_overlap();

-- ---------------------------------------------------------------------------
-- #6 HIGH: Opção B — trigger que mantém credit_cards sincronizado com o
-- cycle aberto (date_end = '9999-12-31'), eliminando o drift de closing/due_day.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_card_closing_due_day()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sempre que um cycle com date_end = '9999-12-31' é inserido ou atualizado,
  -- propaga closing_day / due_day de volta para credit_cards.
  IF NEW.date_end = '9999-12-31' THEN
    UPDATE public.credit_cards
       SET closing_day = NEW.closing_day,
           due_day     = NEW.due_day,
           updated_at  = now()
     WHERE id = NEW.card_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_card_closing_due_day ON public.credit_card_statement_cycles;
CREATE TRIGGER trg_sync_card_closing_due_day
  AFTER INSERT OR UPDATE ON public.credit_card_statement_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_card_closing_due_day();

-- ---------------------------------------------------------------------------
-- #13 LOW: site_branding singleton — substituir CHECK (id = 1) por trigger
-- que impede mais de uma linha independente do valor de id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_site_branding_singleton()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.site_branding) THEN
    RAISE EXCEPTION 'site_branding já possui um registro. Apenas uma linha é permitida.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_branding_singleton ON public.site_branding;
CREATE TRIGGER trg_site_branding_singleton
  BEFORE INSERT ON public.site_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_site_branding_singleton();

-- Remover o constraint CHECK (id = 1) original (substituído pelo trigger acima)
-- O nome gerado pelo PostgreSQL para inline check constraints segue o padrão <table>_<column>_check
ALTER TABLE public.site_branding DROP CONSTRAINT IF EXISTS site_branding_id_check;
