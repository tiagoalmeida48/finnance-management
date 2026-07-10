CREATE TABLE subscription_status (
    subscription_status int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    "name" text NOT NULL,
    active bool NOT NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL,
    CONSTRAINT pk_subscription_status PRIMARY KEY (subscription_status)
);
CREATE UNIQUE INDEX uq_subscription_status_name ON public.subscription_status USING btree (name);

CREATE TABLE subscription (
    subscription int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    "user" int8 NOT NULL,
    subscription_status int8 NOT NULL,
    kiwify_subscription_id text NULL,
    kiwify_order_id text NULL,
    kiwify_product_id text NULL,
    kiwify_product_name text NULL,
    customer_email text NULL,
    plan_name text NULL,
    plan_frequency text NULL,
    charge_amount numeric(15, 2) NULL,
    start_date timestamptz NULL,
    next_payment timestamptz NULL,
    canceled_at timestamptz NULL,
    last_event_at timestamptz NULL,
    active bool DEFAULT true NOT NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL,
    CONSTRAINT pk_subscription PRIMARY KEY (subscription),
    CONSTRAINT fk_subscription_user FOREIGN KEY ("user") REFERENCES "user"("user"),
    CONSTRAINT fk_subscription_status FOREIGN KEY (subscription_status) REFERENCES subscription_status(subscription_status)
);
CREATE UNIQUE INDEX uq_subscription_kiwify_id ON public.subscription USING btree (kiwify_subscription_id) WHERE (kiwify_subscription_id IS NOT NULL);
CREATE INDEX idx_subscription_user ON public.subscription USING btree ("user");
CREATE INDEX idx_subscription_status ON public.subscription USING btree (subscription_status);

CREATE TABLE kiwify_webhook_event (
    kiwify_webhook_event int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    event_type text NULL,
    kiwify_order_id text NULL,
    kiwify_subscription_id text NULL,
    customer_email text NULL,
    payload jsonb NULL,
    processed bool DEFAULT false NOT NULL,
    process_error text NULL,
    "user" int8 NULL,
    created timestamptz NOT NULL,
    updated timestamptz NOT NULL,
    CONSTRAINT pk_kiwify_webhook_event PRIMARY KEY (kiwify_webhook_event),
    CONSTRAINT fk_kiwify_webhook_event_user FOREIGN KEY ("user") REFERENCES "user"("user")
);
CREATE INDEX idx_kiwify_webhook_event_unprocessed ON public.kiwify_webhook_event USING btree (processed) WHERE (processed = false);
CREATE INDEX idx_kiwify_webhook_event_email ON public.kiwify_webhook_event USING btree (customer_email);
CREATE INDEX idx_kiwify_webhook_event_subscription ON public.kiwify_webhook_event USING btree (kiwify_subscription_id);
