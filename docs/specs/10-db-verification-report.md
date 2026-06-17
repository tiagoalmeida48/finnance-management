# 10 — Relatório de Verificação contra o Banco Cloud Real

> **Data:** 2026-06-17. **Fonte:** acesso direto ao Supabase cloud via MCP (project_ref `inxdvuwukpcdlnoazeie`), catálogo do PostgreSQL (`pg_proc`, `pg_trigger`, `pg_policies`, `pg_indexes`, `pg_constraint`), `supabase_migrations.schema_migrations`, edge functions e advisors.
>
> A spec original (docs 00–09) foi escrita sobre as **migrations locais**, que estavam **desatualizadas**. Este documento registra o **diff** entre o que foi inferido e o estado **real**. Os documentos afetados foram corrigidos; este relatório é a trilha de auditoria.

---

## 0. Resumo executivo

- O banco cloud tem **25 migrations aplicadas**; o repositório local tinha **18**. **7 migrations existem só no cloud** (incluindo correções de lógica de negócio críticas).
- Todos os "gaps a recuperar" do doc 09 §2 foram **fechados** — as funções não-versionadas existem e foram lidas integralmente.
- **`site_branding` foi removida do banco** (migration `drop_site_branding`). A spec original a documentava como existente — **corrigido**.
- Vários detalhes de lógica divergiam do inferido (notadamente `update_transaction`); **corrigidos** com a definição real.

---

## 1. Migrations: local vs. cloud

### Presentes no cloud e **ausentes** localmente (recuperadas aqui)
| Versão | Nome | Impacto |
|---|---|---|
| 20260405185203 | `20260405000008_fix_rls_and_schema_gaps` | Cria RLS de `bank_accounts` e `credit_card_invoices` (antes 0 policies!), `is_paid` NOT NULL, enum `type` EN-only, `set_updated_at` + triggers, índices, `chk_transfer_account`, `chk_card_has_account` |
| 20260405185707 | `20260405000009_drop_site_branding` | **DROP TABLE site_branding** + trigger/função singleton |
| 20260405190431 | `20260405000010_transactions_improvements` | `chk_group_mutual_exclusive`, `chk_recurring_requires_is_fixed`, views `v_installment_groups`/`v_recurring_groups`, RPC `get_installment_group_summary` |
| 20260405225641 | `fix_profiles_rls_infinite_recursion` | Cria `is_admin(uuid)`, corrige policy `profiles_admin_select_all` (recursão) |
| 20260426214845 | `create_pluggy_items` | Cria tabela `pluggy_items` + RLS + trigger |
| 20260426222554 | `add_pluggy_account_id_to_bank_accounts` | Adiciona `bank_accounts.pluggy_account_id` |
| 20260428003814 | `fix_delete_account_and_salary_trigger` | (presente localmente como `..._9`) |
| 20260428203252 | `fix_sync_account_balance_trigger_and_recalculate` | **Recria** o trigger de saldo + **recalcula** todos os saldos |
| 20260428204348 | `fix_update_transaction_coalesce_null` | **Muda `update_transaction`** para usar `? key` (permite setar NULL) |
| 20260428213604 | `fix_create_transaction_installment_null` | Versão final de `create_transaction` |

> **Ação concluída:** todas lidas integralmente. As de fix alteram lógica documentada nos docs 02 e 04.

---

## 2. Tabelas — diferenças vs. doc 01

| Item | Spec original (inferida) | Banco real | Status |
|---|---|---|---|
| `site_branding` | documentada como existente (singleton) | **NÃO EXISTE** (dropada) | ❌ corrigido |
| `pluggy_items` | "recuperar do cloud" | **existe**: `id, user_id, item_id, connector, status, last_synced_at, created_at, updated_at`; UNIQUE `(user_id, item_id)`; FK user CASCADE; RLS `user_owns_pluggy_item` | ✅ documentado |
| `bank_accounts.pluggy_account_id` | "confirmar" | **existe** (`text`, nullable) | ✅ |
| `credit_cards` colunas | nullable (name/color/bank_account_id) | **NOT NULL** (user_id, bank_account_id, name, color, credit_limit, is_active) | ✏️ corrigido |
| `credit_cards.closing_day/due_day` | "ainda pode existir" | **NÃO existem** (removidas, confirmado) | ✅ |
| Storage bucket `avatars` | não documentado | **existe** (público, p/ avatar de perfil) | ➕ novo |

