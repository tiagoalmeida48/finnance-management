-- Revoga acesso de anon ao schema public via REST introspection.
-- anon não consegue mais listar tabelas/colunas via OPTIONS /rest/v1/
REVOKE USAGE ON SCHEMA public FROM anon;
