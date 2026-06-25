-- ============================================================================
-- IMPORT Supabase dump -> finnance_dev   (ETL determinístico, UUID -> int8)
-- ----------------------------------------------------------------------------
-- Estratégia "limpar e importar do zero":
--   * lookups (account_type, category_type, transaction_type, payment_method,
--     invoice_status, audit_action) e system_config: PRESERVADOS.
--   * dados de negócio: apagados em ordem de FK e reinseridos do Supabase.
--   * usuário admin seed (admin@finnance.com) PRESERVADO p/ login continuar.
--   * UUID do Supabase -> int8 identity local via tabelas stg.map_*.
--   * installment_group / recurring_group: derivados (não existem no Supabase).
--
-- PRÉ-REQUISITO: docs/sql/supabase_dump.json existe (export do Supabase).
-- RODAR (Git Bash):
--   PGPASSWORD=postgres "/c/Program Files/PostgreSQL/18/bin/psql.exe" \
--     -h localhost -p 5432 -U postgres -d finnance_dev \
--     -v dumppath="D:/DEV/Pessoal/finnance-management/docs/sql/supabase_dump.json" \
--     -f docs/sql/import_supabase.sql
-- ============================================================================
\set ON_ERROR_STOP on
\timing on
BEGIN;

-- ---------------------------------------------------------------------------
-- 0) STAGING: carrega o JSON e explode em tabelas tipadas (mantém UUID/textos)
-- ---------------------------------------------------------------------------
DROP SCHEMA IF EXISTS stg CASCADE;
CREATE SCHEMA stg;

CREATE TABLE stg.raw(doc jsonb);
-- strip BOM (chr 65279) que o SQL Editor do Supabase pode prefixar, senão ::jsonb falha
INSERT INTO stg.raw SELECT replace(pg_read_file(:'dumppath'), chr(65279), '')::jsonb;

CREATE TABLE stg.users AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'users' FROM stg.raw)) AS x(
  id uuid, email text, encrypted_password text, full_name text, avatar_url text,
  currency text, locale text, is_admin boolean, created_at timestamptz, updated_at timestamptz);

CREATE TABLE stg.bank_accounts AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'bank_accounts' FROM stg.raw)) AS x(
  id uuid, user_id uuid, name text, type text, initial_balance numeric, current_balance numeric,
  color text, icon text, notes text, is_active boolean,
  created_at timestamptz, updated_at timestamptz, deleted_at timestamptz);

CREATE TABLE stg.categories AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'categories' FROM stg.raw)) AS x(
  id uuid, user_id uuid, type text, name text, color text, icon text, is_active boolean,
  deleted_at timestamptz, created_at timestamptz, updated_at timestamptz);

CREATE TABLE stg.credit_cards AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'credit_cards' FROM stg.raw)) AS x(
  id uuid, user_id uuid, bank_account_id uuid, name text, color text, credit_limit numeric,
  closing_day int, due_day int, is_active boolean, deleted_at timestamptz,
  created_at timestamptz, updated_at timestamptz, notes text);

CREATE TABLE stg.credit_card_invoices AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'credit_card_invoices' FROM stg.raw)) AS x(
  id uuid, user_id uuid, card_id uuid, month_key text, closing_date date, due_date date,
  total_amount numeric, paid_amount numeric, status text,
  closed_at timestamptz, paid_at timestamptz, created_at timestamptz, updated_at timestamptz);

CREATE TABLE stg.statement_cycles AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'credit_card_statement_cycles' FROM stg.raw)) AS x(
  id uuid, user_id uuid, card_id uuid, date_start date, date_end date,
  closing_day smallint, due_day smallint, notes text, created_at timestamptz);

CREATE TABLE stg.transactions AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'transactions' FROM stg.raw)) AS x(
  id uuid, user_id uuid, type text, amount numeric, payment_date date, description text,
  account_id uuid, to_account_id uuid, card_id uuid, category_id uuid,
  created_at timestamptz, updated_at timestamptz, is_fixed boolean, notes text,
  payment_method text, purchase_date date, installment_group_id uuid, installment_number int,
  total_installments int, recurring_group_id uuid, is_paid boolean, invoice_id uuid);

