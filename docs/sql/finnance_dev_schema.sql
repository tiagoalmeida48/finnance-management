CREATE TABLE account_type (
                              account_type int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                              "name" text NOT NULL,
                              active bool NOT NULL,
                              created timestamptz NOT NULL,
                              updated timestamptz NOT NULL,
                              CONSTRAINT pk_account_type PRIMARY KEY (account_type)
);
CREATE UNIQUE INDEX uq_account_type_name ON public.account_type USING btree (name);

CREATE TABLE audit_action (
                              audit_action int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                              "name" text NOT NULL,
                              active bool NOT NULL,
                              created timestamptz NOT NULL,
                              updated timestamptz NOT NULL,
                              CONSTRAINT pk_audit_action PRIMARY KEY (audit_action)
);
CREATE UNIQUE INDEX uq_audit_action_name ON public.audit_action USING btree (name);

CREATE TABLE category_type (
                               category_type int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                               "name" text NOT NULL,
                               active bool NOT NULL,
                               created timestamptz NOT NULL,
                               updated timestamptz NOT NULL,
                               CONSTRAINT pk_category_type PRIMARY KEY (category_type)
);
CREATE UNIQUE INDEX uq_category_type_name ON public.category_type USING btree (name);

CREATE TABLE invoice_status (
                                invoice_status int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                "name" text NOT NULL,
                                active bool NOT NULL,
                                created timestamptz NOT NULL,
                                updated timestamptz NOT NULL,
                                CONSTRAINT pk_invoice_status PRIMARY KEY (invoice_status)
);
CREATE UNIQUE INDEX uq_invoice_status_name ON public.invoice_status USING btree (name);

CREATE TABLE payment_method (
                                payment_method int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                "name" text NOT NULL,
                                active bool NOT NULL,
                                created timestamptz NOT NULL,
                                updated timestamptz NOT NULL,
                                CONSTRAINT pk_payment_method PRIMARY KEY (payment_method)
);
CREATE UNIQUE INDEX uq_payment_method_name ON public.payment_method USING btree (name);

CREATE TABLE system_config (
                               system_config int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                               "key" text NOT NULL,
                               value numeric(15, 2) NOT NULL,
                               active bool NOT NULL,
                               created timestamptz NOT NULL,
                               updated timestamptz NOT NULL,
                               CONSTRAINT pk_system_config PRIMARY KEY (system_config),
                               CONSTRAINT uq_system_config_key UNIQUE (key)
);

CREATE TABLE transaction_type (
                                  transaction_type int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                  "name" text NOT NULL,
                                  active bool NOT NULL,
                                  created timestamptz NOT NULL,
                                  updated timestamptz NOT NULL,
                                  CONSTRAINT pk_transaction_type PRIMARY KEY (transaction_type)
);
CREATE UNIQUE INDEX uq_transaction_type_name ON public.transaction_type USING btree (name);

CREATE TABLE "user" (
                        "user" int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                        email text NOT NULL,
                        password_hash text NULL,
                        full_name text NULL,
                        avatar_url text NULL,
                        phone text NULL,
                        marketing_consent bool DEFAULT false NOT NULL,
                        marketing_consent_at timestamptz NULL,
                        marketing_consent_source text NULL,
                        marketing_consent_version text NULL,
                        marketing_opt_out_at timestamptz NULL,
                        currency text NULL,
                        locale text NULL,
                        active bool NOT NULL,
                        subscription_blocked bool DEFAULT false NOT NULL,
                        is_admin bool DEFAULT false NOT NULL,
                        token_version int4 DEFAULT 0 NOT NULL,
                        created timestamptz NULL,
                        updated timestamptz NULL,
                        email_verified bool DEFAULT false NOT NULL,
                        verify_token text NULL,
                        verify_token_expires timestamptz NULL,
                        reset_token text NULL,
                        reset_token_expires timestamptz NULL,
                        CONSTRAINT pk_user PRIMARY KEY ("user"),
                        CONSTRAINT ck_user_phone_format CHECK (phone IS NULL OR phone ~ '^\+[0-9]{10,15}$'),
                        CONSTRAINT ck_user_marketing_consent_phone CHECK (marketing_consent = false OR phone IS NOT NULL),
                        CONSTRAINT ck_user_token_version CHECK (token_version >= 0)
);
CREATE UNIQUE INDEX uq_user_email_normalized ON public."user" (LOWER(BTRIM(email)));
CREATE INDEX idx_user_reset_token ON public."user" USING btree (reset_token) WHERE (reset_token IS NOT NULL);
CREATE INDEX idx_user_verify_token ON public."user" USING btree (verify_token) WHERE (verify_token IS NOT NULL);
CREATE INDEX idx_user_marketing_consent ON public."user" USING btree (marketing_consent) WHERE marketing_consent = true;

