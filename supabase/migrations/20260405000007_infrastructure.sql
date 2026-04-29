-- =============================================================================
-- Infrastructure: system_config, card limits, cleanup, audit trail
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABELA system_config (TETO_INSS e futuras configuracoes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_config (
  key        TEXT PRIMARY KEY,
  value      NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed inicial
INSERT INTO public.system_config (key, value)
VALUES ('teto_inss', 1167.89)
ON CONFLICT DO NOTHING;

-- RLS: leitura para todos autenticados
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_config_select_authenticated" ON public.system_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: escrita apenas admin
CREATE POLICY "system_config_admin_write" ON public.system_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- 2. RPC: get_system_config(p_key TEXT) → NUMERIC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_system_config(p_key TEXT)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT value FROM public.system_config WHERE key = p_key;
$$;

-- ---------------------------------------------------------------------------
-- 3. VIEW: v_card_limits (available_limit calculado no DB)
--    Substitui calculo client-side de usage e available_limit
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_card_limits AS
SELECT
  cc.id AS card_id,
  cc.credit_limit,
  COALESCE(SUM(
    CASE WHEN inv.status != 'paid'
      THEN inv.total_amount - inv.paid_amount
      ELSE 0
    END
  ), 0) AS total_usage,
  cc.credit_limit - COALESCE(SUM(
    CASE WHEN inv.status != 'paid'
      THEN inv.total_amount - inv.paid_amount
      ELSE 0
    END
  ), 0) AS available_limit
FROM public.credit_cards cc
LEFT JOIN public.credit_card_invoices inv ON inv.card_id = cc.id
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.credit_limit;

-- ---------------------------------------------------------------------------
-- 4. DROP: tabela credit_card_statement_period_ranges (inutilizada)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public.credit_card_statement_period_ranges;

-- ---------------------------------------------------------------------------
-- 5. AUDIT TRAIL
--    Tabela generica com triggers para transacoes, faturas e cartoes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  changed_by  uuid,
  description text
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver audit log
CREATE POLICY "audit_log_admins_only" ON public.audit_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Funcao generica de audit (SECURITY DEFINER para acessar todos os dados)
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME::text,
    COALESCE(
      (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END),
      gen_random_uuid()::uuid
    ),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN NEW;
END;
$$;

-- Aplicar audit nas tabelas financeiras principais
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_credit_card_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_card_invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_credit_cards
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_cards
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

-- ---------------------------------------------------------------------------
-- 6. TABELA: site_branding (faltava na DDL exportada mas existe no projeto)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_branding (
  id         integer PRIMARY KEY,
  site_title text DEFAULT 'FINNANCE' NOT NULL,
  logo_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger singleton: impede mais de 1 linha
CREATE OR REPLACE FUNCTION public.enforce_site_branding_singleton()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.site_branding) THEN
    RAISE EXCEPTION 'site_branding ja possui um registro. Apenas uma linha e permitida.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_branding_singleton ON public.site_branding;
CREATE TRIGGER trg_site_branding_singleton
  BEFORE INSERT ON public.site_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_site_branding_singleton();

-- Policy: leitura publica, escrita apenas admin
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_branding_public_read" ON public.site_branding
  FOR SELECT USING (true);
CREATE POLICY "site_branding_admin_write" ON public.site_branding
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- 7. POLICY ADMIN: profiles SELECT ALL (para gestao de usuarios)
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ---------------------------------------------------------------------------
-- 8. CORRECAO DDL: credit_card_invoices.status — incluir 'overdue'
-- ---------------------------------------------------------------------------
ALTER TABLE public.credit_card_invoices DROP CONSTRAINT IF EXISTS credit_card_invoices_status_check;
ALTER TABLE public.credit_card_invoices
  ADD CONSTRAINT credit_card_invoices_status_check
  CHECK (status IN ('open', 'closed', 'partial', 'paid', 'overdue'));
