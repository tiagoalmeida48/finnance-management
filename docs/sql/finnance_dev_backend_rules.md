# finnance_dev — Regras implementadas no backend (.NET)

Este schema é deliberadamente "enxuto": a maior parte do comportamento que antes vivia no
banco (Supabase: triggers, functions, views, RLS) é responsabilidade da camada de
aplicação. Este documento é o contrato do que o backend garante e **reflete o que está
de fato implementado** no `Finnance.Api`. Referência cruzada: `docs/specs/`.

Stack real: **.NET 9 + Dapper** (sem EF Core), SQL **inline** nos repositórios, validação
**imperativa** no domínio (sem FluentValidation/DataAnnotations), `ResultApi<T>` +
`ApplicationException` + `Constants.ErrorMessage`. Convenções do schema: tabelas no
**singular**; nomes reservados com aspas (`"user"`, `"transaction"`); PK `int8` identity;
timestamps `created`/`updated`; soft-delete por `active`. `profiles` foi **fundida** em
`"user"` (identidade + perfil na mesma tabela).

> Nota (2026-06-26): após o roadmap DBA, parte das regras abaixo passou a ter **reforço
> no banco** (CHECKs, índice único parcial do ciclo aberto, FK de auditoria). Está
> marcado em cada seção. O banco continua sem trigger/function/view/RLS.

---

## 1. Timestamps `created` / `updated`

Não há trigger. Centralizado no `BaseRepository` (Dapper):

- INSERT: `created = updated = DateTime.Now` (`Create`); queries inline usam `NOW()`.
- UPDATE: `updated = NOW()`; `created` **imutável** — `Update` relê o `created` original
  (`GetDataModelBase`) antes de gravar. Nunca reescrever `created`.

**Tabela extra?** Não. É comportamento.

---

## 2. Validações de dados

Validação **imperativa** na Entity (`ValidateCreate`/`ValidateUpdate`) e no serviço
(`ValidatePersistence`), lançando `ApplicationException(Constants.ErrorMessage.X)`.
**Reforço no banco** (CHECKs `NOT VALID` já validados sobre o legado em 2026-06-26):
`chk_transaction_amount_positive`, `chk_transaction_card_has_account`,
`chk_transaction_transfer_account`, `chk_cycle_days`, `chk_settings_salary_percent`.

### "transaction"
- `transaction_type` ∈ `transaction_type` (income/expense/transfer) — FK + validação.
- `payment_method` nulo ou ∈ `payment_method` — FK.
- `amount > 0` (Entity + CHECK).
- `installment_number >= 1`; total vem de `installment_group.total_installments`.
- `to_account` preenchido **somente** quando o tipo for `transfer` (Entity + CHECK).
- `card` preenchido ⇒ `account` preenchido (Entity + CHECK).

### credit_card_invoice
- `invoice_status` ∈ `invoice_status` — FK.
- `total_amount >= 0`, `paid_amount >= 0`. O recálculo (`RecalculateInvoiceTotal`)
  deriva `paid` das transações pagas e o limita a `total` (estorno/income reduz
  `total`; ver spec RC-ALG-02).

### settings_salary
- `hourly_rate >= 0`, `base_salary >= 0`; percentuais em `[0,100]` (Entity + CHECK);
  `date_start <= date_end`.

### Formato / coerência (na aplicação)
- `"user".email`: formato + **unicidade case-insensitive** (normalizar lowercase; a
  UNIQUE do banco é case-sensitive).
- Cores hex `#RRGGBB[AA]`; `credit_card_invoice.month_key` = `yyyy-MM`;
  `"user".currency` ISO 4217; `"user".locale` ex. `pt-BR`.

### Defaults (o backend/Entity preenche no INSERT)
- `"user".currency = 'BRL'`, `locale = 'pt-BR'`.
- `bank_account`: `current_balance = initial_balance`; cor/ícone default na borda.
- `credit_card_invoice.invoice_status → OPEN`, `total_amount = 0`, `paid_amount = 0`.
- `credit_card_statement_cycle.date_end = '9999-12-31'` (ciclo aberto).
- `settings_salary.date_end = '9999-12-31'` (vigência aberta).
- `"transaction".fixed = false`, `paid = false`. Todas: `active = true`. Timestamps: §1.

**Tabela extra?** Não.

---

## 3. Unicidade parcial "uma linha aberta"

- **1 ciclo de fatura aberto por cartão** — **reforçado no banco** pelo índice único
  parcial `uq_card_open_cycle` (`credit_card_statement_cycle (card) WHERE date_end =
  '9999-12-31'`), além do `ValidateNoCycleOverlap` no serviço.
- **1 vigência salarial aberta por usuário** — invariante de **aplicação**
  (`ValidateNoOverlap` em `SettingsSalaryService`); ainda não há índice parcial no banco.

**Tabela extra?** Não.

---

## 4. Saldo da conta `current_balance` (derivado)

Recalculado pela aplicação (Dapper), nunca por trigger. Caminho quente: delta
incremental em `TransactionBalanceService.ApplyBalance` (reverter+aplicar) a cada
create/update/delete/pay/unpay, **na mesma `TransactionScope`**. Só `paid = true`,
`card IS NULL`, `account` não-nulo entram no saldo.

