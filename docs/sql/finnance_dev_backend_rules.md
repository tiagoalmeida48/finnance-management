# finnance_dev — Regras a implementar no backend (.NET)

Este schema é deliberadamente "burro": sem `CHECK`, sem `DEFAULT`, sem `VIEW`, sem
`TRIGGER`, sem `FUNCTION`, sem `RLS`. Todo comportamento que antes vivia no banco
(Supabase) passa a ser responsabilidade da camada de aplicação. Este documento é o
contrato do que o backend **precisa** garantir. Referência cruzada: `docs/specs/`.

Convenções do schema: tabelas no **singular**; nomes reservados usam aspas
(`"user"`, `"transaction"`, `"role"`); PK `BIGINT` identity; timestamps `created`/
`updated`; soft-delete só por `is_active`. A antiga `profiles` foi **fundida** em
`"user"` (identidade + perfil na mesma tabela).

> Avaliação de "tabela a mais": cada regra abaixo foi avaliada. Onde uma tabela
> resolvia melhor, ela já está no schema (catálogos, grupos, `role`/`user_role`).
> As demais são lógica/derivação e **não** justificam tabela nova — ficam aqui.

---

## 1. Timestamps `created` / `updated` (substitui o trigger `set_updated_at`)

Não há trigger. O backend deve, em **toda** escrita:

- No INSERT: `created = updated = DateTimeOffset.UtcNow`.
- No UPDATE: `updated = DateTimeOffset.UtcNow`; **nunca** reescrever `created`.

Implementar de forma centralizada (ex.: `SaveChanges` override no `DbContext` /
interceptor do EF Core) para não repetir em cada repositório. `created` é imutável.

**Tabela extra?** Não. É comportamento, não dado.

---

## 2. Validações de dados (substituem os `CHECK` removidos)

Validar na borda (DTO / FluentValidation) **e** no serviço de domínio. Lista mínima:

### "transaction"
- `transaction_type_id` ∈ catálogo `transaction_type` (income/expense/transfer) — garantido por FK.
- `payment_method_id` nulo ou ∈ `payment_method` — garantido por FK.
- `amount > 0`.
- `installment_number >= 1`; se houver grupo de parcelas, `installment_number <= installment_group.total_installments`.
- Parcela completa: ter `installment_group_id` ⇒ ter `installment_number` (e vice-versa).
- `to_account_id` preenchido **somente** quando o tipo for `transfer`.
- `card_id` preenchido ⇒ `account_id` preenchido.
- Mútua exclusão: `installment_group_id` e `recurring_group_id` não coexistem.
- `recurring_group_id` preenchido ⇒ `is_fixed = true`.

### credit_card_invoice
- `invoice_status_id` ∈ `invoice_status` — garantido por FK.
- `total_amount >= 0` e `paid_amount >= 0`.
- **NÃO** exigir `paid_amount <= total_amount`: estorno/crédito (income) pode reduzir
  `total_amount` abaixo do `paid_amount` já registrado (spec RC-ALG-02). Estado válido.

### settings_salary
- `hourly_rate >= 0`, `base_salary >= 0`.
- `inss_discount_percentage` e `admin_fee_percentage` em `[0, 100]`.
- `date_start <= date_end`.

### bank_account / category
- `account_type_id` / `category_type_id` ∈ catálogo — garantido por FK.

### Formato / coerência (antes nos CHECK de regex)
- `"user".email`: formato de e-mail + **unicidade case-insensitive** (normalizar para
  lowercase antes de gravar/consultar; a UNIQUE do banco é case-sensitive).
- Cores (`bank_account.color`, `category.color`, `credit_card.color`): hex `#RRGGBB[AA]`.
- `credit_card_invoice.month_key`: formato `yyyy-MM` (mês 01–12).
- `"user".currency`: ISO 4217 (3 letras); `"user".locale`: ex. `pt-BR`.

### Defaults removidos — o backend deve preencher no INSERT
- `"user".currency = 'BRL'`, `"user".locale = 'pt-BR'`.
- `bank_account.account_type → checking`, `color = '#8b5cf6'`, `icon = 'wallet'`,
  `initial_balance = 0`, `current_balance = 0`.
- `credit_card.credit_limit = 0`.
- `credit_card_invoice.status → open`, `total_amount = 0`, `paid_amount = 0`.
- `credit_card_statement_cycle.date_end = '9999-12-31'` (marca o ciclo aberto).
- `settings_salary.date_end = '9999-12-31'` (marca a vigência aberta).
- `"transaction".is_fixed = false`, `is_paid = false`.
- Todas as entidades: `is_active = true`.
- Timestamps: ver §1.

**Tabela extra?** Não. São regras de validação/preenchimento.

---

## 3. Unicidade parcial "uma linha aberta" (substitui índices únicos parciais)

