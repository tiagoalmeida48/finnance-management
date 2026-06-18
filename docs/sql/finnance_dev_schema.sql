\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE account_type (
    account_type BIGINT GENERATED ALWAYS AS IDENTITY,
    code         TEXT NOT NULL,
    name         TEXT NOT NULL,
    active       BOOLEAN NOT NULL,
    created      TIMESTAMPTZ NOT NULL,
    updated      TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_account_type PRIMARY KEY (account_type),
    CONSTRAINT uq_account_type_code UNIQUE (code)
);

CREATE TABLE category_type (
    category_type BIGINT GENERATED ALWAYS AS IDENTITY,
    code          TEXT NOT NULL,
    name          TEXT NOT NULL,
    active        BOOLEAN NOT NULL,
    created       TIMESTAMPTZ NOT NULL,
    updated       TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_category_type PRIMARY KEY (category_type),
    CONSTRAINT uq_category_type_code UNIQUE (code)
);

CREATE TABLE transaction_type (
    transaction_type BIGINT GENERATED ALWAYS AS IDENTITY,
    code             TEXT NOT NULL,
    name             TEXT NOT NULL,
    active           BOOLEAN NOT NULL,
    created          TIMESTAMPTZ NOT NULL,
    updated          TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_transaction_type PRIMARY KEY (transaction_type),
    CONSTRAINT uq_transaction_type_code UNIQUE (code)
);

CREATE TABLE payment_method (
    payment_method BIGINT GENERATED ALWAYS AS IDENTITY,
    code           TEXT NOT NULL,
    name           TEXT NOT NULL,
    active         BOOLEAN NOT NULL,
    created        TIMESTAMPTZ NOT NULL,
    updated        TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_payment_method PRIMARY KEY (payment_method),
    CONSTRAINT uq_payment_method_code UNIQUE (code)
);

CREATE TABLE invoice_status (
    invoice_status BIGINT GENERATED ALWAYS AS IDENTITY,
    code           TEXT NOT NULL,
    name           TEXT NOT NULL,
    active         BOOLEAN NOT NULL,
    created        TIMESTAMPTZ NOT NULL,
    updated        TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_invoice_status PRIMARY KEY (invoice_status),
    CONSTRAINT uq_invoice_status_code UNIQUE (code)
);

CREATE TABLE audit_action (
    audit_action BIGINT GENERATED ALWAYS AS IDENTITY,
    code         TEXT NOT NULL,
    name         TEXT NOT NULL,
    active       BOOLEAN NOT NULL,
    created      TIMESTAMPTZ NOT NULL,
    updated      TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_audit_action PRIMARY KEY (audit_action),
    CONSTRAINT uq_audit_action_code UNIQUE (code)
);

CREATE TABLE "user" (
    "user"        BIGINT GENERATED ALWAYS AS IDENTITY,
    email         TEXT NOT NULL,
    password_hash TEXT,
    full_name     TEXT,
    avatar_url    TEXT,
    currency      TEXT,
    locale        TEXT,
    active        BOOLEAN NOT NULL,
    created       TIMESTAMPTZ NOT NULL,
    updated       TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_user PRIMARY KEY ("user"),
    CONSTRAINT uq_user_email UNIQUE (email)
);

CREATE TABLE "role" (
    "role"  BIGINT GENERATED ALWAYS AS IDENTITY,
    code    TEXT NOT NULL,
    name    TEXT NOT NULL,
    active  BOOLEAN NOT NULL,
    created TIMESTAMPTZ NOT NULL,
    updated TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_role PRIMARY KEY ("role"),
    CONSTRAINT uq_role_code UNIQUE (code)
);

CREATE TABLE user_role (
    user_role BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"    BIGINT NOT NULL,
    "role"    BIGINT NOT NULL,
    active    BOOLEAN NOT NULL,
    created   TIMESTAMPTZ NOT NULL,
    updated   TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_user_role PRIMARY KEY (user_role),
    CONSTRAINT uq_user_role UNIQUE ("user", "role"),
    CONSTRAINT fk_user_role_user FOREIGN KEY ("user") REFERENCES "user" ("user"),
    CONSTRAINT fk_user_role_role FOREIGN KEY ("role") REFERENCES "role" ("role")
);

