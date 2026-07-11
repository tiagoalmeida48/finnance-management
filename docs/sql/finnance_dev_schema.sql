create table account_type (
                              account_type int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                              "name" text not null,
                              active bool not null,
                              created timestamptz not null,
                              updated timestamptz not null,
                              constraint pk_account_type primary key (account_type)
);

create unique index uq_account_type_name on
    public.account_type
    using btree (name);

create table audit_action (
                              audit_action int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                              "name" text not null,
                              active bool not null,
                              created timestamptz not null,
                              updated timestamptz not null,
                              constraint pk_audit_action primary key (audit_action)
);

create unique index uq_audit_action_name on
    public.audit_action
    using btree (name);

create table category_type (
                               category_type int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                               "name" text not null,
                               active bool not null,
                               created timestamptz not null,
                               updated timestamptz not null,
                               constraint pk_category_type primary key (category_type)
);

create unique index uq_category_type_name on
    public.category_type
    using btree (name);

create table invoice_status (
                                invoice_status int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                "name" text not null,
                                active bool not null,
                                created timestamptz not null,
                                updated timestamptz not null,
                                constraint pk_invoice_status primary key (invoice_status)
);

create unique index uq_invoice_status_name on
    public.invoice_status
    using btree (name);

create table payment_method (
                                payment_method int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                "name" text not null,
                                active bool not null,
                                created timestamptz not null,
                                updated timestamptz not null,
                                constraint pk_payment_method primary key (payment_method)
);

create unique index uq_payment_method_name on
    public.payment_method
    using btree (name);

create table subscription_status (
                                     subscription_status int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                     "name" text not null,
                                     active bool not null,
                                     created timestamptz not null,
                                     updated timestamptz not null,
                                     constraint pk_subscription_status primary key (subscription_status)
);

create unique index uq_subscription_status_name on
    public.subscription_status
    using btree (name);

create table system_config (
                               system_config int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                               "key" text not null,
                               value numeric(15, 2) not null,
                               active bool not null,
                               created timestamptz not null,
                               updated timestamptz not null,
                               constraint pk_system_config primary key (system_config),
                               constraint uq_system_config_key unique (key)
);

create table transaction_type (
                                  transaction_type int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                  "name" text not null,
                                  active bool not null,
                                  created timestamptz not null,
                                  updated timestamptz not null,
                                  constraint pk_transaction_type primary key (transaction_type)
);

create unique index uq_transaction_type_name on
    public.transaction_type
    using btree (name);

create table "user" (
                        "user" int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                        email text not null,
                        password_hash text null,
                        full_name text null,
                        avatar_url text null,
                        currency text null,
                        locale text null,
                        active bool not null,
                        is_admin bool default false not null,
                        created timestamptz null,
                        updated timestamptz null,
                        email_verified bool default false not null,
                        verify_token text null,
                        verify_token_expires timestamptz null,
                        reset_token text null,
                        reset_token_expires timestamptz null,
                        subscription_blocked bool default false not null,
                        phone text null,
                        marketing_consent bool default false not null,
                        marketing_consent_at timestamptz null,
                        marketing_consent_source text null,
                        marketing_consent_version text null,
                        marketing_opt_out_at timestamptz null,
                        token_version int4 default 0 not null,
                        constraint ck_user_token_version check ((token_version >= 0)),
                        constraint pk_user primary key ("user")
);

create index idx_user_marketing_consent on
    public."user"
    using btree (marketing_consent)
    where
    (marketing_consent = true);

create index idx_user_reset_token on
    public."user"
    using btree (reset_token)
    where
    (reset_token is not null);

create index idx_user_verify_token on
    public."user"
    using btree (verify_token)
    where
    (verify_token is not null);

create unique index uq_user_email_normalized on
    public."user"
    using btree (lower(btrim(email)));

create table audit_log (
                           audit_log int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                           audit_action int8 not null,
                           table_name text not null,
                           record int8 not null,
                           old_data jsonb null,
                           new_data jsonb null,
                           changed_by int8 null,
                           description text null,
                           created timestamptz not null,
                           updated timestamptz not null,
                           constraint pk_audit_log primary key (audit_log),
                           constraint fk_audit_log_action foreign key (audit_action) references audit_action(audit_action),
                           constraint fk_audit_log_user foreign key (changed_by) references "user"("user")
);

create index idx_audit_log_actor on
    public.audit_log
    using btree (changed_by,
    created desc);

