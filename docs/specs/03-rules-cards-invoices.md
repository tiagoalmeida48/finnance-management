# 03 — Cartões de Crédito, Ciclos e Faturas

> Contém os algoritmos de maior risco da migração: **vinculação de fatura** (RC-ALG-01) e **recálculo de fatura** (RC-ALG-02). A lógica de vinculação existe **duplicada** (trigger PL/pgSQL no server + `resolveStatementMonth` no client) — ambas transcritas e batem entre si, o que dá confiança no algoritmo.
>
> ✅ **Verificado contra os RPCs/triggers reais do banco cloud (2026-06-17).** RC-ALG-01, RC-ALG-02 e `reprocess_invoices_for_card` confirmados **idênticos** ao documentado. `create_credit_card_statement_cycle` existe no servidor e faz o split de ciclo (≡ RC-ALG-03). Correções: status `closed`/`overdue` não têm produtor (RC-ALG-02); o trigger inferido em RC-18 não existe como descrito. Detalhes no doc 10 §7.

---

## 1. Conceitos

- **Cartão** (`credit_cards`): pertence a uma conta bancária (`bank_account_id`), tem `credit_limit`. **Não** armazena mais `closing_day`/`due_day` (removidos).
- **Ciclo** (`credit_card_statement_cycles`): versão temporal de um par `closing_day`/`due_day`. Vigência `[date_start, date_end]`. O ciclo **vigente** tem `date_end = '9999-12-31'` (sentinel `OPEN_CYCLE_END`). Só 1 ciclo aberto por cartão (UNIQUE parcial).
- **Fatura** (`credit_card_invoices`): agregação mensal (`month_key = 'yyyy-MM'`) das transações daquele cartão. Criada sob demanda. Única por `(card_id, month_key)`.

---

## 2. Ciclo de vida do cartão

**RC-01 — Criar cartão (`create` client + `create_card` + `create_credit_card_statement_cycle`):**
1. `create_card(p_bank_account_id, p_name, p_color, p_credit_limit, p_notes)` → INSERT com `user_id = auth.uid()`.
2. Imediatamente cria o **primeiro ciclo** com `date_start = hoje` via `create_credit_card_statement_cycle`.
3. **Atômico com rollback:** se a criação do ciclo falhar, o cartão é removido (`delete_card`). → Em .NET, usar transação única.

**RC-02 — Atualizar cartão (`update_card`):** COALESCE em `name, color, credit_limit, bank_account_id, notes, is_active`. `WHERE id AND user_id`. Se não → *"Card not found"*.
- **Bloqueio client-side:** se `updates` contiver `closing_day` ou `due_day` → erro *"Alteracoes de vencimento e fechamento devem ser feitas pelo historico de ciclo da fatura."* (RT-06).

**RC-03 — Deletar cartão (`delete_card`):** soft-delete → `deleted_at = now(), is_active = false, updated_at = now()`. Se não → *"Card not found"*.

**RC-04 — Leitura (`get_cards` / view `v_credit_cards_with_cycles`):** retorna cartões não deletados do usuário com `cycle_closing_day`/`cycle_due_day` do ciclo aberto. O client (`getAll`) ainda enriquece com `get_all_card_stats` (usage/current_invoice/available_limit) e `get_cycles_by_card`.

---

## 3. Ciclos de vigência

**RC-05 — Listar (`get_cycles_by_card`):** valida ownership por join no cartão; ordena `date_start ASC`.

**RC-06 — Criar novo ciclo (`createStatementCycle`, client):** quando o usuário muda fechamento/vencimento a partir de uma data:
1. Usa `planCycleInsertion(cycles, dateStart)` (ver RC-ALG-03) para calcular como cortar o ciclo vigente.
2. Fecha o ciclo atual: `update_cycle_date_end` com `previousCycleNewEnd = dateStart - 1 dia`.
3. Cria o novo ciclo com `date_start = dateStart`, `date_end = '9999-12-31'`.

