# 06 — Dashboard, Estatísticas e Gráficos

> Agregações de leitura. A regra mais sutil é o tratamento do "saldo base" (`v_base_income`) em `get_dashboard_stats`.

---

## 1. Filtros de período

O dashboard aceita um filtro que pode ser:
- um **mês** (objeto `Date`) → o client usa `startOfMonth` / `endOfMonth`;
- um **range** `{ start, end }` (strings `yyyy-MM-dd`) → usado diretamente;
- **ausente** → "todos os períodos".

**Token de cache (`getDashboardFilterToken`):** `Date` → `ISO.slice(0,10)`; range → `"start_end"`; `undefined` → `"all"`. Usado nas query keys do React Query.

---

## 2. DS-01 — `get_dashboard_stats(p_start_date, p_end_date)` → jsonb ⭐

Retorna `{ total_balance, total_available_limit, monthly_income, monthly_expenses }`.

### Cálculo do saldo base (`v_base_income`) — regra sutil
```
v_first_tx_month = date_trunc('month', MIN(payment_date) de todas as tx do usuário)

SE p_start_date IS NULL:
    v_base_income = SUM(initial_balance) de todas as contas ativas (não deletadas)

SENÃO (p_start_date informado):
    v_filter_month = date_trunc('month', p_start_date)
    SE v_first_tx_month NOT NULL E v_filter_month <= v_first_tx_month:
        v_base_income = SUM(initial_balance) das contas ativas
        (o filtro começa antes/no mês da 1ª transação → incluir saldos iniciais)
    SENÃO:
        v_base_income = 0
        (o período filtrado é posterior → não somar saldos iniciais de novo)
```

### Campos
```
total_balance         = SUM(current_balance) FROM bank_accounts
                        WHERE user_id = auth.uid() AND deleted_at IS NULL AND is_active = TRUE

total_available_limit = SUM(available_limit) FROM v_card_limits
                        WHERE card_id IN (cartões não deletados do usuário)

monthly_income        = SUM(amount) FROM transactions
                        WHERE type = 'income' AND [filtro de data] + v_base_income

monthly_expenses      = SUM(amount) FROM transactions
                        WHERE type IN ('expense','transfer') AND card_id IS NULL AND [filtro de data]
```

> Note: `monthly_expenses` **exclui** transações de cartão (`card_id IS NULL`) — gastos de cartão entram via fatura, não como despesa direta de fluxo. Transferências contam como "despesa" para fins de fluxo de caixa do período.

---

## 3. DS-02 — `get_chart_data(p_start_date, p_end_date)` → `(month_key, receita, despesa)`

Série mensal para o gráfico de fluxo de caixa.
```
GROUP BY to_char(payment_date, 'YYYY-MM')
receita = SUM(amount) WHERE type = 'income'
despesa = SUM(amount) WHERE type IN ('expense','transfer') AND card_id IS NULL
WHERE payment_date BETWEEN p_start_date AND p_end_date AND user_id = auth.uid()
```
(Variante `get_dashboard_chart_data` da migration 20260320 retorna `total_income`/`total_expense` com mesma semântica.)

---

## 4. DS-03 — `get_category_distribution(p_start_date, p_end_date)` → `(category_name, total)`

Distribuição de despesas por categoria (gráfico de pizza).
```
LEFT JOIN categories; categoria NULL → 'Geral'
WHERE type = 'expense' AND user_id = auth.uid() [+ datas opcionais]
ORDER BY total DESC
```
(Nome do campo de total varia entre versões: `total` / `total_amount` — padronizar na migração.)

---

## 5. DS-04 — Variantes agregadas (migration 20260320)
- `get_dashboard_stats_aggregated(p_start_date, p_end_date)` → `(total_income, total_expense)`; `total_expense` inclui `expense` e `transfer` com `card_id IS NULL`.
- `get_dashboard_chart_data(...)` → `(month_key, total_income, total_expense)`.

> Há sobreposição entre versões antigas/novas. Na migração, consolidar num único conjunto de endpoints de dashboard com a semântica da versão **final** (`20260405000013`), descartando as variantes obsoletas após confirmar quais o frontend realmente chama.

---

## 6. Hooks de dashboard (cache)
| Hook | RPC | Query key |
|---|---|---|
| `useDashboardStats(filter?)` | `get_dashboard_stats` | `['dashboard-stats', token]` |
| `useDashboardCharts(filter?)` | `get_chart_data` | `['dashboard-charts', token]` |
| `useDashboardCategories(filter?)` | `get_category_distribution` | `['dashboard-categories', token]` |

---

## 7. Checklist de migração .NET para Dashboard

- [ ] `DashboardService` com 3 métodos (stats, charts, categories) parametrizados por período (mês ou range ou tudo).
- [ ] Implementar a regra do `v_base_income` (DS-01) — fácil de errar; cobrir com teste (filtro antes vs. depois da 1ª transação; sem filtro).
- [ ] Garantir exclusão de `card_id IS NOT NULL` em despesas/charts (gastos de cartão só via fatura).
- [ ] Consolidar nas semânticas da versão final; remover variantes obsoletas.
- [ ] Categoria nula → rótulo `'Geral'`.
