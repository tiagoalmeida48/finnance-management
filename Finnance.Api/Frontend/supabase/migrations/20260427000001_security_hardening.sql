-- =============================================================================
-- Security Hardening
-- 1. get_system_config: exige usuario autenticado
-- 2. audit_log.changed_by: DEFAULT auth.uid()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. get_system_config — adiciona verificacao de autenticacao
--    Anteriormente SECURITY DEFINER sem checar auth.uid(), qualquer chamada
--    anonima podia ler qualquer chave de system_config.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_system_config(p_key TEXT)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT value FROM public.system_config
  WHERE key = p_key AND auth.uid() IS NOT NULL;
$$;

-- ---------------------------------------------------------------------------
-- 2. audit_log.changed_by — DEFAULT auth.uid()
--    Garante rastreabilidade mesmo quando o caller nao passa o campo.
-- ---------------------------------------------------------------------------
ALTER TABLE public.audit_log
  ALTER COLUMN changed_by SET DEFAULT auth.uid();