---

## 3. Funções não-versionadas — todas CONFIRMADAS

| Função | Status real | Observação |
|---|---|---|
| `is_current_user_admin()` | ✅ existe (SQL, STABLE, DEFINER) | `EXISTS(profiles WHERE id=auth.uid() AND is_admin)` — exatamente como inferido |
| `is_admin(uuid DEFAULT auth.uid())` | ✅ existe (SQL, STABLE, DEFINER) | usada em RLS de `profiles`; criada p/ quebrar recursão de RLS |
| `increment_account_balance(uuid, numeric)` | ✅ existe (**INVOKER**, sem search_path) | `UPDATE ... current_balance += p_amount, updated_at=now()` — **sem filtro de user_id** (confia em RLS) |
| `create_credit_card_statement_cycle(...)` | ✅ existe (**INVOKER**) | implementa o split de ciclo no servidor (igual a `planCycleInsertion` do client) com validações pt-BR |
| `commit_pluggy_transactions(jsonb)` | ✅ existe (DEFINER) | caminho server-side de commit Pluggy (camelCase nos campos; `notes`=pluggyId) |
| `handle_new_user()` + trigger `on_auth_user_created` | ➕ novo | **cria profile automaticamente** ao inserir em `auth.users` |
| `set_updated_at()` | ➕ novo | trigger BEFORE UPDATE em quase todas as tabelas |
| `get_installment_group_summary(uuid)` | ➕ novo | agrega 1 grupo de parcelas |
| `sync_credit_card_cycle_days(uuid, date)` | ⚠️ **órfã** | faz `UPDATE credit_cards SET closing_day/due_day` — mas essas colunas **não existem mais**; nenhum trigger a chama. Função morta. **Não migrar.** |

### Funções inferidas que **NÃO existem** (corrigir docs)
| Inferida | Realidade |
|---|---|
| `enforce_site_branding_singleton()` | não existe (tabela dropada) |
| `check_salary_period_no_overlap()` + trigger | **não existe** — não há trigger de overlap salarial; garantia é o índice único `settings_one_open_row_per_user` + validação no client |
| `sync_card_closing_due_day()` trigger | não existe; o que existe é a função órfã `sync_credit_card_cycle_days` (não usada) |

---

## 4. Triggers reais (lista completa)

| Tabela | Trigger | Quando | Função |
|---|---|---|---|
| `auth.users` | `on_auth_user_created` | AFTER INSERT | `handle_new_user` (cria profile) |
| `transactions` | `trg_link_to_invoice` | BEFORE INSERT/UPDATE OF card_id,purchase_date,payment_date | `trg_link_transaction_to_invoice` |
| `transactions` | `trg_sync_account_balance` | AFTER INSERT/UPDATE/DELETE | `sync_account_balance_on_transaction` |
| `transactions` | `audit_transactions` | AFTER I/U/D | `audit_trigger_fn` |
| `transactions` | `trg_transactions_updated_at` | BEFORE UPDATE | `set_updated_at` |
| `credit_card_invoices` | `audit_credit_card_invoices` | AFTER I/U/D | `audit_trigger_fn` |
| `credit_card_invoices` | `set_updated_at_credit_card_invoices` | BEFORE UPDATE | `set_updated_at` |
| `credit_cards` | `audit_credit_cards` | AFTER I/U/D | `audit_trigger_fn` |
| `credit_cards` | `trg_credit_cards_updated_at` | BEFORE UPDATE | `set_updated_at` |
| `credit_card_statement_cycles` | `trg_credit_card_statement_cycles_no_overlap` | BEFORE INSERT/UPDATE | `credit_card_statement_cycles_no_overlap` ➕ |
| `bank_accounts`,`categories`,`profiles`,`system_config`,`pluggy_items` | `*_updated_at` | BEFORE UPDATE | `set_updated_at` |