CREATE TABLE stg.settings_salary AS
SELECT * FROM jsonb_to_recordset((SELECT doc->'settings_salary' FROM stg.raw)) AS x(
  user_id uuid, date_start date, date_end date, hourly_rate numeric, base_salary numeric,
  inss_discount_percentage numeric, admin_fee_percentage numeric);

-- tabelas de mapeamento UUID -> int8
CREATE TABLE stg.map_user(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_account(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_category(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_card(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_invoice(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_installment(old uuid PRIMARY KEY, new bigint);
CREATE TABLE stg.map_recurring(old uuid PRIMARY KEY, new bigint);

-- ---------------------------------------------------------------------------
-- 1) LIMPAR dados de negócio (ordem filho -> pai). Lookups intactos.
-- ---------------------------------------------------------------------------
DELETE FROM "transaction";
DELETE FROM settings_salary;
DELETE FROM credit_card_statement_cycle;
DELETE FROM credit_card_invoice;
DELETE FROM credit_card;
DELETE FROM category;
DELETE FROM bank_account;
DELETE FROM installment_group;
DELETE FROM recurring_group;
DELETE FROM audit_log;

-- ---------------------------------------------------------------------------
-- 2) USERS  (upsert por email; preserva admin seed; UUID -> int8)
--    senha: hash bcrypt do Supabase é incompatível com Argon2 do backend.
--    -> mantém password_hash NULL nos importados (reset depois). O admin seed
--       continua com a senha dele. Ajuste manual se quiser logar como o real.
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint;
BEGIN
  FOR r IN SELECT * FROM stg.users LOOP
    SELECT "user" INTO nid FROM "user" WHERE lower(email) = lower(r.email);
    IF nid IS NULL THEN
      INSERT INTO "user"(email, password_hash, full_name, avatar_url, currency, locale,
                         is_admin, active, created, updated)
      VALUES (r.email, NULL, r.full_name, r.avatar_url,
              COALESCE(r.currency,'BRL'), COALESCE(r.locale,'pt-BR'),
              COALESCE(r.is_admin,false), true,
              COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()))
      RETURNING "user" INTO nid;
    ELSE
      UPDATE "user" SET full_name = COALESCE(r.full_name, full_name),
             avatar_url = COALESCE(r.avatar_url, avatar_url),
             is_admin = "user".is_admin OR COALESCE(r.is_admin,false)
      WHERE "user" = nid;
    END IF;
    INSERT INTO stg.map_user(old, new) VALUES (r.id, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3) BANK ACCOUNTS  (type texto -> account_type FK)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint; atype bigint;
BEGIN
  FOR r IN SELECT * FROM stg.bank_accounts LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    atype := CASE lower(coalesce(r.type,''))
               WHEN 'checking' THEN 1 WHEN 'corrente' THEN 1 WHEN 'current' THEN 1
               WHEN 'savings' THEN 2 WHEN 'poupanca' THEN 2 WHEN 'poupança' THEN 2
               WHEN 'investment' THEN 3 WHEN 'investimento' THEN 3
               WHEN 'wallet' THEN 4 WHEN 'cash' THEN 4 WHEN 'carteira' THEN 4 WHEN 'dinheiro' THEN 4
               ELSE 5 END;
    INSERT INTO bank_account("user", account_type, name, initial_balance, current_balance,
                             color, icon, notes, active, created, updated)
    VALUES (uid, atype, r.name, COALESCE(r.initial_balance,0), COALESCE(r.current_balance,0),
            r.color, r.icon, r.notes,
            COALESCE(r.is_active,true) AND r.deleted_at IS NULL,
            COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()))
    RETURNING bank_account INTO nid;
    INSERT INTO stg.map_account(old, new) VALUES (r.id, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4) CATEGORIES  (type income/expense -> category_type FK)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint; ctype bigint;
BEGIN
  FOR r IN SELECT * FROM stg.categories LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    ctype := CASE lower(coalesce(r.type,''))
               WHEN 'income' THEN 1 WHEN 'receita' THEN 1
               WHEN 'expense' THEN 2 WHEN 'despesa' THEN 2
               ELSE 2 END;
    INSERT INTO category("user", category_type, name, color, icon, active, created, updated)
    VALUES (uid, ctype, r.name, r.color, r.icon,
            COALESCE(r.is_active,true) AND r.deleted_at IS NULL,
            COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()))
    RETURNING category INTO nid;
    INSERT INTO stg.map_category(old, new) VALUES (r.id, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5) CREDIT CARDS  (bank_account FK obrigatório -> resolve via map_account)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint; acc bigint;