Fórmula de referência (também usada na reconciliação do zero,
`BankAccountService.ReconcileBalances`, endpoint on-demand):
```
current_balance = initial_balance
    + Σ(income  pagas na conta)  − Σ(expense pagas na conta)
    − Σ(transfer pagas saindo de account) + Σ(transfer pagas entrando em to_account)
```
Índices de suporte: `idx_transaction_account_paid`, `idx_transaction_to_account_paid`.
Ref.: `docs/specs/04-rules-accounts-balance.md`.

**Tabela extra?** Não. É cálculo sobre `"transaction"`.

---

## 5. Vínculo transação → fatura

`CreditCardInvoiceService.ResolveInvoiceForTransaction` + `LinkInvoice` no
`TransactionService`: deriva `month_key` do ciclo aberto (lookup direto via
`uq_card_open_cycle`), localiza/cria a `credit_card_invoice` (`card` + `month_key`,
UNIQUE), seta `"transaction".invoice` e dispara `RecalculateInvoiceTotal`.
Ref.: `docs/specs/03-rules-cards-invoices.md`.

**Tabela extra?** Não.

---

## 6. Read-models (sem VIEW)

Decisão: **não criar views** — read-models são **queries inline Dapper** nos
repositórios (não LINQ/EF):
- cartão + dias do ciclo aberto (join `credit_card_statement_cycle` aberto).
- uso/limite por cartão: `total_usage = Σ GREATEST(total_amount − paid_amount, 0)` sobre
  faturas não pagas; `available_limit = credit_limit − total_usage`. O `GREATEST(...,0)`
  evita inflar o limite quando estorno deixa `total < paid`.
- agregações por `installment_group` / `recurring_group`.

**Tabela extra?** Não. (Se virar gargalo: cache/coluna materializada — decisão futura.)

---

## 7. Autorização / isolamento multi-tenant (sem RLS)

Não há RLS. Isolamento é responsabilidade **obrigatória** do backend, em duas camadas:

- **Filtro por tenant nas queries inline**: toda query de dado de usuário inclui
  `"user" = @user` (o `userId` vem do JWT via `UserLogged.user`).
- **Filtro central por construção**: entidades multi-tenant implementam o marcador
  `IUserOwned`; o `BaseRepository` injeta `AND "user" = @__tenant` automaticamente em
  `GetByKey/All/Exist/Update/Delete` (defesa contra esquecimento em CRUD base).
- **Coerência de tenant entre FKs**: ao gravar transação/pagamento, os serviços validam
  que `account`/`to_account`/`card`/`category`/`invoice` pertencem ao mesmo usuário
  (`EnsureOwnership`/`GetOwned`). As FKs garantem existência, não dono.

### RBAC
**Não há tabelas `role`/`user_role`.** O admin é a coluna booleana **`"user".is_admin`**.
Autorização por atributo: `[Authorization]` (autenticado) ou `[Authorization(admin: true)]`
(admin). O claim `is_admin` vai no JWT; sem token → `ErrorAccess`; logado sem ser admin →
`ErrorAuthorization`.

Contrato de acesso (aplicado por código, não por tabela de permissões):
- **Usuário**: CRUD apenas das próprias linhas (account, transaction, category, card,
  invoice, statement_cycle, salary_settings); lê `system_config`.
- **Admin** (+): listar/criar/editar/excluir usuários, resetar senha, escrever
  `system_config`, ler `audit_log` de todos. "Admin não pode se auto-deletar" é regra de
  serviço. Não há integração Pluggy no stack atual.

**Tabela extra?** Não.

---

## 8. Auditoria (`audit_log`)

**Implementada** via filtro cross-cutting `Security/AuditActionFilter` (IAsyncActionFilter
global, registrado em `_Configuration.cs`): a cada request **mutante** (POST/PUT/DELETE,
exceto controllers `Auth`/`User`/`AuditLog`) grava em `audit_log` via
`IAuditLogService.Record` — `audit_action` (verbo→catálogo), `table_name` (controller),
`record` (id do resultado, ou 0), `new_data` (args serializados, truncado), `changed_by`
(usuário do JWT). Resiliente: nunca quebra o request.

- `changed_by` **agora com FK** (`fk_audit_log_user`) — o sistema não faz hard-delete de
  usuário (soft-delete; admin não se auto-deleta), então a integridade é segura.
- Nunca serializar `password_hash`/segredos (Auth/User estão na denylist do filtro).
- Granularidade é por **request** (não por linha) — auditoria coarse; refinar p/
  old_data/new_data por entidade é evolução futura.
- Definir retenção/expurgo (LGPD). `audit_log` é append-only (GRANT no deploy).

**Tabela extra?** Não além de `audit_log` + `audit_action` (catálogo).

---

## 9. Segurança operacional (aplicar no deploy)

- Role de aplicação com privilégio mínimo (DML, sem DDL); migrations com owner separado.
- `audit_log` append-only para a role da aplicação.
- Senha: hash **Argon2** (`Argon2Helper`), verificação na aplicação. JWT próprio
  (`JwtHelper`, HMAC-SHA256) — **não** usa ASP.NET Identity nem o pipeline padrão de auth.
- Segredos hoje hardcoded (chave do JWT em `JwtConstants`, chave AES da connection string
  em `HashHelper`) — mover para configuração/secret store.
- PK `int8` sequencial: avaliar id alternativo/slug em URLs públicas se enumeração for
  preocupação.