O schema mantém apenas as UNIQUE totais (`uq_settings_salary_period`,
`uq_credit_card_statement_cycle_card_start`, `uq_category_user_type_name`). As regras
parciais que dependiam de `WHERE` viram invariante de aplicação:

- **1 vigência salarial aberta por usuário**: no máximo uma `settings_salary` com
  `date_end = '9999-12-31'` por `user_id`.
- **1 ciclo de fatura aberto por cartão**: no máximo uma `credit_card_statement_cycle`
  com `date_end = '9999-12-31'` por `card_id`.

> Se quiser garantia no banco, a alternativa SEM trigger é um índice único parcial
> (`CREATE UNIQUE INDEX ... WHERE date_end = '9999-12-31'`). Não é tabela; é índice.

**Tabela extra?** Não.

---

## 4. Saldo da conta `current_balance` (substitui `trg_sync_account_balance`)

`current_balance` é um valor **derivado**. O backend recalcula a cada INSERT/UPDATE/
DELETE de transação e a cada pay/unpay, dentro da mesma transação de banco:

```
current_balance = initial_balance
    + Σ(income  pagas na conta)
    − Σ(expense pagas na conta)
    − Σ(transfer pagas saindo de account_id)
    + Σ(transfer pagas entrando em to_account_id)
```

Apenas `is_paid = true` entra no saldo. Centralizar num serviço de domínio; nunca
permitir escrita "crua" de `current_balance` por fora desse serviço. Índices de
suporte já existem (`idx_transaction_account_paid`, `idx_transaction_to_account_paid`).
Ref.: `docs/specs/04-rules-accounts-balance.md`.

**Tabela extra?** Não. É cálculo sobre `"transaction"`.

---

## 5. Vínculo transação → fatura (substitui `trg_link_transaction_to_invoice`)

Ao criar/editar uma transação de cartão (`card_id` preenchido), o serviço deve:

1. Derivar o `month_key` a partir de `purchase_date` e do ciclo de fechamento vigente
   (`credit_card_statement_cycle` com `date_end = '9999-12-31'`).
2. Localizar ou criar a `credit_card_invoice` correspondente (`card_id` + `month_key`).
3. Setar `"transaction".invoice_id`.
4. Recalcular `total_amount`, `paid_amount` e `invoice_status_id` da fatura.

Ref.: `docs/specs/03-rules-cards-invoices.md`.

**Tabela extra?** Não. Usa `credit_card_invoice` e `credit_card_statement_cycle`.

---

## 6. Read-models (substituem as VIEWS)

Recriar como queries/projeções (LINQ) no backend — nenhuma precisa de tabela nova:

- **v_credit_cards_with_cycles** → join do cartão com o ciclo aberto, expondo
  `cycle_closing_day` / `cycle_due_day` (as colunas `closing_day`/`due_day` vivem só em
  `credit_card_statement_cycle`).
- **v_card_limits** → uso e limite disponível por cartão:
  `total_usage = Σ GREATEST(total_amount − paid_amount, 0)` sobre faturas não pagas;
  `available_limit = credit_limit − total_usage`. O `GREATEST(...,0)` é obrigatório para
  não inflar o limite quando um estorno deixa `total < paid` (ver §2 / RC-ALG-02).
- **v_installment_groups** → agregação por `installment_group_id`
  (declared = `installment_group.total_installments`; actual = `COUNT(*)`; somas de
  `amount` e de pagos; primeira/última `payment_date`).
- **v_recurring_groups** → análogo por `recurring_group_id`.

**Tabela extra?** Não. São agregações sobre dados existentes. (Se algum desses virar
gargalo de leitura sob volume, considerar VIEW materializada ou tabela de cache —
decisão de performance posterior, não estrutural.)

---

## 7. Autorização / isolamento multi-tenant (substitui RLS/policies)

Não há RLS. O isolamento é responsabilidade **obrigatória** do backend:

- **Filtro por tenant**: toda query sobre dados de usuário inclui `user_id = <usuário
  autenticado>`. Sem isso, há vazamento entre usuários.
- **Coerência de tenant entre FKs**: ao gravar uma transação, validar que
  `account_id`, `to_account_id`, `card_id`, `category_id`, `invoice_id` referenciados
  pertencem ao **mesmo** `user_id`. As FKs garantem existência, não dono.
- **Papéis (`"role"` + `user_role`)**: papéis em `"role"` (`admin`/`user`) e atribuição
  em `user_role` (N:N usuário↔papel). O antigo `profiles.is_admin` é substituído por
  papel `admin` em `user_role`. **Sem** tabela de permissões granulares (decisão de
  manter o schema enxuto) — o mapa de permissões abaixo é o contrato que o backend
  deve aplicar via código. Se um dia precisar de permissões consultáveis, adicionar
  `permission` + `role_permission` e popular com os códigos abaixo.

### 7.1 Roles derivadas das policies RLS do Supabase

