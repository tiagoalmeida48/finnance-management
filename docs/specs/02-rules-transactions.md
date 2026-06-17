# 02 — Regras de Transações

> Entidade central do sistema. Lógica hoje dividida entre RPCs PL/pgSQL (server) e services TS (client). Cada regra tem ID estável (`TX-NN`).
>
> ✅ **Verificado contra os RPCs reais do banco cloud (2026-06-17).** Pontos corrigidos vs. a versão inferida: `update_transaction` usa detecção de chave presente (não COALESCE) — ver TX-08; `create_transaction` valida `amount > 0` — ver TX-01. Detalhes no doc 10 §7.

---

## 1. Modelo conceitual da transação

Uma transação tem um `type` que define seu efeito:
- **`income`** — entrada; aumenta saldo da conta (se paga e sem cartão).
- **`expense`** — saída; diminui saldo da conta (se paga e sem cartão).
- **`transfer`** — movimento entre duas contas próprias (`account_id` → `to_account_id`).

Eixos ortogonais ao `type`:
- **Cartão vs. conta:** se `card_id` preenchido, é compra no cartão → não move saldo de conta diretamente, é agregada numa fatura. CHECK exige `account_id` mesmo quando há cartão (`chk_card_has_account`).
- **Paga vs. pendente:** `is_paid` controla se já afetou o saldo.
- **Simples / parcelada / recorrente:** ver TX-02 e TX-03.

---

## 2. Invariantes (constraints — sempre válidas)

- **TX-INV-01** `amount > 0` sempre. Sinal é dado pelo `type`.
- **TX-INV-02** `type ∈ {income, expense, transfer}`.
- **TX-INV-03** `payment_method ∈ {credit, debit, pix, cash, bill_payment, transfer, other}` ou NULL.
- **TX-INV-04** `to_account_id` só pode existir se `type = 'transfer'`.
- **TX-INV-05** Se `card_id` preenchido, `account_id` é obrigatório.
- **TX-INV-06** Parcelas: `installment_number` e `total_installments` ou ambos NULL ou ambos preenchidos; `1 <= installment_number <= total_installments`.
- **TX-INV-07** `is_paid` é NOT NULL, default `false`.

---

## 3. Criação de transação — `create_transaction(p_data jsonb)` → `{ id, group_id }`

**TX-01 — Autenticação e validação inicial.** Resolve `user_id = auth.uid()`. Se NULL → exceção *"Not authenticated"*. Em seguida valida `(amount)::numeric > 0` → senão exceção *"amount must be positive"* (✅ confirmado no RPC real).

### Parâmetros aceitos (jsonb)
`type, amount, payment_date, purchase_date, description, account_id, to_account_id, card_id, category_id, payment_method, notes, is_paid (def. false), is_fixed (def. false), is_installment (def. false), total_installments (def. 1), repeat_count (def. 1), installment_amounts (array opcional), recurring_group_id`.

### Ramos de decisão (mutuamente exclusivos, nesta ordem)

**TX-02 — Ramo Parcelado** (quando `is_installment = true` OU `total_installments > 1`):
1. Gera `group_id = novo UUID`.
2. Loop `i` de 1 a `total_installments`:
   - `amount`: `installment_amounts[i-1]` se fornecido, senão o `amount` base.
   - `payment_date`: `payment_date_base + (i-1) meses`.
   - `purchase_date`: `purchase_date_base + (i-1) meses` (se informado).
   - `description`: `"<base> (NN/MM)"` com `NN`=número da parcela e `MM`=total, ambos com **zero-padding de 2 dígitos** (lpad).
   - `is_paid = false`, `is_fixed = false`.
   - `installment_group_id = group_id`, `installment_number = i`, `total_installments = N`.
   - `recurring_group_id = NULL`.
   - Cada INSERT dispara a vinculação de fatura (RT-05) e a sincronização de saldo (RT-03).

**TX-03 — Ramo Recorrente** (quando `is_fixed = true` E `repeat_count > 1`):
1. Gera `group_id = novo UUID`.
2. Loop `i` de 0 a `repeat_count - 1`:
   - `payment_date`: `payment_date_base + i meses`.
   - `purchase_date`: `purchase_date_base + i meses` (se informado).
   - `description`: sem sufixo.
   - `is_paid = false`, `is_fixed = true`.
   - `recurring_group_id = group_id`, `installment_group_id = NULL`, `total_installments = 1`.