> ➕ Novidade importante: **trigger de não-sobreposição de ciclos** (que eu não tinha). Há overlap-guard para **ciclos de cartão**, mas **não** para vigências salariais.

---

## 5. Constraints — novidades confirmadas (doc 01 corrigido)

CHECKs que **não estavam** na spec inferida:
- `transactions.chk_group_mutual_exclusive`: `installment_group_id IS NULL OR recurring_group_id IS NULL` (não coexistem).
- `transactions.chk_recurring_requires_is_fixed`: `recurring_group_id IS NULL OR is_fixed = true`.
- `credit_card_statement_cycles.credit_card_statement_cycles_valid_days`: closing/due entre 1–31.
- `credit_card_statement_cycles.credit_card_statement_cycles_valid_dates`: `date_start <= date_end` (além do `chk_cycle_dates`).
- Há CHECKs **duplicados** em `settings_salary` (inline + nomeados) — comportamento idêntico, apenas redundância.

FKs com cascade real:
- `credit_card_statement_cycles.card_id → credit_cards ON DELETE CASCADE` e `user_id → auth.users ON DELETE CASCADE`.
- `pluggy_items.user_id → auth.users ON DELETE CASCADE`.
- Demais FKs **sem** cascade (NO ACTION).

Índices novos relevantes:
- `settings_one_open_row_per_user` — **UNIQUE parcial** `(user_id) WHERE date_end = '9999-12-31'` → garante **1 vigência salarial aberta por usuário** no banco (a validação que eu atribuía só ao client tem respaldo de constraint).
- `credit_card_statement_cycles_card_start_uniq` — UNIQUE `(card_id, date_start)`.
- `uq_card_open_cycle` — UNIQUE parcial `(card_id) WHERE date_end='9999-12-31'` (confirmado).

---

## 6. RLS real (doc 07 corrigido)

- Nomenclatura real: `{tabela}_{select|insert|update|delete}_own` com `user_id = auth.uid()`. (A spec usava nomes diferentes.)
- `profiles`: `Users can view/insert/update own profile` + `profiles_admin_select_all` usando `is_admin(auth.uid())` (não EXISTS inline).
- `system_config`: SELECT a autenticados; `ALL` a admin.
- `audit_log`: `ALL` só admin.
- `pluggy_items`: `user_owns_pluggy_item` (ALL, `auth.uid() = user_id`).
- **Não há** policies de `site_branding` (dropada).
- Todas as policies têm `roles = {public}` (aplicadas a todos; o filtro é a expressão).

---

## 7. Correções de LÓGICA (docs 02, 03, 04 corrigidos)

### `update_transaction` (doc 02 TX-08) — **corrigido**
Spec dizia "COALESCE". **Real:** usa `CASE WHEN p_updates ? 'campo' THEN ... ELSE t.campo END`. Ou seja, **passar `null` explícito SETA o campo como NULL** (diferente de omitir). Isto é o fix `fix_update_transaction_coalesce_null` — importante para a migração (a semântica de "patch parcial com possibilidade de limpar campo" deve ser replicada com um mapa de chaves presentes, não COALESCE).

### `create_transaction` (doc 02 TX-01) — **ampliado**
Valida `amount > 0` → exceção *"amount must be positive"*. (Além de "Not authenticated".) Confirmados os 3 ramos exatamente como descrito.

### `sync_account_balance_on_transaction` (doc 04 AC-ALG-01) — **confirmado idêntico**
A lógica de delta (reverter OLD / aplicar NEW) bate 100% com o documentado. A migration de fix incluiu um **recálculo total** de `current_balance` de todas as contas (`initial_balance + SUM(deltas pagos)`), o que é exatamente a "alternativa robusta" sugerida no doc 04 §3 — útil como referência para a implementação .NET.