CREATE TABLE settings_salary (
    settings_salary          BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"                   BIGINT NOT NULL,
    date_start               DATE NOT NULL,
    date_end                 DATE NOT NULL,
    hourly_rate              NUMERIC(15, 2),
    base_salary              NUMERIC(15, 2),
    inss_discount_percentage NUMERIC(15, 2),
    admin_fee_percentage     NUMERIC(15, 2),
    active                   BOOLEAN NOT NULL,
    created                  TIMESTAMPTZ NOT NULL,
    updated                  TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_settings_salary PRIMARY KEY (settings_salary),
    CONSTRAINT uq_settings_salary_period UNIQUE ("user", date_start, date_end),
    CONSTRAINT fk_settings_salary_user FOREIGN KEY ("user") REFERENCES "user" ("user")
);

CREATE TABLE bank_account (
    bank_account    BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"          BIGINT NOT NULL,
    account_type    BIGINT NOT NULL,
    name            TEXT,
    initial_balance NUMERIC(15, 2),
    current_balance NUMERIC(15, 2),
    color           TEXT,
    icon            TEXT,
    notes           TEXT,
    pluggy_account  TEXT,
    active          BOOLEAN NOT NULL,
    created         TIMESTAMPTZ NOT NULL,
    updated         TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_bank_account PRIMARY KEY (bank_account),
    CONSTRAINT fk_bank_account_user FOREIGN KEY ("user")        REFERENCES "user" ("user"),
    CONSTRAINT fk_bank_account_type FOREIGN KEY (account_type)  REFERENCES account_type (account_type)
);

CREATE INDEX idx_bank_account_user ON bank_account ("user") WHERE active;

CREATE TABLE category (
    category      BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"        BIGINT NOT NULL,
    category_type BIGINT NOT NULL,
    name          TEXT NOT NULL,
    color         TEXT,
    icon          TEXT,
    active        BOOLEAN NOT NULL,
    created       TIMESTAMPTZ NOT NULL,
    updated       TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_category PRIMARY KEY (category),
    CONSTRAINT fk_category_user FOREIGN KEY ("user")         REFERENCES "user" ("user"),
    CONSTRAINT fk_category_type FOREIGN KEY (category_type)  REFERENCES category_type (category_type)
);

CREATE INDEX idx_category_user ON category ("user") WHERE active;
CREATE UNIQUE INDEX uq_category_user_type_name
    ON category ("user", category_type, name) WHERE active;

CREATE TABLE credit_card (
    credit_card  BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"       BIGINT NOT NULL,
    bank_account BIGINT NOT NULL,
    name         TEXT NOT NULL,
    color        TEXT NOT NULL,
    credit_limit NUMERIC(15, 2) NOT NULL,
    notes        TEXT,
    active       BOOLEAN NOT NULL,
    created      TIMESTAMPTZ NOT NULL,
    updated      TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_credit_card PRIMARY KEY (credit_card),
    CONSTRAINT fk_credit_card_user FOREIGN KEY ("user")        REFERENCES "user" ("user"),
    CONSTRAINT fk_credit_card_bank_account FOREIGN KEY (bank_account) REFERENCES bank_account (bank_account)
);

CREATE INDEX idx_credit_card_user ON credit_card ("user") WHERE active;
CREATE INDEX idx_credit_card_bank_account ON credit_card (bank_account);

CREATE TABLE credit_card_invoice (
    credit_card_invoice BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"              BIGINT NOT NULL,
    card                BIGINT NOT NULL,
    invoice_status      BIGINT NOT NULL,
    month_key           TEXT NOT NULL,
    closing_date        DATE,
    due_date            DATE,
    total_amount        NUMERIC(15, 2),
    paid_amount         NUMERIC(15, 2),
    closed_at           TIMESTAMPTZ,
    paid_at             TIMESTAMPTZ,
    active              BOOLEAN NOT NULL,
    created             TIMESTAMPTZ NOT NULL,
    updated             TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_credit_card_invoice PRIMARY KEY (credit_card_invoice),
    CONSTRAINT uq_credit_card_invoice_card_month UNIQUE (card, month_key),
    CONSTRAINT fk_credit_card_invoice_user   FOREIGN KEY ("user")          REFERENCES "user" ("user"),
    CONSTRAINT fk_credit_card_invoice_card   FOREIGN KEY (card)            REFERENCES credit_card (credit_card),
    CONSTRAINT fk_credit_card_invoice_status FOREIGN KEY (invoice_status)  REFERENCES invoice_status (invoice_status)
);

CREATE INDEX idx_credit_card_invoice_card_status ON credit_card_invoice (card, invoice_status);
CREATE INDEX idx_credit_card_invoice_user_status ON credit_card_invoice ("user", invoice_status);