create index idx_audit_log_record on
    public.audit_log
    using btree (table_name,
    record);

create index idx_audit_log_time_brin on
    public.audit_log
    using brin (created);

create table bank_account (
                              bank_account int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                              "user" int8 not null,
                              account_type int8 not null,
                              "name" text null,
                              initial_balance numeric(15, 2) null,
                              current_balance numeric(15, 2) null,
                              color text null,
                              icon text null,
                              notes text null,
                              active bool not null,
                              created timestamptz not null,
                              updated timestamptz not null,
                              constraint pk_bank_account primary key (bank_account),
                              constraint fk_bank_account_type foreign key (account_type) references account_type(account_type),
                              constraint fk_bank_account_user foreign key ("user") references "user"("user")
)
    with (
        fillfactor = 85,
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_scale_factor = 0.02
        );

create index idx_bank_account_user on
    public.bank_account
    using btree ("user")
    where
    active;

create table category (
                          category int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                          "user" int8 not null,
                          category_type int8 not null,
                          "name" text not null,
                          color text null,
                          icon text null,
                          active bool not null,
                          created timestamptz not null,
                          updated timestamptz not null,
                          constraint pk_category primary key (category),
                          constraint fk_category_type foreign key (category_type) references category_type(category_type),
                          constraint fk_category_user foreign key ("user") references "user"("user")
);

create index idx_category_user on
    public.category
    using btree ("user")
    where
    active;

create unique index uq_category_user_type_name on
    public.category
    using btree ("user",
    category_type,
    name)
    where
    active;

create table credit_card (
                             credit_card int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                             "user" int8 not null,
                             bank_account int8 not null,
                             "name" text not null,
                             color text not null,
                             credit_limit numeric(15, 2) not null,
                             notes text null,
                             active bool not null,
                             created timestamptz not null,
                             updated timestamptz not null,
                             constraint pk_credit_card primary key (credit_card),
                             constraint fk_credit_card_bank_account foreign key (bank_account) references bank_account(bank_account),
                             constraint fk_credit_card_user foreign key ("user") references "user"("user")
);

create index idx_credit_card_bank_account on
    public.credit_card
    using btree (bank_account);

create index idx_credit_card_user on
    public.credit_card
    using btree ("user")
    where
    active;

create table credit_card_invoice (
                                     credit_card_invoice int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                     "user" int8 not null,
                                     card int8 not null,
                                     invoice_status int8 not null,
                                     month_key text not null,
                                     closing_date date null,
                                     due_date date null,
                                     total_amount numeric(15, 2) null,
                                     paid_amount numeric(15, 2) null,
                                     closed_at timestamptz null,
                                     paid_at timestamptz null,
                                     active bool not null,
                                     created timestamptz not null,
                                     updated timestamptz not null,
                                     constraint pk_credit_card_invoice primary key (credit_card_invoice),
                                     constraint uq_credit_card_invoice_card_month unique (card,
                                                                                          month_key),
                                     constraint fk_credit_card_invoice_card foreign key (card) references credit_card(credit_card),
                                     constraint fk_credit_card_invoice_status foreign key (invoice_status) references invoice_status(invoice_status),
                                     constraint fk_credit_card_invoice_user foreign key ("user") references "user"("user")
)
    with (
        fillfactor = 85,
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_scale_factor = 0.02
        );

create index idx_credit_card_invoice_card_status on
    public.credit_card_invoice
    using btree (card,
    invoice_status);

create index idx_credit_card_invoice_user_status on
    public.credit_card_invoice
    using btree ("user",
    invoice_status);

create table credit_card_statement_cycle (
                                             credit_card_statement_cycle int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                             "user" int8 not null,
                                             card int8 not null,
                                             date_start date null,
                                             date_end date null,
                                             closing_day int2 null,
                                             due_day int2 null,
                                             notes text null,
                                             active bool not null,
                                             created timestamptz not null,
                                             updated timestamptz not null,
                                             constraint chk_cycle_days check ((((closing_day is null)
                                                 or ((closing_day >= 1)
                                                     and (closing_day <= 31)))
                                                 and ((due_day is null)
                                                     or ((due_day >= 1)
                                                         and (due_day <= 31))))),
                                             constraint pk_credit_card_statement_cycle primary key (credit_card_statement_cycle),
                                             constraint uq_credit_card_statement_cycle_card_start unique (card,
                                                                                                          date_start),
                                             constraint fk_credit_card_statement_cycle_card foreign key (card) references credit_card(credit_card),
                                             constraint fk_credit_card_statement_cycle_user foreign key ("user") references "user"("user")
);