**RC-07 — Atualizar ciclo (`update_cycle`):** ✅ def. real — `UPDATE ... SET closing_day=p_closing_day, due_day=p_due_day, notes=p_notes WHERE id=p_id AND card_id IN (SELECT id FROM credit_cards WHERE user_id=auth.uid())`. Se não → *"Cycle not found"*. **Não** dispara propagação para `credit_cards` (o trigger inferido não existe — ver RC-18); os dias do ciclo vigente são lidos via view `v_credit_cards_with_cycles`. O trigger `..._no_overlap` valida sobreposição.

**RC-08 — Ajustar datas do ciclo:** `update_cycle_date_start(p_id, p_date_start)` / `update_cycle_date_end(p_id, p_date_end)` — ownership via subselect.

**RC-09 — Deletar ciclo (`deleteStatementCycle`, client):** se não for o último ciclo, estende o ciclo **anterior** para cobrir o período do deletado (`update_cycle_date_end`/`update_cycle_date_start`), e só então `delete_cycle`. Garante que não fique "buraco" temporal sem cobertura.

---

## 4. RC-ALG-01 — Algoritmo de vinculação de transação à fatura ⭐

> **Crítico.** Determina em qual fatura mensal uma compra de cartão cai. Implementado no trigger `trg_link_transaction_to_invoice` (server) e em `resolveStatementMonth` (client). As duas implementações são equivalentes — transcrição combinada abaixo.

**Entrada:** uma transação com `card_id`, `purchase_date` e/ou `payment_date`.

```
PASSO 1 — Se card_id é NULL → não faz nada (não é transação de cartão).

PASSO 2 — Resolver o ciclo do cartão:
  Server: busca o ciclo ABERTO (date_end = '9999-12-31') do cartão.
  Client: busca o ciclo cuja vigência [date_start, date_end] CONTÉM a data âncora
          (resolveStatementCycleForDate); se nenhum, usa o ciclo aberto como fallback.
  Se não há ciclo → não vincula (retorna sem invoice_id).
  → closing_day e due_day vêm desse ciclo.

PASSO 3 — Data âncora:
  anchor = purchase_date ?? payment_date   (apenas a parte yyyy-MM-dd; ignora horário)
  Se NULL → não vincula.

PASSO 4 — Dia do mês da âncora:
  day_of_month = EXTRACT(DAY FROM anchor)

PASSO 5 — Calcular o "month shift" (quantos meses avançar a partir do mês da compra):
  shift = 0
  SE day_of_month > closing_day  → shift += 1   (compra após o fechamento → cai no próximo ciclo)
  SE closing_day >= due_day      → shift += 1   (fechamento no mesmo mês ou após o vencimento → vence no mês seguinte)

PASSO 6 — month_key da fatura:
  month_key = to_char(anchor + shift meses, 'YYYY-MM')

PASSO 7 — Datas da fatura (para criação):
  primeiro_dia = primeiro dia do mês de month_key
  closing_date = primeiro_dia + (closing_day - 1) dias
  due_date     = primeiro_dia + (LEAST(due_day, último_dia_do_mês) - 1) dias   ← clamp p/ meses curtos

PASSO 8 — Buscar fatura existente:
  SELECT id FROM credit_card_invoices WHERE card_id = ? AND month_key = ?
  SE não existe → INSERT (user_id, card_id, month_key, closing_date, due_date) e usa o novo id.

PASSO 9 — Atribuir transaction.invoice_id = id_da_fatura.
```

**Exemplo (do client):** compra em 15/Jan, `closing_day = 10`, `due_day = 5`:
- `closingShift = (15 > 10) ? 1 : 0 = 1`
- `dueShift = (10 >= 5) ? 1 : 0 = 1`
- `shift = 2` → fatura de **Março** (`2025-03`).

> **Migração .NET:** Extrair isto para um serviço puro testável (`InvoiceLinkingService.ResolveStatementMonth(...)`). Deve ser chamado em **todo** create/update de transação com cartão, e em reprocessamento. Cobrir com testes de borda: compra no dia exato do fechamento, `closing_day == due_day`, `closing_day < due_day`, fevereiro/meses de 30 dias (clamp do `due_day`).

---

## 5. RC-ALG-02 — Recálculo do total da fatura ⭐