CREATE TABLE credit_card_statement_cycle (
    credit_card_statement_cycle BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"      BIGINT NOT NULL,
    card        BIGINT NOT NULL,
    date_start  DATE,
    date_end    DATE,
    closing_day SMALLINT,
    due_day     SMALLINT,
    notes       TEXT,
    active      BOOLEAN NOT NULL,
    created     TIMESTAMPTZ NOT NULL,
    updated     TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_credit_card_statement_cycle PRIMARY KEY (credit_card_statement_cycle),
    CONSTRAINT uq_credit_card_statement_cycle_card_start UNIQUE (card, date_start),
    CONSTRAINT fk_credit_card_statement_cycle_user FOREIGN KEY ("user") REFERENCES "user" ("user"),
    CONSTRAINT fk_credit_card_statement_cycle_card FOREIGN KEY (card)   REFERENCES credit_card (credit_card)
);

CREATE INDEX idx_credit_card_statement_cycle_user ON credit_card_statement_cycle ("user");
CREATE INDEX idx_credit_card_statement_cycle_card ON credit_card_statement_cycle (card);

CREATE TABLE installment_group (
    installment_group  BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"             BIGINT NOT NULL,
    total_installments INTEGER NOT NULL,
    active             BOOLEAN NOT NULL,
    created            TIMESTAMPTZ NOT NULL,
    updated            TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_installment_group PRIMARY KEY (installment_group),
    CONSTRAINT fk_installment_group_user FOREIGN KEY ("user") REFERENCES "user" ("user")
);

CREATE INDEX idx_installment_group_user ON installment_group ("user");

CREATE TABLE recurring_group (
    recurring_group BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"          BIGINT NOT NULL,
    active          BOOLEAN NOT NULL,
    created         TIMESTAMPTZ NOT NULL,
    updated         TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_recurring_group PRIMARY KEY (recurring_group),
    CONSTRAINT fk_recurring_group_user FOREIGN KEY ("user") REFERENCES "user" ("user")
);

CREATE INDEX idx_recurring_group_user ON recurring_group ("user");

CREATE TABLE "transaction" (
    "transaction"      BIGINT GENERATED ALWAYS AS IDENTITY,
    "user"             BIGINT NOT NULL,
    transaction_type   BIGINT NOT NULL,
    payment_method     BIGINT,
    amount             NUMERIC(15, 2),
    payment_date       DATE,
    purchase_date      DATE,
    description        TEXT,
    account            BIGINT,
    to_account         BIGINT,
    card               BIGINT,
    category           BIGINT,
    invoice            BIGINT,
    installment_group  BIGINT,
    installment_number INTEGER,
    recurring_group    BIGINT,
    fixed              BOOLEAN NOT NULL,
    paid               BOOLEAN NOT NULL,
    notes              TEXT,
    active             BOOLEAN NOT NULL,
    created            TIMESTAMPTZ NOT NULL,
    updated            TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_transaction PRIMARY KEY ("transaction"),
    CONSTRAINT fk_transaction_type        FOREIGN KEY (transaction_type)  REFERENCES transaction_type (transaction_type),
    CONSTRAINT fk_transaction_method      FOREIGN KEY (payment_method)    REFERENCES payment_method (payment_method),
    CONSTRAINT fk_transaction_user        FOREIGN KEY ("user")            REFERENCES "user" ("user"),
    CONSTRAINT fk_transaction_account     FOREIGN KEY (account)           REFERENCES bank_account (bank_account),
    CONSTRAINT fk_transaction_to_account  FOREIGN KEY (to_account)        REFERENCES bank_account (bank_account),
    CONSTRAINT fk_transaction_card        FOREIGN KEY (card)              REFERENCES credit_card (credit_card),
    CONSTRAINT fk_transaction_category    FOREIGN KEY (category)          REFERENCES category (category),
    CONSTRAINT fk_transaction_invoice     FOREIGN KEY (invoice)           REFERENCES credit_card_invoice (credit_card_invoice),
    CONSTRAINT fk_transaction_installment FOREIGN KEY (installment_group) REFERENCES installment_group (installment_group),
    CONSTRAINT fk_transaction_recurring   FOREIGN KEY (recurring_group)   REFERENCES recurring_group (recurring_group)
);

