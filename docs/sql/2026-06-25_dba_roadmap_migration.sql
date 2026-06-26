-- ============================================================================
-- Migração consolidada — Roadmap DBA (modelagem, segurança multi-tenant, performance)
-- Alvo: PostgreSQL local finnance_dev. Idempotente e transacional (re-rodável).
-- Aplicada em 2026-06-25. Espelha as mudanças refletidas em docs/DDL.txt e
-- docs/sql/finnance_dev_schema.sql.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) Tabelas novas
-- ----------------------------------------------------------------------------

-- 1.1) recurring_rule: template de recorrência (regra; as ocorrências são
--      transações com transaction.recurring_rule apontando para a regra).
CREATE TABLE IF NOT EXISTS recurring_rule (
    recurring_rule int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    "user" int8 NOT NULL,
    description text NOT NULL,
    amount numeric(15, 2) NOT NULL,
    transaction_type int8 NOT NULL,
    category int8 NULL,
    account int8 NULL,
    card int8 NULL,
    payment_method int8 NULL,
    day_of_month int2 NOT NULL,
    frequency int2 NOT NULL DEFAULT 1,
    date_start date NOT NULL,
    date_end date NOT NULL DEFAULT DATE '9999-12-31',
    active bool NOT NULL DEFAULT true,
    created timestamptz NOT NULL DEFAULT now(),
    updated timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_recurring_rule PRIMARY KEY (recurring_rule),
    CONSTRAINT fk_recurring_rule_user FOREIGN KEY ("user") REFERENCES "user"("user"),
    CONSTRAINT fk_recurring_rule_type FOREIGN KEY (transaction_type) REFERENCES transaction_type(transaction_type),
    CONSTRAINT fk_recurring_rule_category FOREIGN KEY (category) REFERENCES category(category),
    CONSTRAINT fk_recurring_rule_account FOREIGN KEY (account) REFERENCES bank_account(bank_account),
    CONSTRAINT fk_recurring_rule_card FOREIGN KEY (card) REFERENCES credit_card(credit_card),
    CONSTRAINT fk_recurring_rule_method FOREIGN KEY (payment_method) REFERENCES payment_method(payment_method),
    CONSTRAINT chk_recurring_rule_amount CHECK (amount > 0),
    CONSTRAINT chk_recurring_rule_day CHECK (day_of_month BETWEEN 1 AND 31),
    CONSTRAINT chk_recurring_rule_frequency CHECK (frequency >= 1),
    CONSTRAINT chk_recurring_rule_dates CHECK (date_start <= date_end)
);
CREATE INDEX IF NOT EXISTS idx_recurring_rule_user ON public.recurring_rule USING btree ("user") WHERE active;

-- 1.2) credit_card_invoice_payment: ledger de pagamentos de fatura.
CREATE TABLE IF NOT EXISTS credit_card_invoice_payment (
    credit_card_invoice_payment int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    "user" int8 NOT NULL,
    invoice int8 NOT NULL,
    account int8 NULL,
    payment_method int8 NULL,
    amount numeric(15, 2) NOT NULL,
    paid_at timestamptz NOT NULL DEFAULT now(),
    notes text NULL,
    active bool NOT NULL DEFAULT true,
    created timestamptz NOT NULL DEFAULT now(),
    updated timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_credit_card_invoice_payment PRIMARY KEY (credit_card_invoice_payment),
    CONSTRAINT fk_invoice_payment_user FOREIGN KEY ("user") REFERENCES "user"("user"),
    CONSTRAINT fk_invoice_payment_invoice FOREIGN KEY (invoice) REFERENCES credit_card_invoice(credit_card_invoice),
    CONSTRAINT fk_invoice_payment_account FOREIGN KEY (account) REFERENCES bank_account(bank_account),
    CONSTRAINT fk_invoice_payment_method FOREIGN KEY (payment_method) REFERENCES payment_method(payment_method),
    CONSTRAINT chk_invoice_payment_amount CHECK (amount > 0)
);
CREATE INDEX IF NOT EXISTS idx_invoice_payment_invoice ON public.credit_card_invoice_payment USING btree (invoice);
CREATE INDEX IF NOT EXISTS idx_invoice_payment_user ON public.credit_card_invoice_payment USING btree ("user") WHERE active;

