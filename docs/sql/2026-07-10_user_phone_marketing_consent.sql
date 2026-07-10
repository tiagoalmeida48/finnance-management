ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS phone text NULL,
    ADD COLUMN IF NOT EXISTS marketing_consent bool DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS marketing_consent_source text NULL,
    ADD COLUMN IF NOT EXISTS marketing_consent_version text NULL,
    ADD COLUMN IF NOT EXISTS marketing_opt_out_at timestamptz NULL;

ALTER TABLE kiwify_webhook_event
    ADD COLUMN IF NOT EXISTS customer_phone text NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_user_phone_format') THEN
        ALTER TABLE "user"
            ADD CONSTRAINT ck_user_phone_format CHECK (phone IS NULL OR phone ~ '^\+[0-9]{10,15}$');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_user_marketing_consent_phone') THEN
        ALTER TABLE "user"
            ADD CONSTRAINT ck_user_marketing_consent_phone CHECK (marketing_consent = false OR phone IS NOT NULL);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_marketing_consent
    ON "user" (marketing_consent)
    WHERE marketing_consent = true;