As policies reais (migrations `20260222214300_initial_schema_metadata.sql`,
`20260405000007_infrastructure.sql`, admin RPCs `20260427000003`) mapeiam para 2 roles.
`admin` **herda** tudo de `user`.

**Padrão das policies de dados de usuário** — para TODAS as tabelas de domínio
(settings_salary, bank_account, category, credit_card, credit_card_invoice,
credit_card_statement_cycle, transaction, pluggy_item): `USING/WITH CHECK (user_id =
auth.uid())`. Ou seja, todo usuário faz CRUD apenas nas próprias linhas. `"user"`
(ex-profiles) segue `id = auth.uid()`.

### Role `user` (todo usuário autenticado)

| Permissão (código) | Cobre | Policy/RPC de origem |
|---|---|---|
| `profile.read.own` / `profile.write.own` | Ler/editar o próprio cadastro | profiles SELECT/INSERT/UPDATE `id=auth.uid()` |
| `account.read.own` / `account.write.own` | CRUD das próprias contas | bank_accounts policies `user_id=auth.uid()` |
| `transaction.read.own` / `transaction.write.own` | CRUD das próprias transações | transactions policies |
| `category.read.own` / `category.write.own` | CRUD das próprias categorias | categories policies |
| `card.read.own` / `card.write.own` | CRUD dos próprios cartões | credit_cards policies |
| `invoice.read.own` / `invoice.write.own` | CRUD das próprias faturas | credit_card_invoices policies |
| `statement_cycle.read.own` / `statement_cycle.write.own` | CRUD dos próprios ciclos | credit_card_statement_cycles policies |
| `salary_settings.read.own` / `salary_settings.write.own` | CRUD das próprias vigências salariais | settings_salary policies |
| `pluggy_item.read.own` / `pluggy_item.write.own` | CRUD dos próprios vínculos Pluggy | `user_owns_pluggy_item` `auth.uid()=user_id` |
| `system_config.read` | Ler config global (ex.: teto_inss) | system_config_select_authenticated `auth.uid() IS NOT NULL` |

### Role `admin` (herda `user` +)

| Permissão (código) | Cobre | Policy/RPC de origem |
|---|---|---|
| `user.read.all` | Listar todos os usuários | `admin_list_users()` + profiles_admin_select_all |
| `user.create` | Criar usuário (com flag admin) | `admin_create_user()` |
| `user.update` | Editar usuário/perfil; promover/rebaixar admin | `admin_update_user()` |
| `user.update_password` | Resetar senha de qualquer usuário | `admin_update_user_password()` |
| `user.delete` | Excluir usuário (**exceto a si mesmo** — regra no serviço) | `admin_delete_user()` |
| `system_config.write` | Alterar config global | system_config_admin_write (ALL) |
| `audit_log.read.all` | Ler a trilha de auditoria de todos | audit_log_admins_only (ALL) |

**Notas de enforcement:**
- O predicado de admin no Supabase era `EXISTS(profiles WHERE id=auth.uid() AND is_admin)`.
  No .NET, equivale a: o usuário tem o papel `admin` em `user_role`.
- `audit_log` nunca recebe escrita direta de usuário — o INSERT vinha de trigger
  SECURITY DEFINER. A única permissão humana acionável é `audit_log.read.all`.
- "Admin não pode se auto-deletar" é regra de negócio do serviço, não permissão.
- `site_branding` foi dropada no cloud — não modelada aqui.

**Tabela extra?** Não além de `"role"`/`user_role` (já no schema). Atribuir `user` a todo
novo cadastro; `admin` aos administradores.

---

## 8. Auditoria (`audit_log`)

Sem trigger de auditoria — o backend grava em `audit_log` a cada mutação relevante
(`audit_action_id` ∈ `audit_action`, `table_name`, `record_id`, `old_data`/`new_data`
em JSONB, `changed_by` = usuário autenticado). Observações:

- `changed_by` **sem FK** de propósito: a trilha deve sobreviver à exclusão do usuário.
- Nunca serializar `password_hash` nem segredos em `old_data`/`new_data`.
- Definir política de retenção/expurgo (LGPD: minimização e retenção).
- `audit_log` é append-only: a role da aplicação não deve ter UPDATE/DELETE nela
  (configurar via GRANT no deploy, fora deste schema mínimo).

**Tabela extra?** Não além da própria `audit_log` (já existe) e `audit_action` (catálogo).

---

## 9. Segurança operacional (fora do DDL mínimo, aplicar no deploy)

- Role de aplicação com privilégio mínimo (DML, sem DDL); migrations com owner separado.
- `audit_log` append-only para a role da aplicação.
- `"user".password_hash`: somente hash (PBKDF2/Argon2 via ASP.NET Identity); verificação
  na aplicação. Avaliar delegar 100% ao ASP.NET Identity.
- Considerar PK exposta: como agora a PK é `BIGINT` sequencial, evitar expor o id
  diretamente em URLs públicas se enumeração for preocupação (usar id alternativo/slug
  na API, se necessário).
