-- 2026-06-30 — Fase 0 SaaS: cadastro publico, verificacao de e-mail e reset de senha
-- Colunas de verificacao/token na tabela "user".

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS verify_token text NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS verify_token_expires timestamptz NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token text NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_token_expires timestamptz NULL;

-- Grandfather: usuarios existentes ficam verificados (nao quebra login atual).
UPDATE "user" SET email_verified = true WHERE email_verified = false;

CREATE INDEX IF NOT EXISTS idx_user_verify_token ON "user" (verify_token) WHERE verify_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_reset_token ON "user" (reset_token) WHERE reset_token IS NOT NULL;