create index idx_credit_card_statement_cycle_card on
    public.credit_card_statement_cycle
    using btree (card);

create index idx_credit_card_statement_cycle_user on
    public.credit_card_statement_cycle
    using btree ("user");

create unique index uq_card_open_cycle on
    public.credit_card_statement_cycle
    using btree (card)
    where
    (date_end = '9999-12-31'::date);

create table installment_group (
                                   installment_group int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                   "user" int8 not null,
                                   total_installments int4 not null,
                                   active bool not null,
                                   created timestamptz not null,
                                   updated timestamptz not null,
                                   constraint pk_installment_group primary key (installment_group),
                                   constraint fk_installment_group_user foreign key ("user") references "user"("user")
);

create index idx_installment_group_user on
    public.installment_group
    using btree ("user");

create table kiwify_webhook_event (
                                      kiwify_webhook_event int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                      event_type text null,
                                      kiwify_order_id text null,
                                      kiwify_subscription_id text null,
                                      customer_email text null,
                                      payload jsonb null,
                                      processed bool default false not null,
                                      process_error text null,
                                      "user" int8 null,
                                      created timestamptz not null,
                                      updated timestamptz not null,
                                      customer_name text null,
                                      order_status text null,
                                      product_id text null,
                                      product_name text null,
                                      plan_name text null,
                                      plan_frequency text null,
                                      charge_amount numeric(15, 2) default 0 not null,
                                      start_date timestamptz null,
                                      next_payment timestamptz null,
                                      source_event_at timestamptz not null,
                                      event_fingerprint text not null,
                                      process_attempts int4 default 0 not null,
                                      next_attempt_at timestamptz null,
                                      processing_at timestamptz null,
                                      customer_phone text null,
                                      constraint pk_kiwify_webhook_event primary key (kiwify_webhook_event),
                                      constraint fk_kiwify_webhook_event_user foreign key ("user") references "user"("user")
);

create index idx_kiwify_webhook_event_email on
    public.kiwify_webhook_event
    using btree (customer_email);

create index idx_kiwify_webhook_event_pending on
    public.kiwify_webhook_event
    using btree (next_attempt_at,
    source_event_at)
    where
    (processed = false);

create index idx_kiwify_webhook_event_subscription on
    public.kiwify_webhook_event
    using btree (kiwify_subscription_id);

create index idx_kiwify_webhook_event_unprocessed on
    public.kiwify_webhook_event
    using btree (processed)
    where
    (processed = false);

create unique index uq_kiwify_webhook_event_fingerprint on
    public.kiwify_webhook_event
    using btree (event_fingerprint);

create table recurring_group (
                                 recurring_group int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                 "user" int8 not null,
                                 active bool not null,
                                 created timestamptz not null,
                                 updated timestamptz not null,
                                 constraint pk_recurring_group primary key (recurring_group),
                                 constraint fk_recurring_group_user foreign key ("user") references "user"("user")
);

create index idx_recurring_group_user on
    public.recurring_group
    using btree ("user");

create table settings_salary (
                                 settings_salary int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                 "user" int8 not null,
                                 date_start date not null,
                                 date_end date not null,
                                 hourly_rate numeric(15, 2) null,
                                 base_salary numeric(15, 2) null,
                                 inss_discount_percentage numeric(15, 2) null,
                                 admin_fee_percentage numeric(15, 2) null,
                                 active bool not null,
                                 created timestamptz not null,
                                 updated timestamptz not null,
                                 constraint chk_settings_salary_percent check ((((inss_discount_percentage is null)
                                     or ((inss_discount_percentage >= (0)::numeric)
                                         and (inss_discount_percentage <= (100)::numeric)))
                                     and ((admin_fee_percentage is null)
                                         or ((admin_fee_percentage >= (0)::numeric)
                                             and (admin_fee_percentage <= (100)::numeric))))),
                                 constraint pk_settings_salary primary key (settings_salary),
                                 constraint uq_settings_salary_period unique ("user",
                                                                              date_start,
                                                                              date_end),
                                 constraint fk_settings_salary_user foreign key ("user") references "user"("user")
);

