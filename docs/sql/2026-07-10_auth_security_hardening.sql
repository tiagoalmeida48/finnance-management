ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS token_version int4 DEFAULT 0 NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_user_token_version') THEN
        ALTER TABLE "user"
            ADD CONSTRAINT ck_user_token_version CHECK (token_version >= 0);
    END IF;
END
$$;

UPDATE "user"
SET reset_token = NULL,
    reset_token_expires = NULL,
    verify_token = NULL,
    verify_token_expires = NULL,
    updated = now()
WHERE reset_token IS NOT NULL OR verify_token IS NOT NULL;