BEGIN
  FOR r IN SELECT * FROM stg.credit_cards LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    SELECT new INTO acc FROM stg.map_account WHERE old = r.bank_account_id;
    INSERT INTO credit_card("user", bank_account, name, color, credit_limit, notes,
                            active, created, updated)
    VALUES (uid, acc, r.name, COALESCE(r.color,'#8b5cf6'), COALESCE(r.credit_limit,0), r.notes,
            COALESCE(r.is_active,true) AND r.deleted_at IS NULL,
            COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()))
    RETURNING credit_card INTO nid;
    INSERT INTO stg.map_card(old, new) VALUES (r.id, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 6) CREDIT CARD INVOICES  (status texto -> invoice_status FK)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint; crd bigint; st bigint;
BEGIN
  FOR r IN SELECT * FROM stg.credit_card_invoices LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    SELECT new INTO crd FROM stg.map_card WHERE old = r.card_id;
    -- ATENCAO: usar os valores do APP (frontend InvoiceStatusId / backend Constants),
    -- NAO os nomes da tabela de lookup invoice_status. O app trata 1=open, 2=partial,
    -- 3=paid (hardcoded; ignora os nomes do lookup). Mapear 'paid'->4 mostraria "Desconhecida".
    st := CASE lower(coalesce(r.status,'open'))
            WHEN 'open' THEN 1
            WHEN 'partial' THEN 2
            WHEN 'paid' THEN 3
            WHEN 'closed' THEN 1
            WHEN 'overdue' THEN 1
            ELSE 1 END;
    INSERT INTO credit_card_invoice("user", card, invoice_status, month_key, closing_date, due_date,
                                    total_amount, paid_amount, closed_at, paid_at, active, created, updated)
    VALUES (uid, crd, st, r.month_key, r.closing_date, r.due_date,
            COALESCE(r.total_amount,0), COALESCE(r.paid_amount,0), r.closed_at, r.paid_at, true,
            COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()))
    RETURNING credit_card_invoice INTO nid;
    INSERT INTO stg.map_invoice(old, new) VALUES (r.id, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 7) STATEMENT CYCLES
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; uid bigint; crd bigint;
BEGIN
  FOR r IN SELECT * FROM stg.statement_cycles LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    SELECT new INTO crd FROM stg.map_card WHERE old = r.card_id;
    INSERT INTO credit_card_statement_cycle("user", card, date_start, date_end, closing_day,
                                            due_day, notes, active, created, updated)
    VALUES (uid, crd, r.date_start, r.date_end, r.closing_day, r.due_day, r.notes, true,
            COALESCE(r.created_at, now()), COALESCE(r.created_at, now()));
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 8) INSTALLMENT GROUPS  (derivados das transações com installment_group_id)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint;
BEGIN
  FOR r IN
    SELECT installment_group_id AS gid, max(coalesce(total_installments,1)) AS total,
           min(user_id::text)::uuid AS uid
    FROM stg.transactions
    WHERE installment_group_id IS NOT NULL
    GROUP BY installment_group_id
  LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.uid;
    INSERT INTO installment_group("user", total_installments, active, created, updated)
    VALUES (uid, GREATEST(r.total,1), true, now(), now())
    RETURNING installment_group INTO nid;
    INSERT INTO stg.map_installment(old, new) VALUES (r.gid, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 9) RECURRING GROUPS  (só ids COMPARTILHADOS por 2+ transações = série real;
--    recurring_group_id tem default gen_random_uuid() por linha no Supabase,
--    então singletons NÃO são grupo).
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; nid bigint; uid bigint;
BEGIN
  FOR r IN
    SELECT recurring_group_id AS gid, min(user_id::text)::uuid AS uid
    FROM stg.transactions
    WHERE recurring_group_id IS NOT NULL
    GROUP BY recurring_group_id
    HAVING count(*) >= 2
  LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.uid;
    INSERT INTO recurring_group("user", active, created, updated)
    VALUES (uid, true, now(), now())
    RETURNING recurring_group INTO nid;
    INSERT INTO stg.map_recurring(old, new) VALUES (r.gid, nid);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 10) TRANSACTIONS  (resolve todas as FKs + type/payment_method texto -> FK)
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; uid bigint; acc bigint; toacc bigint; crd bigint; cat bigint;
        inv bigint; ig bigint; rg bigint; ttype bigint; pm bigint;