-- ----------------------------------------------------------------------------
-- 2) transaction.recurring_rule (liga a ocorrência à regra)
-- ----------------------------------------------------------------------------
ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS recurring_rule int8 NULL;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transaction_recurring_rule') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT fk_transaction_recurring_rule FOREIGN KEY (recurring_rule) REFERENCES recurring_rule(recurring_rule);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_transaction_recurring_rule ON public.transaction USING btree (recurring_rule) WHERE (recurring_rule IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 3) Unicidade de nome nas lookup tables
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_transaction_type_name ON public.transaction_type USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_type_name ON public.account_type USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_category_type_name ON public.category_type USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_method_name ON public.payment_method USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoice_status_name ON public.invoice_status USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_action_name ON public.audit_action USING btree (name);

-- ----------------------------------------------------------------------------
-- 4) "1 ciclo aberto por cartão" (integridade + lookup direto do ciclo aberto)
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_card_open_cycle ON public.credit_card_statement_cycle USING btree (card) WHERE (date_end = DATE '9999-12-31');

-- ----------------------------------------------------------------------------
-- 5) Índices de cobertura (INCLUDE) — dashboard/summaries e recálculo de fatura
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_transaction_user_type_date;
CREATE INDEX idx_transaction_user_type_date ON public.transaction USING btree ("user", transaction_type, payment_date DESC) INCLUDE (amount, card, paid, category);

DROP INDEX IF EXISTS idx_transaction_invoice;
CREATE INDEX idx_transaction_invoice ON public.transaction USING btree (invoice) INCLUDE (amount, paid, transaction_type) WHERE (invoice IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 6) fillfactor + autovacuum nas tabelas update-heavy
--    (aplica a páginas novas; rode VACUUM FULL para reorganizar o volume atual)
-- ----------------------------------------------------------------------------
ALTER TABLE "transaction" SET (fillfactor = 90);
ALTER TABLE bank_account SET (fillfactor = 85, autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE credit_card_invoice SET (fillfactor = 85, autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);

-- ----------------------------------------------------------------------------
-- 7) audit_log: índice BRIN por tempo (append-only) + FK do autor
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_audit_log_time;
CREATE INDEX IF NOT EXISTS idx_audit_log_time_brin ON public.audit_log USING brin (created);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_log_user') THEN
        ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_user FOREIGN KEY (changed_by) REFERENCES "user"("user");
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 8) CHECKs de invariante (NOT VALID: valem para novas linhas, não varrem legado)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transaction_amount_positive') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT chk_transaction_amount_positive CHECK (amount IS NULL OR amount > 0) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transaction_card_has_account') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT chk_transaction_card_has_account CHECK (card IS NULL OR account IS NOT NULL) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_transaction_transfer_account') THEN
        ALTER TABLE "transaction" ADD CONSTRAINT chk_transaction_transfer_account CHECK (to_account IS NULL OR transaction_type = 3) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cycle_days') THEN
        ALTER TABLE credit_card_statement_cycle ADD CONSTRAINT chk_cycle_days CHECK ((closing_day IS NULL OR closing_day BETWEEN 1 AND 31) AND (due_day IS NULL OR due_day BETWEEN 1 AND 31)) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_settings_salary_percent') THEN
        ALTER TABLE settings_salary ADD CONSTRAINT chk_settings_salary_percent CHECK ((inss_discount_percentage IS NULL OR inss_discount_percentage BETWEEN 0 AND 100) AND (admin_fee_percentage IS NULL OR admin_fee_percentage BETWEEN 0 AND 100)) NOT VALID;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 9) Avançar sequências IDENTITY das lookups (evita colisão de id com o seed)
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('transaction_type','transaction_type'), GREATEST((SELECT MAX(transaction_type) FROM transaction_type), 1));
SELECT setval(pg_get_serial_sequence('account_type','account_type'), GREATEST((SELECT MAX(account_type) FROM account_type), 1));
SELECT setval(pg_get_serial_sequence('category_type','category_type'), GREATEST((SELECT MAX(category_type) FROM category_type), 1));
SELECT setval(pg_get_serial_sequence('payment_method','payment_method'), GREATEST((SELECT MAX(payment_method) FROM payment_method), 1));
SELECT setval(pg_get_serial_sequence('invoice_status','invoice_status'), GREATEST((SELECT MAX(invoice_status) FROM invoice_status), 1));
SELECT setval(pg_get_serial_sequence('audit_action','audit_action'), GREATEST((SELECT MAX(audit_action) FROM audit_action), 1));

