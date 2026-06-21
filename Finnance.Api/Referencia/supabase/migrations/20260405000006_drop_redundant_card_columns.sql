-- =============================================================================
-- Drop Redundant Card Columns — finnance-management
--
-- Remove closing_day e due_day de credit_cards.
-- Estes campos sao redundantemente sincronizados pelo trigger
-- trg_sync_credit_card_cycle_days a partir de credit_card_statement_cycles.
--
-- Para consulta facil, a VIEW v_credit_cards_with_cycles fornece os valores
-- resolvidos do ciclo aberto.
-- =============================================================================

-- 1. Drop trigger de sync (colunas vao sumir)
DROP TRIGGER IF EXISTS trg_sync_credit_card_cycle_days ON public.credit_card_statement_cycles;
DROP FUNCTION IF EXISTS public.trg_sync_credit_card_cycle_days();

-- 2. Drop colunas redundant
ALTER TABLE public.credit_cards DROP COLUMN IF EXISTS closing_day;
ALTER TABLE public.credit_cards DROP COLUMN IF EXISTS due_day;

-- 3. VIEW para acesso facil ao closing/due do ciclo aberto
--    Substitui credit_cards.closing_day / credit_cards.due_day
CREATE OR REPLACE VIEW public.v_credit_cards_with_cycles AS
SELECT cc.*,
       cyc.closing_day AS cycle_closing_day,
       cyc.due_day     AS cycle_due_day
FROM public.credit_cards cc
LEFT JOIN public.credit_card_statement_cycles cyc
  ON cyc.card_id = cc.id AND cyc.date_end = '9999-12-31'::date;

-- 4. FK credit_cards → bank_accounts com ON DELETE
--    Se a conta for removida, o cartao nao fica orfao
--    (A FK original nao tem CASCADE, adicionamos para consistencia)
--    NOTA: nao podemos alterar FK existente; documentar aqui para futuro drop de tabela