**TX-04 — Ramo Simples** (caso contrário):
1. INSERT único, `total_installments = 1`.
2. `recurring_group_id`: preenchido apenas se `is_fixed = true` E foi fornecido no payload.

**TX-05 — Retorno.** `{ "id": <id da última transação inserida>, "group_id": <group_id ou null> }`. O frontend depois busca a transação completa via `getById`.

### Sanitização client-side (antes de chamar o RPC)
**TX-06.** O service remove campos read-only/join: `id, created_at, updated_at, bank_account, to_bank_account, category, credit_card, user_id`. Campos UUID vazios (`""`) → `null`: `category_id, account_id, to_account_id, card_id, installment_group_id, recurring_group_id, invoice_id`.

---

## 4. Atualização de transação — `update_transaction(p_id, p_updates jsonb)` → transaction

**TX-07 — Whitelist de campos.** Apenas estes podem ser atualizados; qualquer outra chave → exceção *"Field not allowed: <campo>"*:
`type, amount, payment_date, purchase_date, description, is_paid, is_fixed, account_id, to_account_id, category_id, card_id, invoice_id, installment_number, total_installments, installment_group_id, recurring_group_id, payment_method, notes`.

**TX-08 — Aplicação (semântica de patch parcial). ✅ CORRIGIDO.** Para cada campo, o RPC usa `CASE WHEN p_updates ? 'campo' THEN (p_updates->>'campo')::tipo ELSE t.campo END` — ou seja, decide pela **presença da chave** no JSON, não por COALESCE. **Consequência crítica:** passar `"campo": null` explicitamente **SETA o campo como NULL**; omitir a chave **preserva** o valor atual. (Este é o fix `fix_update_transaction_coalesce_null`.) `WHERE id = p_id AND user_id = auth.uid()`. Se não encontrar → exceção *"Transaction not found"*.
> **Migração .NET:** não usar COALESCE/`??`. Receber o patch como dicionário e aplicar apenas chaves presentes, permitindo `null` explícito limpar o campo. Um DTO com `JsonElement`/`Optional<T>` por campo, ou um `Dictionary<string,object?>`, modela isso corretamente.

**TX-09 — Efeitos colaterais.** Mudar `card_id`/`purchase_date`/`payment_date` re-dispara vinculação de fatura. Qualquer mudança re-dispara sincronização de saldo.

**TX-10 — Recálculo de fatura (orquestrado pelo client `update`).**
- Se `card_id` OU (`purchase_date`/`payment_date`) mudaram **e havia** `invoice_id` anterior → recalcular a **fatura antiga**.
- Se `amount`, `type` ou `is_paid` mudaram → recalcular a **fatura nova** (atual).

**TX-11 — Toggle de pagamento.** `togglePaymentStatus(id, currentStatus)` = `update(id, { is_paid: !currentStatus })`.

---

## 5. Exclusão de transação

**TX-12 — `delete_transaction(p_id)`** — `DELETE WHERE id AND user_id = auth.uid() RETURNING *`. Se não encontrar → *"Transaction not found"*. Dispara reversão de saldo (RT-03). Client recalcula a fatura se a transação tinha `invoice_id` (RT-04).

---

## 6. Duplicação

**TX-13 — `duplicate(id)`** (client-side, via `create`):
1. Busca a original.
2. Remove o sufixo de parcela `(NN/MM)` da descrição.
3. Cria cópia com `is_fixed = false, is_paid = false, installment_group_id = null, installment_number = null, total_installments = 1, invoice_id = null`.
4. Acrescenta `" (copia)"` à descrição.

---

## 7. Operações em lote (batch)

**TX-14 — `batch_pay_transactions(p_ids, p_account_id, p_payment_date)`:**
1. Captura `invoice_ids` distintos das transações antes do update (com `invoice_id IS NOT NULL AND user_id = auth.uid()`).
2. `UPDATE transactions SET is_paid = true, payment_date = p_payment_date, account_id = p_account_id, updated_at = now() WHERE id = ANY(p_ids) AND user_id = auth.uid()` → dispara vinculação + sincronização de saldo.
3. Para cada `invoice_id` capturado: `recalculate_invoice_total`.
- Client sanitiza IDs (remove vazios) e rebusca via `get_transactions_by_ids`.

