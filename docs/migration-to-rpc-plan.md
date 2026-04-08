# Plano de Migracao: Regras de Negocio para RPCs Supabase

## Contexto

O app atualmente roda ~35 regras de negocio no frontend React, comunicando diretamente com tabelas do Supabase via API REST. O RLS protege isolamento entre usuarios, mas **nao valida consistencia de negocio**, permitindo race conditions, over-fetching e dados inconsistentes se requisicoes forem feitas diretamente.

**A ja existente:** A migration `20260320000000` ja criou 3 RPCs de dashboard, 1 trigger de sync de saldo, 1 trigger de overlap salarial, 1 trigger de sync de card closing/due day, constraints (type check, payment method, transfer account, card has account, invoice unique card+month, invoice status, site branding singleton). Este plano **complementa** o que falta.

A decisao arquitetal e mover logica de negocio com side-effect para **Stored Procedures (RPCs `SECURITY DEFINER`)** no PostgreSQL, e manter calculos puros (input → output sem I/O) como funcoes utilitarias no frontend.

---

## Principio de Design

### O que vai para RPC
- Operacoes com **side-effect** no banco (INSERT, UPDATE, DELETE + logics)
- Operacoes que **devem ser atomicas** (multi-step: insert A → update B → recalculate C)
- Operacoes com **race condition** no frontend (check-then-act)
- Agregacoes que geram **over-fetching** (SELECT * → GROUP BY client-side)

### O que FICA no frontend
- **Calculos puros** sem I/O (ex: `calculatePayroll` — input matematico, nenhum side-effect)
- **Formatacao** de datas, moeda, strings
- **Validacao de formulario** UI (Zod no RHF) — o banco valida de novo, mas a UX do form eh client-side
- **Orquestracao de estado** (React Query, Zustand, modais)

### Regras para cada RPC
1. Usar `SECURITY DEFINER` para operar com permissoes de dono da tabela
2. Validar inputs na entrada da funcao (RAISE EXCEPTION se invalido)
3. Executar operacoes atomicas num unico escopo de transacao
4. Retornar tipos concretos (`SETOF tabela`, `TABLE(...)`, ou JSONB) com clareza
5. Incluir `user_id = auth.uid()` explicitamente — nao confiar so no SECURITY DEFINER
6. O frontend vira thin wrapper: chama RPC + invalida cache do React Query

---

## Fases de Implementacao

### Fase 1: Dashboard — Conectar RPCs ja existentes

