# 07 — Autenticação, Perfis, Administração e RLS

> Camada de identidade e autorização. Hoje sobre Supabase Auth (`auth.users`) + tabela `profiles` + RLS. **Maior decisão de migração:** substituir o sistema de identidade.
>
> ✅ **Verificado contra o banco cloud real (2026-06-17).** Admin RPCs, `get_profile`/`upsert_profile`, `is_admin`/`is_current_user_admin` confirmados integralmente. Correções: nomes reais das policies RLS (§6); `site_branding` removida (§5 não se aplica mais); perfil criado por trigger (§3). Detalhes no doc 10 §3 e §6.

---

## 1. Modelo de identidade atual

- **`auth.users`** (schema gerenciado pelo Supabase): identidade, email, senha (bcrypt via `crypt`/`gen_salt('bf')`), metadados. **Será substituído** (ASP.NET Core Identity ou JWT próprio).
- **`profiles`** (1:1 com `auth.users`): `full_name`, `avatar_url`, `currency` (`'BRL'`), `locale` (`'pt-BR'`), `is_admin` (default `false`).
- **JWT:** o Supabase emite access/refresh tokens; o client os guarda em `localStorage` (`sb-<ref>-auth-token`) e a lib renova automaticamente.

---

## 2. Fluxo de autenticação (client)

**AU-01 — Bootstrap (`AuthContext`):**
1. No mount, lê `localStorage` para detectar token → se houver, `loading = true` (evita flash de login).
2. `supabase.auth.getSession()` → `applySession(session)`.
3. `applySession` seta `user`, `session`, e chama RPC `get_profile` → seta `profile`.
4. `onAuthStateChange`: `INITIAL_SESSION`/`TOKEN_REFRESHED` → apenas `loading=false` (sem refetch de profile); `SIGNED_IN`/`SIGNED_OUT` → `applySession` completo.

**AU-02 — Contrato exposto à app (`AuthContextType`):**
```ts
user: User | null          // id, email, metadata
session: Session | null    // access_token + refresh_token
profile: { full_name, avatar_url, is_admin } | null
loading: boolean
signOut(): Promise<void>
refreshProfile(): Promise<void>
```

**AU-03 — Logout (`signOut`):** chama `supabase.auth.signOut()` e **força** limpeza local (`user/session/profile = null`, `loading=false`) independente do resultado.

**AU-04 — Guards de rota:** `ProtectedRoute` (exige login) e `AdminRoute` (exige `profile.is_admin === true`).

---

## 3. Perfil

**AU-04b — Criação automática de perfil. ➕ (descoberto na verificação)** O trigger `on_auth_user_created` (AFTER INSERT em `auth.users`) chama `handle_new_user()`, que faz `INSERT INTO profiles (id, full_name) VALUES (new.id, coalesce(raw_user_meta_data->>'full_name','')) ON CONFLICT (id) DO NOTHING`. Ou seja, **todo usuário ganha um profile automaticamente**. **Migração .NET:** replicar (criar `Profile` na criação de usuário, no mesmo fluxo de registro/Identity).

**AU-05 — `get_profile()`** *(SECURITY DEFINER)* ✅: `SELECT * FROM profiles WHERE id = auth.uid()`.

**AU-06 — `upsert_profile(p_full_name, p_avatar_url)`** *(SECURITY DEFINER)*: `INSERT ... ON CONFLICT(id) DO UPDATE` com `COALESCE(EXCLUDED.campo, profiles.campo)` — não sobrescreve com NULL.

---

## 4. Administração de usuários

> Todas as RPCs admin são `SECURITY DEFINER, SET search_path = 'public'` e começam com o guard `IF NOT is_current_user_admin() THEN RAISE EXCEPTION 'Access denied'`. `is_current_user_admin()` **não está versionada** (ver overview §6); inferida como `EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)`.

**AD-01 — `admin_list_users()`:** `SELECT u.id, u.email, p.full_name, COALESCE(p.is_admin,false), u.created_at FROM auth.users u LEFT JOIN profiles p ON p.id = u.id ORDER BY u.created_at DESC`. Contrato `ManagedUser { id, email, full_name?, is_admin, created_at? }`.

**AD-02 — `admin_create_user(p_email, p_password, p_full_name, p_is_admin)`:**
Guards sequenciais:
1. admin? senão *"Access denied"*.
2. email vazio → *"Email is required"*.
3. senha NULL ou `len < 6` → *"Password must be at least 6 characters"*.
4. email já existe (case-insensitive) → *"Email already exists"*.
Operações:
1. `user_id = gen_random_uuid()`.
2. Descobre `instance_id` (de qualquer usuário existente).
3. INSERT em `auth.users`: `aud='authenticated'`, `role='authenticated'`, email normalizado (trim+lower), `encrypted_password = crypt(p_password, gen_salt('bf'))`, `email_confirmed_at = now()`, metadados de provider email.
4. INSERT em `auth.identities` (provider 'email', `identity_data` com sub/email/verified).
5. UPSERT em `profiles (id, full_name, is_admin, updated_at)`.
6. Retorna `user_id`.

**AD-03 — `admin_update_user(p_user_id, p_email, p_full_name, p_is_admin)`:** guards (admin, user_id, email). UPDATE em `auth.users` (email) → se não → *"User not found"*; UPDATE em `auth.identities` (sincroniza email/verified); UPSERT em `profiles`.