**TX-15 — `batch_unpay_transactions(p_ids)`:**
1. Captura `invoice_ids` antes.
2. `UPDATE ... SET is_paid = false, updated_at = now()` → reverte saldo.
3. Recalcula faturas afetadas.

**TX-16 — `batch_delete_transactions(p_ids)`:**
1. Captura `invoice_ids` antes.
2. `DELETE WHERE id = ANY(p_ids) AND user_id = auth.uid()` → reverte saldo + auditoria.
3. Recalcula faturas afetadas.

**TX-17 — `batch_change_day(p_ids, p_day)`:** muda só o **dia** da `payment_date` (e `purchase_date`) preservando mês/ano:
1. `clamped_day = GREATEST(1, LEAST(31, p_day))`.
2. Captura `invoice_ids` antigos.
3. Para cada transação: nova data = `date_trunc('month', data) + (LEAST(clamped_day, último_dia_do_mês) - 1) dias`. Só faz UPDATE se algo mudou (evita triggers à toa). A mudança de data re-vincula a fatura.
4. Recalcula faturas **antigas e novas** (as novas atribuídas pelo re-link).

**TX-18 — `batchCreate` (client):** Se **qualquer** item tiver `is_installment`, `total_installments > 1`, ou `is_fixed && repeat_count > 1` → usa `create()` individual por item (Promise.all). Caso contrário → `insert_transactions` (bulk simples, sem validação de grupo/parcela). Sanitiza cada payload (TX-06).

**TX-19 — `insert_transactions(p_rows jsonb)` → SETOF transactions:** INSERT direto, sem lógica de grupo/parcela. Uso interno (import/Pluggy/bulk). **Cuidado:** ainda assim cada INSERT dispara os triggers (vinculação de fatura + saldo).

---

## 8. Operações em grupo (parcelamento / recorrência)

`p_type ∈ {'installment', 'recurring'}` — qualquer outro valor → exceção. Determina a coluna de grupo (`installment_group_id` ou `recurring_group_id`).

**TX-20 — `delete_transaction_group(p_group_id, p_type)`:**
1. Captura `invoice_ids` de todas as transações do grupo.
2. `DELETE FROM transactions WHERE {coluna_grupo} = p_group_id AND user_id = auth.uid()` (dinâmico).
3. Recalcula faturas afetadas.

**TX-21 — `update_transaction_group(p_group_id, p_type, p_updates jsonb)` → uuid[]:**
1. Captura `invoice_ids` antigos.
2. Itera transações do grupo (ordenadas por `installment_number ASC` para installment; `payment_date ASC` para recurring):
   - **`payment_date`** no payload → extrai apenas o **dia** e aplica preservando mês/ano de cada transação (com clamp ao último dia do mês).
   - **`purchase_date`**: se `null` no payload → seta NULL; se data → troca só o dia preservando mês/ano.
   - **`description`**:
     - installment → remove sufixo `(NN/MM)` existente, aplica nova base e reconstrói o sufixo `(installment_number/total_installments)` com lpad.
     - recurring → usa a description do payload diretamente.
   - Demais campos do payload (`amount`, `category_id`, etc.) → aplicados diretamente.
   - Só faz UPDATE se houver mudança; acumula IDs alterados.
3. Recalcula faturas antigas, depois captura faturas novas e recalcula as novas.
4. Retorna IDs atualizados.

**TX-22 — Campos proibidos em update de grupo** (filtrados pelo client antes de enviar, `DISALLOWED_GROUP_FIELDS`):
`id, installment_number, installment_group_id, recurring_group_id, invoice_id, created_at, updated_at, user_id, total_installments`.