**Status:** Pendente
**Dependencia:** Nenhuma (RPCs ja criadas na migration `20260320000000`, secao #5)
**Impacto:** Alto (performance) | **Risco:** Baixo

**Problema atual:** `dashboard.service.ts` faz `SELECT *` e agrega em memoria. As 3 RPCs ja existem mas **nao sao chamadas**.

#### RPCs existentes ja prontas

| RPC | Assinatura | Retorna |
|-----|-----------|---------|
| `get_dashboard_stats_aggregated` | `(p_start_date DATE DEFAULT NULL, p_end_date DATE DEFAULT NULL)` | `TABLE(total_income NUMERIC, total_expense NUMERIC)` |
| `get_dashboard_chart_data` | `(p_start_date DATE, p_end_date DATE)` | `TABLE(month_key TEXT, total_income NUMERIC, total_expense NUMERIC)` |
| `get_category_distribution` | `(p_start_date DATE DEFAULT NULL, p_end_date DATE DEFAULT NULL)` | `TABLE(category_name TEXT, total_amount NUMERIC)` |

**O que falta:** O dashboard tambem precisa de `totalBalance`, `totalLimit` e `monthlyIncome` com `initial_balance`. As 3 RPCs atuais retornam so `total_income`/`total_expense`. Precisamos de mais 2 RPCs:

```sql
-- Retorna: total_balance, total_available_limit
CREATE OR REPLACE FUNCTION public.get_dashboard_balances()
RETURNS TABLE (total_balance NUMERIC, total_available_limit NUMERIC)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COALESCE((SELECT SUM(current_balance) FROM public.bank_accounts
              WHERE user_id = auth.uid() AND deleted_at IS NULL), 0),
    COALESCE((SELECT SUM(credit_limit) FROM public.credit_cards
              WHERE user_id = auth.uid() AND deleted_at IS NULL), 0)
    -
    COALESCE((SELECT SUM(total_amount - paid_amount) FROM public.credit_card_invoices
              WHERE card_id IN (SELECT id FROM public.credit_cards
                                WHERE user_id = auth.uid() AND deleted_at IS NULL)
              AND status != 'paid'), 0);
$$;

-- Retorna: monthly_income incluindo initial_balance quando aplicavel
CREATE OR REPLACE FUNCTION public.get_dashboard_monthly_income(
  p_start_date DATE DEFAULT NULL,
  p_end_date   DATE DEFAULT NULL
)
RETURNS TABLE (monthly_income NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_income NUMERIC;
  v_include_initial BOOLEAN;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM public.transactions
  WHERE user_id = auth.uid()
    AND type = 'income'
    AND (p_start_date IS NULL OR payment_date >= p_start_date)
    AND (p_end_date IS NULL OR payment_date <= p_end_date);

  -- Incluir initial_balance apenas se o periodo inclui o primeiro mes do usuario
  v_include_initial := (
    p_start_date IS NULL OR
    p_start_date <= (SELECT MIN(payment_date) FROM public.transactions WHERE user_id = auth.uid())
  );

  IF v_include_initial THEN
    v_income := v_income + COALESCE(
      (SELECT SUM(initial_balance) FROM public.bank_accounts
       WHERE user_id = auth.uid() AND deleted_at IS NULL), 0);
  END IF;

  monthly_income := v_income;
  RETURN NEXT;
END;
$$;
```

**Arquivo afetado:** `src/shared/services/dashboard.service.ts` — de ~180 linhas para ~30.

---

### Fase 2: Invoice Reconciliation

**Status:** Pendente
**Dependencia:** Nenhuma
**Impacto:** Alto (consistencia) | **Risco:** Medio

**Problema atual:** `recalculateInvoiceTotal()` em `invoice-reconciliation.service.ts` buscate TODAS as transacoes da fatura, soma `amount` no JS, determina status (`open`/`partial`/`paid`) e faz UPDATE. Race condition se duas edicoes concorrentes.

#### RPC 1: `recalculate_invoice_totals(p_invoice_id UUID)`

```sql
CREATE OR REPLACE FUNCTION public.recalculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_amount  NUMERIC := 0;
  v_paid_amount   NUMERIC := 0;
  v_status        TEXT;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN -amount ELSE amount END), 0),
    COALESCE(SUM(CASE WHEN is_paid THEN (CASE WHEN type = 'income' THEN -amount ELSE amount END) ELSE 0 END), 0)
  INTO v_total_amount, v_paid_amount
  FROM public.transactions
  WHERE invoice_id = p_invoice_id;

  IF v_paid_amount >= v_total_amount AND v_total_amount > 0 THEN
    v_status := 'paid';
  ELSIF v_paid_amount > 0 AND v_paid_amount < v_total_amount THEN
    v_status := 'partial';
  ELSIF v_total_amount > 0 THEN
    v_status := 'open';
  ELSE
    v_status := 'open';
  END IF;

  UPDATE public.credit_card_invoices
  SET total_amount = v_total_amount,
      paid_amount  = v_paid_amount,
      status       = v_status,
      paid_at      = CASE WHEN v_status = 'paid' THEN now() ELSE NULL END,
      updated_at   = now()
  WHERE id = p_invoice_id;
END;
$$;
```

**Arquivos afetados:** `shared/services/invoice-reconciliation.service.ts` — `recalculateInvoiceTotal` vira `supabase.rpc('recalculate_invoice_totals', { p_invoice_id })`.

---

### Fase 3: Transaction Lifecycle

**Status:** Pendente
**Dependencia:** Fase 2
**Impacto:** Alto (parcelas) | **Risco:** Medio

**Problema atual:** Geracao de parcelas e recorrentes ocorre inteiramente no cliente. O cliente decide valores, datas, descricoes. `total_installments` e `installment_number` nao tem constraint no banco. Sem atomicidade — se uma parcela falhar no meio, o grupo fica inconsistente.

**Nota de design:** Usar parâmetros nomeados em vez de JSONB para facilitar chamadas e type safety no TypeScript gerado.

#### RPC 2: `create_transaction_with_installments`

```sql
CREATE OR REPLACE FUNCTION public.create_transaction_with_installments(
  p_type             TEXT,
  p_amount           NUMERIC,
  p_description      TEXT,
  p_payment_date     DATE,
  p_purchase_date    DATE DEFAULT NULL,
  p_account_id       UUID  DEFAULT NULL,
  p_to_account_id    UUID  DEFAULT NULL,
  p_card_id          UUID  DEFAULT NULL,
  p_category_id      UUID  DEFAULT NULL,
  p_notes            TEXT  DEFAULT NULL,
  p_payment_method   TEXT  DEFAULT NULL,
  p_total_installments INT DEFAULT 2,
  p_installment_amounts NUMERIC[] DEFAULT NULL  -- array opcional com valores individuais
)
RETURNS SETOF public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id  UUID := gen_random_uuid();
  v_result    RECORD;
  v_total     INT;
  i           INT;
  v_amount    NUMERIC;
BEGIN
  -- Validar inputs
  IF p_type NOT IN ('income', 'expense', 'transfer') THEN
    RAISE EXCEPTION 'Tipo invalido: %', p_type;
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser positivo';
  END IF;

  v_total := GREATEST(2, LEAST(120, p_total_installments));

  FOR i IN 1..v_total LOOP
    -- Usa valor individual se fornecido, senao divide igual
    v_amount := COALESCE(
      p_installment_amounts[i],
      ROUND(p_amount / v_total, 2)
    );

    INSERT INTO public.transactions (
      user_id, type, amount, description, payment_date, purchase_date,
      account_id, to_account_id, card_id, invoice_id, category_id,
      is_fixed, is_paid, installment_group_id, installment_number,
      total_installments, recurring_group_id, notes, payment_method
    ) VALUES (
      auth.uid(),
      p_type,
      v_amount,
      p_description || ' (' || LPAD(i::TEXT, 2, '0') || '/' || LPAD(v_total::TEXT, 2, '0') || ')',
      p_payment_date + ((i - 1) * INTERVAL '1 month'),
      CASE WHEN p_purchase_date IS NOT NULL
        THEN p_purchase_date + ((i - 1) * INTERVAL '1 month')
        ELSE NULL END,
      p_account_id,
      p_to_account_id,
      p_card_id,
      NULL,
      p_category_id,
      false, false,
      v_group_id, i, v_total,
      NULL,
      p_notes,
      p_payment_method
    ) RETURNING * INTO v_result;

    -- Link to invoice (cria fatura se necessario)
    PERFORM public.link_transaction_to_invoice(v_result.id);

    RETURN NEXT v_result;
  END LOOP;
END;
$$;
```

**Correcao vs plano original:** A sintaxe original `::DATE + ((i - 1) * INTERVAL '1 month')::DATE` nao compila. O cast `::DATE` no resultado de INTERVAL e invalido. A sintaxe correta e `p_payment_date + ((i - 1) * INTERVAL '1 month')` — o Postgres faz a conversao implicita corretamente.

#### RPC 3: `create_transaction_with_recurrences`

```sql
CREATE OR REPLACE FUNCTION public.create_transaction_with_recurrences(
  p_type             TEXT,
  p_amount           NUMERIC,
  p_description      TEXT,
  p_payment_date     DATE,
  p_purchase_date    DATE DEFAULT NULL,
  p_account_id       UUID  DEFAULT NULL,
  p_to_account_id    UUID  DEFAULT NULL,
  p_card_id          UUID  DEFAULT NULL,
  p_category_id      UUID  DEFAULT NULL,
  p_notes            TEXT  DEFAULT NULL,
  p_payment_method   TEXT  DEFAULT NULL,
  p_repeat_count     INT   DEFAULT 2
)
RETURNS SETOF public.transactions
LANGUAGE plpgsql
SECURITY DEFINER AS $$
-- Igual ao de cima, porem:
--   - recurring_group_id = gen_random_uuid()
--   - is_fixed = true
--   - installment_group_id = NULL
--   - max repeat_count = 60
--   - link_transaction_to_invoice em cada iteracao
$$;
```

#### RPC 4: `update_transaction_group(p_group_id UUID, p_type TEXT, p_updates JSONB)`

```sql
-- type = 'installment' | 'recurring'
-- Para parcelas: reconstrui descricoes com (NN/TT) via SQL
-- Para datas: preserva mes, troca dia (LEAST(dia, ultimo_dia_do_mes))
-- Campos proibidos de alterar via p_updates: id, installment_number,
--   installment_group_id, recurring_group_id, invoice_id, user_id, total_installments
-- Retorna transacoes atualizadas
```

#### RPC 5: `insert_installment_between(p_transaction_id UUID)`

```sql
-- Le grupo, insere nova parcela na posicao seguinte
-- Renumber subsequentes com SHIFT (installment_number + 1)
-- Atualiza total_installments de todas no grupo
-- Atomic
```

**Arquivos afetados:** `transactions-creation.service.ts`, `transactions-installments.service.ts` ficam como thin wrappers.

---

### Fase 4: Link Transaction to Invoice

**Status:** Pendente
**Dependencia:** Fase 2
**Impacto:** Alto (integridade) | **Risco:** Alto

**Problema atual:** Logica de `resolveStatementMonth` (determinar qual fatura uma compra pertence baseado em closing_day vs due_day) roda no JS. Se o cliente manipula, transacoes vao para faturas erradas.

#### RPC 6: `link_transaction_to_invoice(p_transaction_id UUID)`

A logica de `resolveStatementMonth` do frontend tem 2 fases:
1. **Resolver o mes da fatura** (anchor_date + closing_day → month_key)
2. **Criar fatura se nao existir** (INSERT ... ON CONFLICT)

No banco, o `closing_day` e `due_day` corretos para a data da transacao devem vir do `statement_cycle` ativo na data. A migration `20260320000000` ja criou `trg_sync_card_closing_due_day` que propaga do ciclo aberto para `credit_cards`, entao o fallback simples e ler de `credit_cards.closing_day/due_day`.

```sql
CREATE OR REPLACE FUNCTION public.link_transaction_to_invoice(p_transaction_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx          RECORD;
  v_closing_day INT;
  v_due_day     INT;
  v_anchor_date DATE;
  v_closing_shift INT;
  v_due_shift   INT;
  v_month_shift INT;
  v_stmt_date   DATE;
  v_month_key   TEXT;
  v_invoice_id  UUID;
  v_closing_date DATE;
  v_due_date    DATE;
  v_closing_month DATE;
BEGIN
  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_tx.card_id IS NULL THEN RETURN; END IF;

  -- Anchor date: prioriza purchase_date, senao payment_date
  v_anchor_date := COALESCE(v_tx.purchase_date, v_tx.payment_date);
  IF v_anchor_date IS NULL THEN RETURN; END IF;

  -- Ler closing/due do cartao (sincronizado pelo trigger trg_sync_card_closing_due_day)
  SELECT closing_day, due_day INTO v_closing_day, v_due_day
  FROM public.credit_cards WHERE id = v_tx.card_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Mes da fatura: mesma logica do frontend resolveStatementMonth
  -- closingMonthShift: se dia da compra > closing_day → vai para proximo mes
  -- dueMonthShift: se closing_day >= due_day → mais um offset
  v_closing_shift := CASE WHEN EXTRACT(DAY FROM v_anchor_date) > v_closing_day THEN 1 ELSE 0 END;
  v_due_shift     := CASE WHEN v_closing_day >= v_due_day THEN 1 ELSE 0 END;
  v_month_shift   := v_closing_shift + v_due_shift;

  v_stmt_date   := (DATE_TRUNC('month', v_anchor_date) + v_month_shift * INTERVAL '1 month')::DATE;
  v_month_key   := TO_CHAR(v_stmt_date, 'YYYY-MM');

  -- Calcular closing_date e due_date
  -- closing_date: mes de v_stmt_date, dia = closing_day (clampado ao ultimo dia do mes)
  -- Se closing > dias do mes de v_stmt_date, fecha no mes anterior
  v_closing_month := v_stmt_date - CASE WHEN v_closing_day > v_due_day
    THEN INTERVAL '1 month' ELSE INTERVAL '0' END;

  v_closing_date := LEAST(
    (DATE_TRUNC('month', v_closing_month) + (v_closing_day - 1) * INTERVAL '1 day')::DATE,
    (DATE_TRUNC('month', v_closing_month) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
  );

  v_due_date := LEAST(
    (v_stmt_date + (v_due_day - 1) * INTERVAL '1 day')::DATE,
    (v_stmt_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE
  );

  -- Create invoice if not exists (uq_invoices_card_month garante unicidade)
  INSERT INTO public.credit_card_invoices (
    user_id, card_id, month_key, closing_date, due_date,
    total_amount, paid_amount, status
  ) VALUES (
    auth.uid(), v_tx.card_id, v_month_key, v_closing_date, v_due_date,
    0, 0, 'open'
  )
  ON CONFLICT (card_id, month_key) DO NOTHING;

  SELECT id INTO v_invoice_id FROM public.credit_card_invoices
  WHERE card_id = v_tx.card_id AND month_key = v_month_key;

  UPDATE public.transactions SET invoice_id = v_invoice_id
  WHERE id = p_transaction_id;

  -- Recalculate invoice totals
  PERFORM public.recalculate_invoice_totals(v_invoice_id);
END;
$$;
```

---

### Fase 5: Statement Cycle Management

**Status:** Pendente
**Dependencia:** Fase 2, Fase 4
**Impacto:** Medio | **Risco:** Alto

**Problema atual:** Validaes de sobreposicao de ciclo, split de vigencia e reprocessamento de faturas rodam no cliente com logica TOCTOU (time-of-check-time-of-use).

#### RPC 7: `create_statement_cycle`

```sql
-- INPUT: p_card_id, p_date_start, p_closing_day, p_due_day, p_notes
-- Valida que existe pelo menos 1 ciclo para o cartao
-- Se date_start < primeiro ciclo: insere antes, ajusta date_start do primeiro
-- Se no meio de ciclo existente: fecha ciclo anterior, insere novo com date_end do anterior
-- Se == date_end do ciclo aberto: erro
-- Chama reprocess_invoices_for_card(p_card_id, p_date_start)
```

#### RPC 8: `delete_statement_cycle(p_cycle_id UUID)`

```sql
-- Busca ciclo + todos os ciclos do mesmo cartao (ordenados)
-- Se for o unico: RAISE EXCEPTION 'Nao e possivel deletar a unica vigencia'
-- Se for o primeiro: estende date_start do ciclo seguinte para o date_start do deletado
-- Se nao for o primeiro: estende date_end do ciclo anterior para o date_end do deletado
-- Deleta o ciclo
-- Chama reprocess_invoices_for_card(p_card_id, ciclo.date_start)
```

#### RPC 9: `update_statement_cycle(p_cycle_id UUID, p_closing_day INT, p_due_day INT, p_notes TEXT)`

```sql
-- Le ciclo atual
-- Se closing_day ou due_day mudaram:
--   UPDATE credit_cards SET closing_day, due_day (se ciclo aberto / date_end = 9999-12-31)
-- UPDATE cycle SET closing_day, due_day, notes
-- Chama reprocess_invoices_for_card(p_card_id, ciclo.date_start)
-- Nota: O trigger trg_sync_card_closing_due_day ja propaga closing/due de ciclos abertos
-- para credit_cards, entao o UPDATE no cycle pode ser suficiente se o trigger pegar
```

#### RPC 10: `reprocess_invoices_for_card(p_card_id UUID, p_from_date DATE)`

```sql
-- Busca todas transacoes do cartao desde p_from_date
-- Para cada transacao SEM invoice_id vinculado:
--   Resolve mes da fatura (mesma logica de link_transaction_to_invoice)
--   Vincula a fatura existente ou cria nova
-- Para cada transacao COM invoice_id:
--   Resolve mes correto; se mudou de fatura: desvincula da antiga, vincula na nova
-- Remove faturas vazias (sem transacoes vinculadas)
-- Recalcula totais de todas as faturas afetadas
```

**Arquivos afetados:** `cards.service.ts` — `createStatementCycle`, `deleteStatementCycle`, `updateStatementCycle` viram RPC calls.

---

### Fase 6: Pay Bill Atomic

**Status:** Pendente
**Dependencia:** Fase 2, Fase 3
**Impacto:** Alto (elimina race condition) | **Risco:** Medio

**Problema atual:** `payBill()` faz verficacao de duplicidade por `SELECT eq description` seguido de INSERT ou UPDATE. Entre o SELECT e o INSERT, outra aba pode inserir o mesmo pagamento.

#### RPC 11: `pay_bill` (parametros nomeados)

```sql
CREATE OR REPLACE FUNCTION public.pay_bill(
  p_card_id          UUID,
  p_transaction_ids  UUID[],
  p_account_id       UUID,
  p_payment_date     DATE,
  p_amount           NUMERIC,
  p_description      TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_desc TEXT;
  v_existing_id     UUID;
BEGIN
  v_normalized_desc := CASE
    WHEN p_description LIKE 'Pgto Fatura:%' THEN p_description
    ELSE 'Pgto Fatura: ' || p_description
  END;

  -- SELECT FOR UPDATE previne race condition entre abas
  SELECT id INTO v_existing_id FROM public.transactions
  WHERE description = v_normalized_desc
    AND payment_method = 'bill_payment'
    AND user_id = auth.uid()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.transactions
    SET amount = p_amount, type = 'expense', account_id = p_account_id,
        payment_date = p_payment_date, is_paid = true, updated_at = now()
    WHERE id = v_existing_id;
  ELSE
    INSERT INTO public.transactions (
      user_id, description, amount, type, payment_date,
      account_id, is_paid, is_fixed, payment_method
    ) VALUES (
      auth.uid(), v_normalized_desc, p_amount, 'expense', p_payment_date,
      p_account_id, true, false, 'bill_payment'
    );
  END IF;

  -- Batch pay: marca transacoes da fatura como pagas
  UPDATE public.transactions
  SET is_paid = true, payment_date = p_payment_date, account_id = p_account_id,
      updated_at = now()
  WHERE id = ANY(p_transaction_ids);

  -- Recalcula faturas afetadas
  PERFORM public.recalculate_invoice_totals(v_invoice_id)
  FROM (SELECT DISTINCT invoice_id FROM public.transactions WHERE id = ANY(p_transaction_ids) AND invoice_id IS NOT NULL) s(v_invoice_id);
END;
$$;
```

---

### Fase 7: Payroll — Mover TETO_INSS para o banco, calculo continua no frontend

**Status:** Pendente
**Dependencia:** Criacao da tabela `system_config`
**Impacto:** Baixo | **Risco:** Baixo

**Problema atual:** `TETO_INSS` hardcoded como `1167.89` no frontend. Valor muda anualmente.

**Decisao:** O calculo de folha (`calculatePayroll`) e **funcao pura** — recebe numeros, devolve numeros, sem side-effect no banco. Fazer RPC disso adiciona latencia de rede desnecessaria para 5 operacoes aritmeticas. A solucao correta e:

1. Mover `TETO_INSS` para uma tabela no banco (atualizacao centralizada)
2. Criar RPC `get_system_config(key TEXT)` para obter o valor
3. Manter `calculatePayroll` como funcao TypeScript no frontend, so que agora lendo o teto do banco

#### Tabela nova: `system_config`

```sql
CREATE TABLE IF NOT EXISTS public.system_config (
  key        TEXT PRIMARY KEY,
  value      NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed inicial
INSERT INTO public.system_config (key, value)
VALUES ('teto_inss', 1167.89)
ON CONFLICT DO NOTHING;

-- RLS: leitura para usuarios autenticados, escrita apenas admin
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_config_select_authenticated" ON public.system_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "system_config_admin_write" ON public.system_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

#### RPC 12: `get_system_config(p_key TEXT)`

```sql
CREATE OR REPLACE FUNCTION public.get_system_config(p_key TEXT)
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT value FROM public.system_config WHERE key = p_key;
$$;
```

**Arquivos afetados:** `salary-settings.service.ts` ganha um `supabase.rpc('get_system_config', { p_key: 'teto_inss' })` no mount. O resultado e armazenado em estado local / React Query. `payroll-calculations.ts` passa a receber `tetoInss` como parametro em vez de usar constante hardcoded.

**Nota:** O valor `1167.89` corresponde ao **teto de desconto do INSS** (11% do teto do salario-de-contribucao de R$7.507,49 × 0,11 = R$825,82... nao bate). Verificar se o valor correto nao e o desconto efetivo ou se deve ser o teto do salario-de-contribucao. Consultar a tabela INSS vigente para 2026.

---

### Fase 8: Card Limits — VIEW em vez de RPC

**Status:** Pendente
**Dependencia:** Fase 2
**Impacto:** Baixo | **Risco:** Baixo

**Problema atual:** `available_limit` recalculado no cliente em `cards.service.ts`.

**Decisao:** E um simples `SUM` agregado. Nao tem side-effect, nao tem race condition, nao tem logica condicional. Criar RPC para um `SUM` e overkill. Melhor abordagem: **VIEW** que o frontend consulta diretamente com o resto dos dados do cartao.

#### VIEW: `v_card_limits`

```sql
CREATE OR REPLACE VIEW public.v_card_limits AS
SELECT
  cc.id AS card_id,
  cc.credit_limit,
  COALESCE(SUM(
    CASE WHEN inv.status != 'paid'
      THEN inv.total_amount - inv.paid_amount
      ELSE 0
    END
  ), 0) AS total_usage,
  cc.credit_limit - COALESCE(SUM(
    CASE WHEN inv.status != 'paid'
      THEN inv.total_amount - inv.paid_amount
      ELSE 0
    END
  ), 0) AS available_limit
FROM public.credit_cards cc
LEFT JOIN public.credit_card_invoices inv ON inv.card_id = cc.id
WHERE cc.deleted_at IS NULL
GROUP BY cc.id, cc.credit_limit;

-- O frontend faz JOIN na view ou consulta separada:
-- SELECT credit_limit - COALESCE(SUM(total_amount - paid_amount), 0)
-- FROM credit_card_invoices WHERE card_id = X AND status != 'paid'
```

**Arquivos afetados:** `cards.service.ts` — no metodo `getAll()`, em vez de calcular `totalUsage`/`available_limit` no JS, consulta a VIEW (ou faz a query inline). `getCardDetails()` idem.

---

## Ordem de Execucao

| # | Fase | Depende de | Artefatos DB | Arquivos frontend modificados |
|---|------|------------|-------------|-------------------------------|
| 1 | Dashboard | — | 2 RPCs novas + 3 ja existem | `dashboard.service.ts` |
| 2 | Invoice Reconcile | — | 1 RPC | `invoice-reconciliation.service.ts` |
| 3 | Transaction Lifecycle | #2 | 4 RPCs | `transactions-creation.service.ts`, `transactions-installments.service.ts` |
| 4 | Link to Invoice | #2 | 1 RPC | `invoice-reconciliation.service.ts`, `transactions-core.service.ts` |
| 5 | Statement Cycles | #2, #4 | 4 RPCs | `cards.service.ts` |
| 6 | Pay Bill Atomic | #2, #3 | 1 RPC | `transactions-batch.service.ts` |
| 7 | Payroll TETO_INSS | — | 1 tabela + 1 RPC | `salary-settings.service.ts`, `payroll-calculations.ts` |
| 8 | Card Limits (VIEW) | #2 | 1 VIEW | `cards.service.ts` |
|   | **Total** | | **13 RPCs + 1 tabela + 1 VIEW** | **8 arquivos** |

---

## Arquivos de Migration

Separar em 4 migrations por dominio — mais facil de debugar, reverter e testar:

```
supabase/migrations/20260405000001_infra_config.sql        -- system_config table + RLS
supabase/migrations/20260405000002_invoice_rpc.sql         -- recalculate, link_to_invoice
supabase/migrations/20260405000003_transaction_lifecycle.sql -- installments, recurrences, groups
supabase/migrations/20260405000004_cards_and_pay.sql       -- statement cycles, pay_bill, v_card_limits
```

Cada migration e independente (exceto que #3 e #4 dependem das funcoes de #2).

---

## Checklist de Pos-Migracao

Para cada fase:

- [ ] Migration aplicada no ambiente local (Supabase CLI: `supabase db push`)
- [ ] Frontend alterado para chamar RPC em vez de logica client-side
- [ ] Teste manual: operacao funciona igual ou melhor
- [ ] Teste de race condition: duas abas editando o mesmo recurso simultaneamente
- [ ] React Query invalidado apos mutation (`queryClient.invalidateQueries`)
- [ ] Remover codigo morto do frontend que foi substituido pela RPC
- [ ] Verificar que tipos TypeScript foram gerados (`supabase gen types`)
