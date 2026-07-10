ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS subscription_blocked bool DEFAULT false NOT NULL;

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS uq_user_email;
DROP INDEX IF EXISTS uq_user_email;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_email_normalized ON "user" (LOWER(BTRIM(email)));

ALTER TABLE subscription
    ADD COLUMN IF NOT EXISTS source_event_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS entitled_until timestamptz NULL;

UPDATE subscription
SET source_event_at = COALESCE(source_event_at, last_event_at, updated),
    entitled_until = COALESCE(entitled_until, next_payment);

ALTER TABLE kiwify_webhook_event
    ADD COLUMN IF NOT EXISTS customer_name text NULL,
    ADD COLUMN IF NOT EXISTS customer_phone text NULL,
    ADD COLUMN IF NOT EXISTS order_status text NULL,
    ADD COLUMN IF NOT EXISTS product_id text NULL,
    ADD COLUMN IF NOT EXISTS product_name text NULL,
    ADD COLUMN IF NOT EXISTS plan_name text NULL,
    ADD COLUMN IF NOT EXISTS plan_frequency text NULL,
    ADD COLUMN IF NOT EXISTS charge_amount numeric(15, 2) DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS start_date timestamptz NULL,
    ADD COLUMN IF NOT EXISTS next_payment timestamptz NULL,
    ADD COLUMN IF NOT EXISTS source_event_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS event_fingerprint text NULL,
    ADD COLUMN IF NOT EXISTS process_attempts int4 DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS processing_at timestamptz NULL;

UPDATE kiwify_webhook_event
SET order_status = COALESCE(order_status, payload->>'order_status'),
    customer_phone = COALESCE(customer_phone, payload->'Customer'->>'mobile'),
    product_id = COALESCE(product_id, payload->'Product'->>'product_id'),
    product_name = COALESCE(product_name, payload->'Product'->>'product_name'),
    plan_name = COALESCE(plan_name, payload->'Subscription'->'plan'->>'name'),
    plan_frequency = COALESCE(plan_frequency, payload->'Subscription'->'plan'->>'frequency'),
    start_date = COALESCE(start_date, NULLIF(payload->'Subscription'->>'start_date', '')::timestamptz),
    next_payment = COALESCE(next_payment, NULLIF(payload->'Subscription'->>'next_payment', '')::timestamptz),
    charge_amount = CASE
        WHEN payload->'Commissions'->>'charge_amount' ~ '^[0-9]+([.][0-9]+)?$'
            THEN (payload->'Commissions'->>'charge_amount')::numeric / 100
        ELSE charge_amount
    END,
    source_event_at = COALESCE(source_event_at, created),
    event_fingerprint = COALESCE(event_fingerprint, MD5(COALESCE(payload::text, '') || ':' || kiwify_webhook_event::text)),
    next_attempt_at = CASE WHEN processed THEN NULL ELSE COALESCE(next_attempt_at, now()) END;

UPDATE kiwify_webhook_event SET payload = NULL;

ALTER TABLE kiwify_webhook_event
    ALTER COLUMN source_event_at SET NOT NULL,
    ALTER COLUMN event_fingerprint SET NOT NULL,
    ALTER COLUMN payload DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_kiwify_webhook_event_fingerprint
    ON kiwify_webhook_event (event_fingerprint);

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_event_pending
    ON kiwify_webhook_event (next_attempt_at, source_event_at)
    WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_subscription_entitlement
    ON subscription ("user", entitled_until)
    WHERE active = true;
