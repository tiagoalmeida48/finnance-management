-- ============================================================================
-- EXPORT SUPABASE -> JSON  (rodar no Supabase Dashboard > SQL Editor)
-- ----------------------------------------------------------------------------
-- Gera UMA linha / UMA coluna (data) com todas as tabelas de negocio em JSON.
-- Inclui o email vindo de auth.users (o SQL Editor roda como postgres e enxerga
-- o schema auth). to_jsonb(t) captura TODAS as colunas, mesmo as que eu nao
-- tenha enumerado, entao o dump fica completo independentemente de drift.
--
-- COMO USAR:
--   1) SQL Editor > New query > cole este arquivo inteiro > Run.
--   2) No resultado, abra a celula "data" e copie o conteudo (botao copiar),
--      OU use "Download CSV" no painel de resultados.
--   3) Salve como:  docs/sql/supabase_dump.json   (cole o JSON puro)
--      (se baixou CSV, salve como docs/sql/supabase_dump.csv que eu trato o wrapper)
--   4) Me avise. Se o resultado parecer truncado, me diga que eu divido por tabela.
-- ============================================================================

SELECT jsonb_build_object(
  'users', (
    SELECT COALESCE(jsonb_agg(to_jsonb(u)), '[]'::jsonb)
    FROM (
      SELECT p.id, au.email, au.encrypted_password, p.full_name, p.avatar_url,
             p.currency, p.locale, p.is_admin, p.created_at, p.updated_at
      FROM public.profiles p
      LEFT JOIN auth.users au ON au.id = p.id
    ) u
  ),
  'bank_accounts',                       (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.bank_accounts t),
  'categories',                          (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.categories t),
  'credit_cards',                        (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.credit_cards t),
  'credit_card_invoices',                (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.credit_card_invoices t),
  'credit_card_statement_cycles',        (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.credit_card_statement_cycles t),
  'credit_card_statement_period_ranges', (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.credit_card_statement_period_ranges t),
  'transactions',                        (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.transactions t),
  'settings_salary',                     (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.settings_salary t),
  'system_config',                       (SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM public.system_config t)
) AS data;

-- NOTA (2026-06-25): NÃO incluir audit_log no export. No primeiro export ele
-- carregou snapshots JSONB enormes e estourou o limite (~100KB) do SQL Editor,
-- truncando o JSON antes das tabelas de negócio. Se mesmo sem audit_log o
-- resultado truncar, exporte por tabela: rode "select * from <tabela>" e use
-- "Download CSV" para bank_accounts, categories, credit_cards,
-- credit_card_invoices, credit_card_statement_cycles, transactions,
-- settings_salary — salvando cada um em docs/sql/<tabela>.csv.
