-- delete_account: is_active = false obrigatório pela constraint chk_bank_account_deletion
CREATE OR REPLACE FUNCTION public.delete_account(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.bank_accounts
  SET deleted_at = now(), is_active = false, updated_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
END;
$$;

-- Remove trigger stale em settings_salary que referenciava coluna updated_at inexistente
DROP TRIGGER IF EXISTS trg_settings_salary_updated_at ON public.settings_salary;