### `recalculate_invoice_total` (doc 03 RC-ALG-02) — **confirmado idêntico**
income negativo no total; status open/partial/paid. **Confirmado que `closed`/`overdue` NUNCA são atribuídos por nenhuma função** — existem só no enum. Nenhum job/trigger os define. → Para o MVP .NET, implementar só open/partial/paid; tratar closed/overdue como funcionalidade futura não implementada.

### `trg_link_transaction_to_invoice` / `reprocess_invoices_for_card` (doc 03 RC-ALG-01/RC-11) — **confirmados idênticos**
Algoritmo de month-shift e clamp de due_day batem exatamente. `reprocess` faz limpeza de faturas vazias ao final, como documentado.

### Edge function `pluggy-sync` — `isSimilar` (doc 08 PL-03) — **corrigido**
Spec dizia "descrições normalizadas iguais + valor 5% + data 2d". **Real:** comparação **posicional caractere-a-caractere** dos primeiros `min(len,20)` chars com **≥60% de match**, E (valor: `pct > 5% E diff > R$1` reprova), E data ≤ 2 dias. Regex de parcela: `/\(?\b(\d+)\s*\/\s*(\d+)\b\)?/`.

---

## 8. Advisors de segurança (144 no total) — relevantes para a migração

| Qtd | Advisory | Implicação p/ .NET |
|---|---|---|
| 70 | `anon_security_definer_function_executable` | RPCs DEFINER executáveis por `anon` via REST — no .NET, **toda** rota exige autenticação explícita; não há "anon executa RPC" |
| 70 | `authenticated_security_definer_function_executable` | idem para `authenticated` — admin RPCs dependem do guard interno `is_current_user_admin()`; no .NET usar `[Authorize(Roles="Admin")]` |
| 2 | `function_search_path_mutable` | `increment_account_balance` e `set_updated_at` sem `search_path` fixo (risco de hijack). Irrelevante após migração (vira C#) |
| 1 | `auth_leaked_password_protection` | HaveIBeenPwned desabilitado — considerar política de senha no novo sistema de identidade |
| 1 | `public_bucket_allows_listing` | bucket `avatars` público permite **listar todos os arquivos** — no .NET, servir avatares com URL assinada/escopada |

> Estes são problemas de configuração do Supabase; servem como **checklist de hardening** para o backend .NET (autenticação obrigatória, autorização por papel, storage com escopo).

---

## 9. Estado final consolidado (números)

- **12 tabelas** em `public`: profiles, settings_salary, bank_accounts, categories, credit_cards, credit_card_invoices, credit_card_statement_cycles, transactions, system_config, audit_log, pluggy_items. (site_branding **removida**.)
- **~71 funções** em `public` (RPCs + triggers + helpers).
- **15 triggers** (incl. `on_auth_user_created` em auth.users).
- **4 views**: v_card_limits, v_credit_cards_with_cycles, v_installment_groups, v_recurring_groups.
- **2 edge functions**: pluggy-token (v5), pluggy-sync (v14).
- **1 storage bucket**: avatars (público).
- Dados atuais: transactions=14 linhas, audit_log=51; demais tabelas vazias (ambiente praticamente limpo).

---

## 10. Itens que permanecem como decisão/atenção

1. `sync_credit_card_cycle_days` é **função morta** (atualiza colunas inexistentes) — **não portar**.
2. Status de fatura `closed`/`overdue` **não têm produtor** — decidir se a migração os implementa (job de vencimento) ou os descarta.
3. CHECKs duplicados em `settings_salary` — consolidar 1 conjunto no EF Core.
4. `increment_account_balance` **não filtra `user_id`** (depende de RLS) — no .NET, **adicionar** o filtro de tenant explicitamente.
5. Commit Pluggy existe em **dois caminhos** (client `insert_transactions` + server `commit_pluggy_transactions`) — unificar.
6. Migrar o conteúdo do bucket `avatars` e a tabela `pluggy_items` (tokens/itens Open Finance) no plano de dados.