CREATE TABLE audit_log (
                           audit_log int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                           audit_action int8 NOT NULL,
                           table_name text NOT NULL,
                           record int8 NOT NULL,
                           old_data jsonb NULL,
                           new_data jsonb NULL,
                           changed_by int8 NULL,
                           description text NULL,
                           created timestamptz NOT NULL,
                           updated timestamptz NOT NULL,
                           CONSTRAINT pk_audit_log PRIMARY KEY (audit_log),
                           CONSTRAINT fk_audit_log_action FOREIGN KEY (audit_action) REFERENCES audit_action(audit_action),
                           CONSTRAINT fk_audit_log_user FOREIGN KEY (changed_by) REFERENCES "user"("user")
);
CREATE INDEX idx_audit_log_actor ON public.audit_log USING btree (changed_by, created DESC);
CREATE INDEX idx_audit_log_record ON public.audit_log USING btree (table_name, record);
CREATE INDEX idx_audit_log_time_brin ON public.audit_log USING brin (created);

CREATE TABLE bank_account (
                              bank_account int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                              "user" int8 NOT NULL,
                              account_type int8 NOT NULL,
                              "name" text NULL,
                              initial_balance numeric(15, 2) NULL,
                              current_balance numeric(15, 2) NULL,
                              color text NULL,
                              icon text NULL,
                              notes text NULL,
                              active bool NOT NULL,
                              created timestamptz NOT NULL,
                              updated timestamptz NOT NULL,
                              CONSTRAINT pk_bank_account PRIMARY KEY (bank_account),
                              CONSTRAINT fk_bank_account_type FOREIGN KEY (account_type) REFERENCES account_type(account_type),
                              CONSTRAINT fk_bank_account_user FOREIGN KEY ("user") REFERENCES "user"("user")
)
    WITH (
        fillfactor=85,
        autovacuum_vacuum_scale_factor=0.05,
        autovacuum_analyze_scale_factor=0.02
        );
CREATE INDEX idx_bank_account_user ON public.bank_account USING btree ("user") WHERE active;