CREATE INDEX idx_transaction_user_payment_date ON "transaction" ("user", payment_date DESC);
CREATE INDEX idx_transaction_user_type_date    ON "transaction" ("user", transaction_type, payment_date DESC);
CREATE INDEX idx_transaction_account_paid      ON "transaction" (account, paid)    WHERE account IS NOT NULL;
CREATE INDEX idx_transaction_to_account_paid   ON "transaction" (to_account, paid) WHERE to_account IS NOT NULL;
CREATE INDEX idx_transaction_card     ON "transaction" (card)              WHERE card IS NOT NULL;
CREATE INDEX idx_transaction_category ON "transaction" (category)          WHERE category IS NOT NULL;
CREATE INDEX idx_transaction_invoice  ON "transaction" (invoice)           WHERE invoice IS NOT NULL;
CREATE INDEX idx_transaction_installment ON "transaction" (installment_group) WHERE installment_group IS NOT NULL;
CREATE INDEX idx_transaction_recurring   ON "transaction" (recurring_group)   WHERE recurring_group IS NOT NULL;

CREATE TABLE system_config (
    system_config BIGINT GENERATED ALWAYS AS IDENTITY,
    key           TEXT NOT NULL,
    value         NUMERIC(15, 2) NOT NULL,
    active        BOOLEAN NOT NULL,
    created       TIMESTAMPTZ NOT NULL,
    updated       TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_system_config PRIMARY KEY (system_config),
    CONSTRAINT uq_system_config_key UNIQUE (key)
);

CREATE TABLE audit_log (
    audit_log    BIGINT GENERATED ALWAYS AS IDENTITY,
    audit_action BIGINT NOT NULL,
    table_name   TEXT NOT NULL,
    record       BIGINT NOT NULL,
    old_data     JSONB,
    new_data     JSONB,
    changed_by   BIGINT,
    description  TEXT,
    created      TIMESTAMPTZ NOT NULL,
    updated      TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_audit_log PRIMARY KEY (audit_log),
    CONSTRAINT fk_audit_log_action FOREIGN KEY (audit_action) REFERENCES audit_action (audit_action)
);

CREATE INDEX idx_audit_log_record ON audit_log (table_name, record);
CREATE INDEX idx_audit_log_actor  ON audit_log (changed_by, created DESC);
CREATE INDEX idx_audit_log_time   ON audit_log (created DESC);

INSERT INTO account_type (code, name, active, created, updated) VALUES
    ('checking',   'Conta corrente', TRUE, now(), now()),
    ('savings',    'Poupanca',       TRUE, now(), now()),
    ('investment', 'Investimento',   TRUE, now(), now()),
    ('wallet',     'Carteira',       TRUE, now(), now()),
    ('other',      'Outro',          TRUE, now(), now());

INSERT INTO category_type (code, name, active, created, updated) VALUES
    ('income',  'Receita', TRUE, now(), now()),
    ('expense', 'Despesa', TRUE, now(), now());

INSERT INTO transaction_type (code, name, active, created, updated) VALUES
    ('income',   'Receita',       TRUE, now(), now()),
    ('expense',  'Despesa',       TRUE, now(), now()),
    ('transfer', 'Transferencia', TRUE, now(), now());

INSERT INTO payment_method (code, name, active, created, updated) VALUES
    ('credit',       'Credito',             TRUE, now(), now()),
    ('debit',        'Debito',              TRUE, now(), now()),
    ('pix',          'Pix',                 TRUE, now(), now()),
    ('cash',         'Dinheiro',            TRUE, now(), now()),
    ('bill_payment', 'Pagamento de boleto', TRUE, now(), now()),
    ('transfer',     'Transferencia',       TRUE, now(), now()),
    ('other',        'Outro',               TRUE, now(), now());

INSERT INTO invoice_status (code, name, active, created, updated) VALUES
    ('open',    'Aberta',  TRUE, now(), now()),
    ('closed',  'Fechada', TRUE, now(), now()),
    ('partial', 'Parcial', TRUE, now(), now()),
    ('paid',    'Paga',    TRUE, now(), now()),
    ('overdue', 'Vencida', TRUE, now(), now());

INSERT INTO audit_action (code, name, active, created, updated) VALUES
    ('INSERT', 'Insercao',  TRUE, now(), now()),
    ('UPDATE', 'Alteracao', TRUE, now(), now()),
    ('DELETE', 'Exclusao',  TRUE, now(), now());

INSERT INTO "role" (code, name, active, created, updated) VALUES
    ('admin', 'Administrador', TRUE, now(), now()),
    ('user',  'Usuario',       TRUE, now(), now());

INSERT INTO system_config (key, value, active, created, updated) VALUES
    ('teto_inss', 1167.89, TRUE, now(), now());

COMMIT;