**TX-23 — `insert_installment_between(p_transaction_id)` → uuid (nova parcela):**
1. Carrega a transação (`id AND user_id`). Se não → *"Transaction not found or not owned by current user"*.
2. Exige `installment_group_id` não-nulo. Senão → *"Selected transaction does not belong to an installment group"*.
3. `current_total = MAX(GREATEST(installment_number, total_installments))` do grupo.
4. `insertion_number = LEAST(selecionada.installment_number + 1, current_total + 1)`.
5. `new_total = current_total + 1`.
6. `base_desc` = description sem sufixo `(NN/MM)`.
7. Captura `invoice_ids` antigos.
8. Datas da nova parcela: se já existe parcela na posição `insertion_number`, usa as datas dela; senão `selecionada.payment_date + 1 mês` (e idem purchase_date).
9. **Shift** (ordem decrescente de `installment_number`, para parcelas `>= insertion_number`): `installment_number += 1`, `total_installments = new_total`, `payment_date += 1 mês`, `purchase_date += 1 mês` (se não nulo), reconstrói sufixo.
10. Parcelas `< insertion_number`: só atualiza `total_installments` e o sufixo.
11. INSERT da nova parcela na posição, com `is_paid = false, is_fixed = false, recurring_group_id = null`. Dispara vinculação de fatura.
12. Recalcula faturas antigas e novas.
13. Retorna o ID da nova parcela.

---

## 9. Consultas (read)

**TX-24 — `get_transactions_paginated(...)` → linhas + `total_count`.** Filtros (todos opcionais):
`start_date, end_date, type, is_paid, account_id, card_id, category_id, payment_method, search (ILIKE '%...%' em description), hide_credit_cards (exclui card_id IS NOT NULL), only_credit_cards (exclui card_id IS NULL), only_installments (exclui installment_group_id IS NULL), sort_field (whitelist; default 'payment_date'), sort_asc (default false), limit (1..10000, default 50), offset (default 0)`.
Joins: `bank_accounts` (account_id e to_account_id), `categories`, `credit_cards`. Window `COUNT(*) OVER()` retorna o total para paginação. Client: `limit = -1` → usa 10000; faz loop de paginação (`page_size = 1000`) quando precisa de tudo.

**TX-25 — `get_transactions_summaries(...)`:** mesmos filtros, sem sort/limit/offset. Retorna `{ income, expense, pending }`:
- `income = SUM(amount) WHERE type = 'income'`
- `expense = SUM(amount) WHERE type IN ('expense','transfer')` (com filtros de cartão aplicados)
- `pending = SUM(amount) WHERE NOT is_paid`

**TX-26 — `get_transaction_by_id(p_id)`:** SELECT com joins, `WHERE id AND user_id = auth.uid()`.

**TX-27 — `get_transactions_by_ids(p_ids)`:** `WHERE id = ANY(p_ids) AND user_id = auth.uid()`.

**TX-28 — `get_first_transaction_date()`:** menor `payment_date` do usuário (usado para limites de filtro do dashboard). Client retorna `null` em erro.

---

## 10. Triggers que tocam transações (resumo — detalhe em 03 e 04)

- **`trg_link_to_invoice`** (BEFORE INSERT/UPDATE de `card_id`,`purchase_date`,`payment_date`): vincula a transação de cartão à fatura mensal correta, criando-a se preciso. Ver RC-ALG-01.
- **`trg_sync_account_balance`** (AFTER INSERT/UPDATE/DELETE): ajusta `current_balance` das contas. Ver AC-ALG-01.
- **`audit_transactions`** (AFTER INSERT/UPDATE/DELETE): grava em `audit_log`.

---

## 11. Checklist de migração .NET para Transações

- [ ] Serviço `TransactionService` com métodos espelhando os RPCs (create/update/delete/batch*/group*/insertBetween/queries).
- [ ] Reimplementar os 3 ramos de `create_transaction` (simples/parcelado/recorrente) com geração de `group_id`.
- [ ] Toda mutação dentro de **transação de banco** (RT-07).
- [ ] Após cada mutação, orquestrar: vinculação de fatura → sincronização de saldo → recálculo de fatura (antiga + nova).
- [ ] Whitelist de campos em update (TX-07) e campos proibidos em update de grupo (TX-22).
- [ ] Geração de sufixo `(NN/MM)` com lpad de 2 dígitos e o regex de strip do sufixo: `/\(\s*\d+\s*\/\s*\d+\s*\)\s*$/i`.
- [ ] Lógica de "trocar só o dia preservando mês/ano com clamp ao último dia" (TX-17, TX-21) — função utilitária compartilhada.
- [ ] Preservar mensagens de erro (algumas em inglês no RPC, ex.: "Transaction not found"; padronizar com o time se for traduzir).
