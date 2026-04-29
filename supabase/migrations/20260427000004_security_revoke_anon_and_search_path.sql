-- =============================================================================
-- Security: Revogar privilégios excessivos do role anon
-- + SET search_path em funções SECURITY DEFINER sem ele
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Revogar ALL do anon em todas as tabelas/views financeiras
--    anon não deve ter acesso direto — todas as operações exigem JWT válido.
--    RLS protege, mas TRUNCATE/TRIGGER/REFERENCES para anon nunca são necessários.
-- ---------------------------------------------------------------------------
REVOKE ALL ON public.audit_log                    FROM anon;
REVOKE ALL ON public.bank_accounts                FROM anon;
REVOKE ALL ON public.categories                   FROM anon;
REVOKE ALL ON public.credit_card_invoices         FROM anon;
REVOKE ALL ON public.credit_card_statement_cycles FROM anon;
REVOKE ALL ON public.credit_cards                 FROM anon;
REVOKE ALL ON public.profiles                     FROM anon;
REVOKE ALL ON public.settings_salary              FROM anon;
REVOKE ALL ON public.system_config                FROM anon;
REVOKE ALL ON public.transactions                 FROM anon;
REVOKE ALL ON public.pluggy_items                 FROM anon;
REVOKE ALL ON public.v_card_limits                FROM anon;
REVOKE ALL ON public.v_credit_cards_with_cycles   FROM anon;
REVOKE ALL ON public.v_installment_groups         FROM anon;
REVOKE ALL ON public.v_recurring_groups           FROM anon;

-- ---------------------------------------------------------------------------
-- 2. SET search_path TO 'public' em todas as funções SECURITY DEFINER
--    sem search_path definido — previne search_path injection attacks.
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.audit_trigger_fn()                    SET search_path TO 'public';
ALTER FUNCTION public.get_system_config(text)               SET search_path TO 'public';
ALTER FUNCTION public.get_dashboard_stats(date, date)       SET search_path TO 'public';
ALTER FUNCTION public.get_category_distribution(date, date) SET search_path TO 'public';
ALTER FUNCTION public.get_chart_data(date, date)            SET search_path TO 'public';
ALTER FUNCTION public.recalculate_invoice_total(uuid)       SET search_path TO 'public';
ALTER FUNCTION public.reprocess_invoices_for_card(uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.trg_link_transaction_to_invoice()     SET search_path TO 'public';
ALTER FUNCTION public.create_transaction(jsonb)             SET search_path TO 'public';
ALTER FUNCTION public.batch_pay_transactions(uuid[], uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.batch_unpay_transactions(uuid[])      SET search_path TO 'public';
ALTER FUNCTION public.batch_delete_transactions(uuid[])     SET search_path TO 'public';
ALTER FUNCTION public.delete_transaction_group(uuid, text)  SET search_path TO 'public';
ALTER FUNCTION public.get_installment_group_summary(uuid)   SET search_path TO 'public';
ALTER FUNCTION public.insert_installment_between(uuid)      SET search_path TO 'public';
ALTER FUNCTION public.update_transaction_group(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_card_stats(uuid)                  SET search_path TO 'public';
ALTER FUNCTION public.get_all_card_stats(uuid)              SET search_path TO 'public';
ALTER FUNCTION public.batch_change_day(uuid[], integer)     SET search_path TO 'public';