create table "subscription" (
                                "subscription" int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                                "user" int8 not null,
                                subscription_status int8 not null,
                                kiwify_subscription_id text null,
                                kiwify_order_id text null,
                                kiwify_product_id text null,
                                kiwify_product_name text null,
                                customer_email text null,
                                plan_name text null,
                                plan_frequency text null,
                                charge_amount numeric(15, 2) null,
                                start_date timestamptz null,
                                next_payment timestamptz null,
                                canceled_at timestamptz null,
                                last_event_at timestamptz null,
                                active bool default true not null,
                                created timestamptz not null,
                                updated timestamptz not null,
                                source_event_at timestamptz null,
                                entitled_until timestamptz null,
                                constraint pk_subscription primary key (subscription),
                                constraint fk_subscription_status foreign key (subscription_status) references subscription_status(subscription_status),
                                constraint fk_subscription_user foreign key ("user") references "user"("user")
);

create index idx_subscription_entitlement on
    public.subscription
    using btree ("user",
    entitled_until)
    where
    (active = true);

create index idx_subscription_status on
    public.subscription
    using btree (subscription_status);

create index idx_subscription_user on
    public.subscription
    using btree ("user");

create unique index uq_subscription_kiwify_id on
    public.subscription
    using btree (kiwify_subscription_id)
    where
    (kiwify_subscription_id is not null);

create table "transaction" (
                               "transaction" int8 generated always as identity( increment by 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1 no cycle) not null,
                               "user" int8 not null,
                               transaction_type int8 not null,
                               payment_method int8 null,
                               amount numeric(15, 2) null,
                               payment_date date null,
                               purchase_date date null,
                               description text null,
                               account int8 null,
                               to_account int8 null,
                               card int8 null,
                               category int8 null,
                               invoice int8 null,
                               installment_group int8 null,
                               installment_number int4 null,
                               recurring_group int8 null,
                               fixed bool not null,
                               paid bool not null,
                               notes text null,
                               active bool not null,
                               created timestamptz not null,
                               updated timestamptz not null,
                               constraint chk_transaction_amount_positive check (((amount is null)
                                   or (amount > (0)::numeric))),
                               constraint chk_transaction_card_has_account check (((card is null)
                                   or (account is not null))),
                               constraint chk_transaction_transfer_account check (((to_account is null)
                                   or (transaction_type = 3))),
                               constraint pk_transaction primary key (transaction),
                               constraint fk_transaction_account foreign key (account) references bank_account(bank_account),
                               constraint fk_transaction_card foreign key (card) references credit_card(credit_card),
                               constraint fk_transaction_category foreign key (category) references category(category),
                               constraint fk_transaction_installment foreign key (installment_group) references installment_group(installment_group),
                               constraint fk_transaction_invoice foreign key (invoice) references credit_card_invoice(credit_card_invoice),
                               constraint fk_transaction_method foreign key (payment_method) references payment_method(payment_method),
                               constraint fk_transaction_recurring foreign key (recurring_group) references recurring_group(recurring_group),
                               constraint fk_transaction_to_account foreign key (to_account) references bank_account(bank_account),
                               constraint fk_transaction_type foreign key (transaction_type) references transaction_type(transaction_type),
                               constraint fk_transaction_user foreign key ("user") references "user"("user")
)
    with (
        fillfactor = 90
        );

create index idx_transaction_account_paid on
    public.transaction
    using btree (account,
    paid)
    where
    (account is not null);

create index idx_transaction_card on
    public.transaction
    using btree (card)
    where
    (card is not null);

create index idx_transaction_category on
    public.transaction
    using btree (category)
    where
    (category is not null);

create index idx_transaction_installment on
    public.transaction
    using btree (installment_group)
    where
    (installment_group is not null);

create index idx_transaction_invoice on
    public.transaction
    using btree (invoice) include (amount,
    paid,
    transaction_type)
    where
    (invoice is not null);

create index idx_transaction_recurring on
    public.transaction
    using btree (recurring_group)
    where
    (recurring_group is not null);

create index idx_transaction_to_account_paid on
    public.transaction
    using btree (to_account,
    paid)
    where
    (to_account is not null);

create index idx_transaction_user_payment_date on
    public.transaction
    using btree ("user",
    payment_date desc);

create index idx_transaction_user_type_date on
    public.transaction
    using btree ("user",
    transaction_type,
    payment_date desc) include (amount,
    card,
    paid,
    category);