-- ----------------------------------------------------------------------------
-- 10) Alinhamento de nomes das lookups (canônico = espelha o seed do app).
--     Guardado por id: em banco já populado canonicaliza; em banco vazio é
--     no-op (o seed do app cria as linhas no boot).
-- ----------------------------------------------------------------------------
UPDATE transaction_type SET name = v.name FROM (VALUES (1,'Receita'),(2,'Despesa'),(3,'Transferência')) AS v(id,name) WHERE transaction_type.transaction_type = v.id AND transaction_type.name <> v.name;
UPDATE account_type SET name = v.name FROM (VALUES (1,'Conta Corrente'),(2,'Poupança'),(3,'Investimento'),(4,'Carteira'),(5,'Outro')) AS v(id,name) WHERE account_type.account_type = v.id AND account_type.name <> v.name;
UPDATE category_type SET name = v.name FROM (VALUES (1,'Receita'),(2,'Despesa')) AS v(id,name) WHERE category_type.category_type = v.id AND category_type.name <> v.name;
UPDATE payment_method SET name = v.name FROM (VALUES (1,'Crédito'),(2,'Débito'),(3,'PIX'),(4,'Dinheiro'),(5,'Pagamento de boleto'),(6,'Transferência'),(7,'Outro')) AS v(id,name) WHERE payment_method.payment_method = v.id AND payment_method.name <> v.name;
UPDATE invoice_status SET name = v.name FROM (VALUES (1,'Aberta'),(2,'Fechada'),(3,'Parcial'),(4,'Paga'),(5,'Vencida')) AS v(id,name) WHERE invoice_status.invoice_status = v.id AND invoice_status.name <> v.name;
UPDATE audit_action SET name = v.name FROM (VALUES (1,'Inserção'),(2,'Alteração'),(3,'Exclusão')) AS v(id,name) WHERE audit_action.audit_action = v.id AND audit_action.name <> v.name;

-- ----------------------------------------------------------------------------
-- 11) Recompute dos status de fatura para o esquema canônico de invoice_status
--     (OPEN=1, PARTIAL=3, PAID=4; income=1 entra negativo no total).
--     Corrige faturas pagas que estavam gravadas como id 3 ("Parcial").
--     Idempotente: deriva sempre das transações ativas da fatura.
-- ----------------------------------------------------------------------------
UPDATE credit_card_invoice ci SET
    total_amount = s.total,
    paid_amount = s.paid,
    invoice_status = CASE
        WHEN s.total > 0 AND s.paid >= s.total THEN 4
        WHEN s.paid > 0 AND s.paid < s.total THEN 3
        ELSE 1 END,
    paid_at = CASE WHEN s.total > 0 AND s.paid >= s.total THEN now() ELSE NULL END,
    updated = now()
FROM (
    SELECT i.credit_card_invoice AS id,
        COALESCE(SUM(CASE WHEN t.transaction_type = 1 THEN -t.amount ELSE t.amount END), 0) AS total,
        COALESCE(SUM(CASE WHEN t.paid = TRUE AND t.transaction_type <> 1 THEN t.amount ELSE 0 END), 0) AS paid
    FROM credit_card_invoice i
    LEFT JOIN "transaction" t ON t.invoice = i.credit_card_invoice AND t.active = TRUE
    GROUP BY i.credit_card_invoice
) s
WHERE ci.credit_card_invoice = s.id
  AND (ci.total_amount IS DISTINCT FROM s.total
       OR ci.paid_amount IS DISTINCT FROM s.paid
       OR ci.invoice_status IS DISTINCT FROM (CASE
            WHEN s.total > 0 AND s.paid >= s.total THEN 4
            WHEN s.paid > 0 AND s.paid < s.total THEN 3
            ELSE 1 END));

COMMIT;