**AD-04 — `admin_update_user_password(p_user_id, p_password)`:** guards (admin, senha `>= 6` → *"Password must be at least 6 characters"*). `UPDATE auth.users SET encrypted_password = crypt(...)`. Se não → *"User not found"*.

**AD-05 — `admin_delete_user(p_user_id)`:** guards (admin; **não pode deletar a si mesmo** → *"You cannot delete your own user"*). `DELETE FROM auth.users WHERE id = p_user_id` → cascade para dados do usuário. Se não → *"User not found"*.

**AD-06 — Tratamento de erro client:** todas as operações passam por `normalizeRpcError` (ver §7).

---

## 5. ~~Site branding~~ — ❌ REMOVIDO

A tabela `site_branding` foi **dropada** (migration `drop_site_branding`), junto com o trigger/função de singleton. Não é mais um domínio do sistema. (A versão inicial desta spec descrevia `AU-07` — removido.)

## 5b. Avatar de perfil (storage)

`profiles.avatar_url` aponta para um arquivo no bucket de storage **`avatars`** (público). Upload feito pelo client. **Migração .NET:** prover endpoint de upload + storage (disco/blob) e servir avatares com URL escopada (o bucket público atual permite listar todos os arquivos — advisor de segurança).

---

## 6. RLS (Row Level Security) — autorização atual

> No Supabase, RLS é **a fronteira de autorização**. Na migração, isso vira responsabilidade da camada de aplicação .NET (multi-tenancy RT-01).

> ✅ **Nomes e expressões reais conferidos no banco.** Todas as policies têm `roles = {public}`; o isolamento vem da expressão.

### Padrão geral — nome real `{tabela}_{select|insert|update|delete}_own`
Aplica-se a: `settings_salary, bank_accounts, categories, credit_cards, credit_card_invoices, credit_card_statement_cycles, transactions`.
| Operação | Policy | Regra |
|---|---|---|
| SELECT | `{tabela}_select_own` | USING `user_id = auth.uid()` |
| INSERT | `{tabela}_insert_own` | WITH CHECK `user_id = auth.uid()` |
| UPDATE | `{tabela}_update_own` | USING + WITH CHECK `user_id = auth.uid()` |
| DELETE | `{tabela}_delete_own` | USING `user_id = auth.uid()` |

### `profiles`
- `Users can view/insert/update own profile` (`id = auth.uid()`).
- `profiles_admin_select_all` (SELECT): `auth.uid() = id OR is_admin(auth.uid())` — usa a função `is_admin(uuid)` (SECURITY DEFINER) para **evitar recursão de RLS** (fix `fix_profiles_rls_infinite_recursion`).

### `pluggy_items`
- `user_owns_pluggy_item` (ALL): `auth.uid() = user_id` (USING + WITH CHECK).

### `system_config`
- `system_config_select_authenticated` (SELECT): `auth.uid() IS NOT NULL`.
- `system_config_admin_write` (ALL): `EXISTS(profiles WHERE id=auth.uid() AND is_admin)`.

### `audit_log`
- `audit_log_admins_only` (ALL): `EXISTS(profiles WHERE id=auth.uid() AND is_admin)`.

### ~~`site_branding`~~ — ❌ tabela removida, sem policies.

### Hardening (advisors de segurança — ver doc 10 §8)
- RPCs `SECURITY DEFINER` são executáveis por `anon`/`authenticated` via REST (140 advisories); os admin RPCs se protegem com o guard interno `is_current_user_admin()`. **No .NET:** toda rota exige auth; admin via `[Authorize(Roles="Admin")]`.
- Bucket `avatars` é público e permite listagem — servir com URL escopada no .NET.

---

## 7. `normalizeRpcError(error)` — extração de mensagem

Prioridade: (1) string direta; (2) `Error.message`; (3) `error.message`; (4) `error.details`; (5) `"Error: " + error.hint`; (6) fallback *"Ocorreu um erro desconhecido ao processar sua solicitação."*

> **Migração .NET:** mapear exceções de domínio → `ProblemDetails` com mensagem em pt-BR, espelhando essa prioridade.

---

## 8. Variáveis de ambiente (auth/config)

| Variável | Onde |
|---|---|
| `VITE_SUPABASE_URL` | frontend (obrigatória) |
| `VITE_SUPABASE_ANON_KEY` | frontend (obrigatória) |

---

## 9. Checklist de migração .NET para Auth/Admin

- [ ] **Decisão:** ASP.NET Core Identity vs. JWT próprio. Migrar usuários de `auth.users` (incluindo hashes bcrypt — Identity suporta custom password hasher para bcrypt, ou forçar reset).
- [ ] `profiles` vira entidade própria (ou colunas em `AppUser`).
- [ ] `GET /api/auth/me` ↔ `get_profile`; `PUT /api/profile` ↔ `upsert_profile`.
- [ ] 5 endpoints admin (`GET/POST/PUT/PUT password/DELETE /api/admin/users`) com `[Authorize(Roles="Admin")]` ou policy `is_admin`.
- [ ] Preservar todos os guards e mensagens (senha `>=6`, email único, não-auto-deleção, "Access denied").
- [ ] **Substituir RLS por filtro de tenant** na camada de aplicação (global query filter por `user_id` + checagem de ownership em mutações).
- [ ] Auditoria (`audit_log`) e branding singleton reimplementados.
- [ ] **Investigar no cloud:** definição real de `is_current_user_admin()`.