> `recalculate_invoice_total(p_invoice_id)`. Chamado após **toda** mutação que afeta transações de uma fatura (RT-04). Sem checagem de ownership (função interna chamada por RPCs já validadas).

```
PASSO 1 — Somar a partir das transações da fatura (WHERE invoice_id = p_invoice_id):
  total = COALESCE(SUM(CASE WHEN type = 'income' THEN -amount ELSE amount END), 0)
          ← income (estorno/crédito na fatura) ENTRA NEGATIVO no total
  paid  = COALESCE(SUM(CASE WHEN is_paid = true AND type <> 'income' THEN amount ELSE 0 END), 0)
          ← apenas despesas pagas contam como pago

PASSO 2 — Determinar status:
  SE total > 0 E paid >= total      → 'paid'
  SENÃO SE paid > 0 E paid < total  → 'partial'
  SENÃO                             → 'open'

PASSO 3 — Atualizar a fatura:
  UPDATE credit_card_invoices SET
    total_amount = total,
    paid_amount  = paid,
    status       = status,
    paid_at      = (status = 'paid' ? now() : NULL),
    updated_at   = now()
  WHERE id = p_invoice_id
```

> ✅ **Confirmado no banco real:** os status `'closed'` e `'overdue'` existem no enum mas **NENHUMA função/trigger os atribui** — varredura completa do catálogo confirma que só `open`/`partial`/`paid` são produzidos. Não há job de fechamento/vencimento. **Para a migração .NET:** implementar apenas open/partial/paid; tratar closed/overdue como funcionalidade futura não implementada (ou implementar um job de vencimento novo, se for requisito).

**RC-10 — Orquestração client (`recalculateInvoicesForTransactions`):** deduplica `invoice_id`s de uma lista de transações e dispara um recálculo por fatura, em paralelo.

---

## 6. RC-ALG-03 — Plano de inserção de ciclo (`planCycleInsertion`, client)

> Usado ao inserir um novo ciclo no meio de uma vigência existente. Todas as validações lançam erro em pt-BR.

```
Entrada: cycles (existentes, ordenados), dateStart (início do novo ciclo)

VALIDAÇÕES:
  1. cycles vazio → "Nao existe vigencia cadastrada para este cartao."
  2. dateStart < firstCycle.date_start → "A data de inicio nao pode ser anterior a {firstCycle.date_start}."
  3. nenhum ciclo contém dateStart → "Nao existe vigencia que contenha a data informada."
  4. dateStart <= targetCycle.date_start → "A data de inicio deve ser maior que {targetCycle.date_start}."
  5. (dateStart - 1 dia) < targetCycle.date_start → "Nao foi possivel dividir a vigencia atual com a data informada."

SAÍDA (plano):
  targetCycleId        = ciclo que será cortado
  targetCycleStart     = date_start original
  targetCycleEnd       = date_end original
  previousCycleNewEnd  = dateStart - 1 dia        (novo fim do ciclo cortado)
  newCycleStart        = dateStart
  newCycleEnd          = '9999-12-31'             (novo ciclo fica aberto)
```

---

## 7. Reprocessamento de faturas — `reprocess_invoices_for_card(p_card_id, p_from_date)`

> Reaplica a vinculação a partir de uma data (corrige drift após mudanças de ciclo/datas em massa).

**RC-11:**
1. Valida ownership do cartão. Se não → *"Card not found or not owned by current user"*.
2. Exige ciclo aberto. Se não → *"No open statement cycle found for card %"*.
3. Para cada transação do cartão com `payment_date >= p_from_date` OU `purchase_date >= p_from_date`:
   - Aplica o mesmo algoritmo RC-ALG-01 (shift/month_key/closing_date/due_date).
   - Busca ou cria a fatura.
   - Se a fatura mudou, `UPDATE transactions SET invoice_id = nova` **diretamente** (sem disparar o trigger de link).
4. Recalcula `recalculate_invoice_total` para todas as faturas distintas do cartão.
5. **Limpeza:** `DELETE FROM credit_card_invoices WHERE card_id = p_card_id AND id NOT IN (faturas ainda referenciadas)` — remove faturas que ficaram vazias.