CREATE TABLE category (
                          category int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                          "user" int8 NOT NULL,
                          category_type int8 NOT NULL,
                          "name" text NOT NULL,
                          color text NULL,
                          icon text NULL,
                          active bool NOT NULL,
                          created timestamptz NOT NULL,
                          updated timestamptz NOT NULL,
                          CONSTRAINT pk_category PRIMARY KEY (category),
                          CONSTRAINT fk_category_type FOREIGN KEY (category_type) REFERENCES category_type(category_type),
                          CONSTRAINT fk_category_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_category_user ON public.category USING btree ("user") WHERE active;
CREATE UNIQUE INDEX uq_category_user_type_name ON public.category USING btree ("user", category_type, name) WHERE active;

CREATE TABLE credit_card (
                             credit_card int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                             "user" int8 NOT NULL,
                             bank_account int8 NOT NULL,
                             "name" text NOT NULL,
                             color text NOT NULL,
                             credit_limit numeric(15, 2) NOT NULL,
                             notes text NULL,
                             active bool NOT NULL,
                             created timestamptz NOT NULL,
                             updated timestamptz NOT NULL,
                             CONSTRAINT pk_credit_card PRIMARY KEY (credit_card),
                             CONSTRAINT fk_credit_card_bank_account FOREIGN KEY (bank_account) REFERENCES bank_account(bank_account),
                             CONSTRAINT fk_credit_card_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_credit_card_bank_account ON public.credit_card USING btree (bank_account);
CREATE INDEX idx_credit_card_user ON public.credit_card USING btree ("user") WHERE active;

CREATE TABLE credit_card_invoice (
                                     credit_card_invoice int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                     "user" int8 NOT NULL,
                                     card int8 NOT NULL,
                                     invoice_status int8 NOT NULL,
                                     month_key text NOT NULL,
                                     closing_date date NULL,
                                     due_date date NULL,
                                     total_amount numeric(15, 2) NULL,
                                     paid_amount numeric(15, 2) NULL,
                                     closed_at timestamptz NULL,
                                     paid_at timestamptz NULL,
                                     active bool NOT NULL,
                                     created timestamptz NOT NULL,
                                     updated timestamptz NOT NULL,
                                     CONSTRAINT pk_credit_card_invoice PRIMARY KEY (credit_card_invoice),
                                     CONSTRAINT uq_credit_card_invoice_card_month UNIQUE (card, month_key),
                                     CONSTRAINT fk_credit_card_invoice_card FOREIGN KEY (card) REFERENCES credit_card(credit_card),
                                     CONSTRAINT fk_credit_card_invoice_status FOREIGN KEY (invoice_status) REFERENCES invoice_status(invoice_status),
                                     CONSTRAINT fk_credit_card_invoice_user FOREIGN KEY ("user") REFERENCES "user"("user")
)
    WITH (
        fillfactor=85,
        autovacuum_vacuum_scale_factor=0.05,
        autovacuum_analyze_scale_factor=0.02
        );
CREATE INDEX idx_credit_card_invoice_card_status ON public.credit_card_invoice USING btree (card, invoice_status);
CREATE INDEX idx_credit_card_invoice_user_status ON public.credit_card_invoice USING btree ("user", invoice_status);

CREATE TABLE credit_card_statement_cycle (
                                             credit_card_statement_cycle int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                             "user" int8 NOT NULL,
                                             card int8 NOT NULL,
                                             date_start date NULL,
                                             date_end date NULL,
                                             closing_day int2 NULL,
                                             due_day int2 NULL,
                                             notes text NULL,
                                             active bool NOT NULL,
                                             created timestamptz NOT NULL,
                                             updated timestamptz NOT NULL,
                                             CONSTRAINT chk_cycle_days CHECK ((((closing_day IS NULL) OR ((closing_day >= 1) AND (closing_day <= 31))) AND ((due_day IS NULL) OR ((due_day >= 1) AND (due_day <= 31))))),
                                             CONSTRAINT pk_credit_card_statement_cycle PRIMARY KEY (credit_card_statement_cycle),
                                             CONSTRAINT uq_credit_card_statement_cycle_card_start UNIQUE (card, date_start),
                                             CONSTRAINT fk_credit_card_statement_cycle_card FOREIGN KEY (card) REFERENCES credit_card(credit_card),
                                             CONSTRAINT fk_credit_card_statement_cycle_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_credit_card_statement_cycle_card ON public.credit_card_statement_cycle USING btree (card);
CREATE INDEX idx_credit_card_statement_cycle_user ON public.credit_card_statement_cycle USING btree ("user");
CREATE UNIQUE INDEX uq_card_open_cycle ON public.credit_card_statement_cycle USING btree (card) WHERE (date_end = '9999-12-31'::date);

CREATE TABLE installment_group (
                                   installment_group int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                   "user" int8 NOT NULL,
                                   total_installments int4 NOT NULL,
                                   active bool NOT NULL,
                                   created timestamptz NOT NULL,
                                   updated timestamptz NOT NULL,
                                   CONSTRAINT pk_installment_group PRIMARY KEY (installment_group),
                                   CONSTRAINT fk_installment_group_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_installment_group_user ON public.installment_group USING btree ("user");

CREATE TABLE recurring_group (
                                 recurring_group int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                 "user" int8 NOT NULL,
                                 active bool NOT NULL,
                                 created timestamptz NOT NULL,
                                 updated timestamptz NOT NULL,
                                 CONSTRAINT pk_recurring_group PRIMARY KEY (recurring_group),
                                 CONSTRAINT fk_recurring_group_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_recurring_group_user ON public.recurring_group USING btree ("user");

CREATE TABLE settings_salary (
                                 settings_salary int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                                 "user" int8 NOT NULL,
                                 date_start date NOT NULL,
                                 date_end date NOT NULL,
                                 hourly_rate numeric(15, 2) NULL,
                                 base_salary numeric(15, 2) NULL,
                                 inss_discount_percentage numeric(15, 2) NULL,
                                 admin_fee_percentage numeric(15, 2) NULL,
                                 active bool NOT NULL,
                                 created timestamptz NOT NULL,
                                 updated timestamptz NOT NULL,
                                 CONSTRAINT chk_settings_salary_percent CHECK ((((inss_discount_percentage IS NULL) OR ((inss_discount_percentage >= (0)::numeric) AND (inss_discount_percentage <= (100)::numeric))) AND ((admin_fee_percentage IS NULL) OR ((admin_fee_percentage >= (0)::numeric) AND (admin_fee_percentage <= (100)::numeric))))),
                                 CONSTRAINT pk_settings_salary PRIMARY KEY (settings_salary),
                                 CONSTRAINT uq_settings_salary_period UNIQUE ("user", date_start, date_end),
                                 CONSTRAINT fk_settings_salary_user FOREIGN KEY ("user") REFERENCES "user"("user")
);

CREATE TABLE "transaction" (
                               "transaction" int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
                               "user" int8 NOT NULL,
                               transaction_type int8 NOT NULL,
                               payment_method int8 NULL,
                               amount numeric(15, 2) NULL,
                               payment_date date NULL,
                               purchase_date date NULL,
                               description text NULL,
                               account int8 NULL,
                               to_account int8 NULL,
                               card int8 NULL,
                               category int8 NULL,
                               invoice int8 NULL,
                               installment_group int8 NULL,
                               installment_number int4 NULL,
                               recurring_group int8 NULL,
                               fixed bool NOT NULL,
                               paid bool NOT NULL,
                               notes text NULL,
                               active bool NOT NULL,
                               created timestamptz NOT NULL,
                               updated timestamptz NOT NULL,
                               CONSTRAINT chk_transaction_amount_positive CHECK (((amount IS NULL) OR (amount > (0)::numeric))),
                               CONSTRAINT chk_transaction_card_has_account CHECK (((card IS NULL) OR (account IS NOT NULL))),
                               CONSTRAINT chk_transaction_transfer_account CHECK (((to_account IS NULL) OR (transaction_type = 3))),
                               CONSTRAINT pk_transaction PRIMARY KEY (transaction),
                               CONSTRAINT fk_transaction_account FOREIGN KEY (account) REFERENCES bank_account(bank_account),
                               CONSTRAINT fk_transaction_card FOREIGN KEY (card) REFERENCES credit_card(credit_card),
                               CONSTRAINT fk_transaction_category FOREIGN KEY (category) REFERENCES category(category),
                               CONSTRAINT fk_transaction_installment FOREIGN KEY (installment_group) REFERENCES installment_group(installment_group),
                               CONSTRAINT fk_transaction_invoice FOREIGN KEY (invoice) REFERENCES credit_card_invoice(credit_card_invoice),
                               CONSTRAINT fk_transaction_method FOREIGN KEY (payment_method) REFERENCES payment_method(payment_method),
                               CONSTRAINT fk_transaction_recurring FOREIGN KEY (recurring_group) REFERENCES recurring_group(recurring_group),
                               CONSTRAINT fk_transaction_to_account FOREIGN KEY (to_account) REFERENCES bank_account(bank_account),
                               CONSTRAINT fk_transaction_type FOREIGN KEY (transaction_type) REFERENCES transaction_type(transaction_type),
                               CONSTRAINT fk_transaction_user FOREIGN KEY ("user") REFERENCES "user"("user")
)
    WITH (
        fillfactor=90
        );
CREATE INDEX idx_transaction_account_paid ON public.transaction USING btree (account, paid) WHERE (account IS NOT NULL);
CREATE INDEX idx_transaction_card ON public.transaction USING btree (card) WHERE (card IS NOT NULL);
CREATE INDEX idx_transaction_category ON public.transaction USING btree (category) WHERE (category IS NOT NULL);
CREATE INDEX idx_transaction_installment ON public.transaction USING btree (installment_group) WHERE (installment_group IS NOT NULL);
CREATE INDEX idx_transaction_invoice ON public.transaction USING btree (invoice) INCLUDE (amount, paid, transaction_type) WHERE (invoice IS NOT NULL);
CREATE INDEX idx_transaction_recurring ON public.transaction USING btree (recurring_group) WHERE (recurring_group IS NOT NULL);
CREATE INDEX idx_transaction_to_account_paid ON public.transaction USING btree (to_account, paid) WHERE (to_account IS NOT NULL);
CREATE INDEX idx_transaction_user_payment_date ON public.transaction USING btree ("user", payment_date DESC);
CREATE INDEX idx_transaction_user_type_date ON public.transaction USING btree ("user", transaction_type, payment_date DESC) INCLUDE (amount, card, paid, category);