BEGIN
  FOR r IN SELECT * FROM stg.transactions LOOP
    SELECT new INTO uid   FROM stg.map_user       WHERE old = r.user_id;
    SELECT new INTO acc   FROM stg.map_account     WHERE old = r.account_id;
    SELECT new INTO toacc FROM stg.map_account     WHERE old = r.to_account_id;
    SELECT new INTO crd   FROM stg.map_card        WHERE old = r.card_id;
    SELECT new INTO cat   FROM stg.map_category    WHERE old = r.category_id;
    SELECT new INTO inv   FROM stg.map_invoice     WHERE old = r.invoice_id;
    SELECT new INTO ig    FROM stg.map_installment WHERE old = r.installment_group_id;
    SELECT new INTO rg    FROM stg.map_recurring   WHERE old = r.recurring_group_id;
    ttype := CASE lower(coalesce(r.type,''))
               WHEN 'receita' THEN 1 WHEN 'income' THEN 1
               WHEN 'despesa' THEN 2 WHEN 'expense' THEN 2
               WHEN 'transfer' THEN 3 WHEN 'transferencia' THEN 3 WHEN 'transferência' THEN 3
               ELSE 2 END;
    pm := CASE lower(coalesce(r.payment_method,''))
            WHEN 'credit' THEN 1 WHEN 'credito' THEN 1 WHEN 'crédito' THEN 1
            WHEN 'debit' THEN 2 WHEN 'debito' THEN 2 WHEN 'débito' THEN 2
            WHEN 'pix' THEN 3
            WHEN 'cash' THEN 4 WHEN 'dinheiro' THEN 4
            WHEN 'bill_payment' THEN 5 WHEN 'boleto' THEN 5
            WHEN 'transfer' THEN 6 WHEN 'transferencia' THEN 6
            WHEN 'other' THEN 7 WHEN 'outro' THEN 7
            ELSE NULL END;
    INSERT INTO "transaction"("user", transaction_type, payment_method, amount, payment_date,
            purchase_date, description, account, to_account, card, category, invoice,
            installment_group, installment_number, recurring_group, fixed, paid, notes,
            active, created, updated)
    VALUES (uid, ttype, pm, r.amount, r.payment_date, r.purchase_date, r.description,
            acc, toacc, crd, cat, inv, ig, r.installment_number, rg,
            COALESCE(r.is_fixed,false), COALESCE(r.is_paid,false), r.notes, true,
            COALESCE(r.created_at, now()), COALESCE(r.updated_at, now()));
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 11) SETTINGS SALARY
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record; uid bigint;
BEGIN
  FOR r IN SELECT * FROM stg.settings_salary LOOP
    SELECT new INTO uid FROM stg.map_user WHERE old = r.user_id;
    INSERT INTO settings_salary("user", date_start, date_end, hourly_rate, base_salary,
            inss_discount_percentage, admin_fee_percentage, active, created, updated)
    VALUES (uid, r.date_start, COALESCE(r.date_end, DATE '9999-12-31'), r.hourly_rate, r.base_salary,
            r.inss_discount_percentage, r.admin_fee_percentage, true, now(), now());
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 12) RELATÓRIO de importação
-- ---------------------------------------------------------------------------
\echo '===== CONTAGENS PÓS-IMPORT ====='
SELECT 'user' t, count(*) n FROM "user"
UNION ALL SELECT 'bank_account', count(*) FROM bank_account
UNION ALL SELECT 'category', count(*) FROM category
UNION ALL SELECT 'credit_card', count(*) FROM credit_card
UNION ALL SELECT 'credit_card_invoice', count(*) FROM credit_card_invoice
UNION ALL SELECT 'credit_card_statement_cycle', count(*) FROM credit_card_statement_cycle
UNION ALL SELECT 'installment_group', count(*) FROM installment_group
UNION ALL SELECT 'recurring_group', count(*) FROM recurring_group
UNION ALL SELECT 'transaction', count(*) FROM "transaction"
UNION ALL SELECT 'settings_salary', count(*) FROM settings_salary
ORDER BY 1;

-- COMMIT;  -- descomente após validar; por padrão deixo explícito no final.
COMMIT;