- Client: `reprocessInvoicesFromDate(cardId, fromDate)` normaliza `fromDate` para `slice(0,10)`.

---

## 8. Faturas — consultas e pagamento

**RC-12 — `get_invoices_by_card(p_card_id, p_year?)`:** join + ownership. Se `p_year`, filtra `month_key BETWEEN 'YYYY-01' AND 'YYYY-12'`. Ordena `month_key DESC`.

**RC-13 — `get_invoice_by_month(p_card_id, p_month_key)`:** join + ownership; linha única. Client ignora erro PGRST116 (not found → null).

**RC-14 — Pagar fatura (UI "Pay Bill"):** não há RPC específica; o pagamento de fatura é feito pagando as transações da fatura (`batch_pay_transactions`) e/ou marcando como pagas, o que dispara o recálculo (status → partial/paid). Confirmar o fluxo exato do modal `PayBillModal` na fase de design.

---

## 9. Estatísticas de cartão

**RC-15 — `get_all_card_stats(p_user_id?)` → `(card_id, usage, current_invoice, available_limit)`:**
- `usage` = `SUM(total_amount - paid_amount)` das faturas com `status <> 'paid'` (uso total do limite).
- `current_invoice` = `total_amount - paid_amount` da fatura do mês corrente (`month_key = to_char(CURRENT_DATE, 'YYYY-MM')`).
- `available_limit` = `credit_limit - usage`.
- Ownership: `c.user_id = COALESCE(p_user_id, auth.uid())` (admin pode passar outro usuário).

**RC-16 — `get_card_stats(p_card_id)` → jsonb `{ usage, current_invoice, available_limit }`:** idem, para um cartão; `WHERE c.id = p_card_id AND c.user_id = auth.uid()`.

**RC-17 — View `v_card_limits`:** `total_usage` e `available_limit` por cartão (não deletado). Equivalente a `get_all_card_stats` em forma de read-model.

---

## 10. Triggers de ciclo — ✅ CORRIGIDO vs. verificação

**RC-18 (corrigido).** O trigger inferido `trg_sync_card_closing_due_day` **não existe**. O que existe:
- **`trg_credit_card_statement_cycles_no_overlap`** (BEFORE INSERT/UPDATE em `credit_card_statement_cycles`): impede vigências de ciclo sobrepostas para o mesmo cartão → exceção *"A vigencia informada sobrepoe outro periodo ja existente para o cartao."* **Replicar no .NET.**
- Existe uma função órfã `sync_credit_card_cycle_days(p_card_id, p_reference_date)` que tentaria propagar `closing_day`/`due_day` para `credit_cards` — mas essas colunas **não existem mais** e **nenhum trigger a chama**. É código morto. **Não portar.**
- A unicidade "1 ciclo aberto por cartão" é garantida pelo índice `uq_card_open_cycle`; e `(card_id, date_start)` único por `credit_card_statement_cycles_card_start_uniq`.

---

## 11. Checklist de migração .NET para Cartões/Faturas

- [ ] `InvoiceLinkingService` puro implementando RC-ALG-01 (com testes de borda).
- [ ] `InvoiceService.RecalculateTotal(invoiceId)` implementando RC-ALG-02.
- [ ] `CardService` com create (cartão + 1º ciclo atômico), update (bloqueando closing/due), soft-delete.
- [ ] `StatementCycleService` com planInsertion (RC-ALG-03), create/update/delete com manutenção de continuidade temporal.
- [ ] `ReprocessInvoicesService` (RC-11) incluindo limpeza de faturas vazias.
- [ ] Cálculo de stats (usage/current_invoice/available_limit) como queries (defs reais confirmadas: `get_all_card_stats`/`get_card_stats`).
- [ ] Validação de não-sobreposição de ciclos (trigger `..._no_overlap`).
- [ ] Garantir UNIQUE `(card_id, month_key)`, "1 ciclo aberto por cartão" e `(card_id, date_start)` único.
- [ ] ⚠️ `closed`/`overdue` sem produtor — não implementar no MVP (ou criar job de vencimento novo). NÃO portar `sync_credit_card_cycle_days` (morta).
