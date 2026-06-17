# 05 — Vigências Salariais e Cálculo de Folha (Payroll)

> O cálculo de payroll é **puramente client-side** (não persistido — é um simulador). As vigências (`settings_salary`) são persistidas e têm regras de não-sobreposição.

---

## 1. Vigências salariais (`settings_salary`)

Cada vigência é um intervalo `[date_start, date_end]` com parâmetros de cálculo. PK composta `(user_id, date_start, date_end)`. A vigência **aberta/atual** tem `date_end = '9999-12-31'` (sentinel `OPEN_DATE_END`).

### Campos
| Campo | Tipo | Constraint |
|---|---|---|
| `hourly_rate` | NUMERIC(15,2) | `>= 0` |
| `base_salary` | NUMERIC(15,2) | `>= 0` |
| `inss_discount_percentage` | NUMERIC(15,2) | `0..100` |
| `admin_fee_percentage` | NUMERIC(15,2) | `0..100` |
| datas | DATE | `date_start <= date_end` |

### Regras

**SAL-01 — Não-sobreposição. ✅ CORRIGIDO vs. verificação.** **Não existe trigger de overlap de vigência salarial** no banco (o `trg_salary_no_overlap` inferido não existe). As garantias reais são:
- **No banco:** índice único parcial `settings_one_open_row_per_user` em `settings_salary(user_id) WHERE date_end = '9999-12-31'` → garante **no máximo 1 vigência aberta por usuário**. (Não impede sobreposição de períodos fechados.)
- **No client:** a validação de sobreposição completa (`candidateStart <= rowEnd && candidateEnd >= rowStart`) é feita em `createSettingWithValidity`/`updateSetting` (ver SAL-02/03).
> **Migração .NET:** manter o índice único da vigência aberta **e** implementar a validação de overlap completa na camada de serviço (já que não há trigger para herdar). Mensagens de erro da validação client em pt-BR.

**SAL-02 — Criar com validade (`createSettingWithValidity`, client):**
1. Busca a vigência aberta (`get_salary_open`).
2. Se já existe aberta e `novoStart <= aberta.date_start` → erro (não pode começar antes/igual à aberta atual).
3. Fecha a aberta: `close_salary_setting` com `date_end = novoStart - 1 dia`.
4. Cria a nova (`create_salary_setting`) com `date_end = '9999-12-31'`.
5. **Rollback:** se a criação falhar e a anterior já foi fechada, reabre a anterior (`reopen_salary_setting`).

**SAL-03 — Atualizar (`updateSetting`, client):**
1. Valida `start <= end`; senão erro *"A data inicial nao pode ser maior que a data final."*
2. Busca as outras linhas (`get_salary_rows_by_user`) e checa overlap (`candidateStart <= rowEnd && candidateEnd >= rowStart`).
3. `update_salary_setting(p_original_start, p_original_end, ...novos valores)` — UPDATE pela PK composta original. Se não → exceção.

**SAL-04 — Deletar (`deleteSetting` / `delete_salary_setting`):** DELETE pela PK composta; pode reabrir/estender a vigência anterior conforme o caso (client `deleteCurrentSettingAndRestorePrevious`).

### RPCs de leitura/manutenção de vigência
| RPC | Comportamento |
|---|---|
| `get_salary_history()` | todas, `ORDER BY date_start DESC` |
| `get_salary_current()` | onde hoje ∈ `[date_start, date_end]`, mais recente |
| `get_salary_open()` | onde `date_end = '9999-12-31'`, mais recente |
| `get_salary_rows_by_user()` | `(date_start, date_end)` de todas |
| `create_salary_setting(...)` | INSERT + trigger no-overlap |
| `update_salary_setting(...)` | UPDATE por PK + trigger |
| `close_salary_setting(p_date_start, p_original_end, p_new_end)` | fecha período (seta date_end) |
| `reopen_salary_setting(p_date_start, p_date_end)` | reabre (`date_end = '9999-12-31'`) |
| `delete_salary_setting(p_date_start, p_date_end)` | DELETE por PK |

---

## 2. SAL-ALG-01 — Cálculo de folha (`payroll-calculations.ts`) ⭐

> 100% client-side, não persistido. Modelo "PJ por horas com salário-base garantido". **Atenção:** não é cálculo CLT padrão — INSS é alíquota flat (não progressiva), e não há IRRF/FGTS.

### Constante
`DEFAULT_TETO_INSS = 1167.89` (teto de desconto INSS em R$; também disponível via `system_config('teto_inss')`).

### Entradas
`totalHours (≥0)`, `hourlyRate (≥0)`, `baseSalary (≥0)`, `inssPercentage (≥0, %)`, `adminFeePercentage (≥0, %)`, `tetoInss (default 1167.89)`.

### Função de arredondamento
`round2(v) = Math.round((v + ε) * 100) / 100` (2 casas, com epsilon para estabilidade de ponto flutuante).

### Fórmulas (na ordem)
```
1. grossPay = round2(totalHours × hourlyRate)

2. profitAdvance = grossPay > 0 ? round2(grossPay - baseSalary) : 0
   (adiantamento de lucro = bruto menos salário-base garantido)

3. inssDiscount = grossPay > 0
     ? round2( -Math.min( baseSalary × (inssPercentage / 100), tetoInss ) )
     : 0
   ⚠️ Base do INSS = baseSalary (NÃO o grossPay). Resultado limitado pelo teto. Valor NEGATIVO.

4. adminFeeDiscount = grossPay > 0
     ? round2( -( grossPay × (adminFeePercentage / 100) ) )
     : 0
   ⚠️ Base da taxa admin = grossPay (NÃO o baseSalary). Valor NEGATIVO.

5. totalDiscounts = round2(inssDiscount + adminFeeDiscount)   (soma de negativos)

6. netPay = round2(grossPay + totalDiscounts)                 (bruto + descontos[negativos])
```

### Observações críticas
- **INSS** incide sobre `baseSalary`, limitado pelo teto. Alíquota é **flat** (percentual único configurável), não por faixas progressivas.
- **Taxa admin** incide sobre `grossPay`.
- **Não há IRRF nem FGTS** implementados — fora do escopo desta tela.
- Quando `grossPay = 0` (sem horas), todos os descontos e `profitAdvance` são `0`.
- Descontos são representados como **valores negativos**; o líquido é `bruto + descontos`.

> **Migração .NET:** Pode permanecer no frontend (é só apresentação). Se for movido ao backend, replicar exatamente com `decimal` e o mesmo arredondamento. Ler o teto de `system_config('teto_inss')` em vez de hardcode quando possível.

---

## 3. Helpers de apresentação (`salary-simulator.service.ts`)
- `formatCurrency(value)` → `Intl.NumberFormat('pt-BR', BRL, 2 casas)`.
- `toNumber(value)` → `Number(value)`, `0` se não finito.
- `formatDateBR(value)` → se `'9999-12-31'` retorna `"Vigente"`, senão `toLocaleDateString('pt-BR')`.
- `buildSettingKey(setting)` → `"date_start|date_end"` (chave de cache/dedup).

---

## 4. Checklist de migração .NET para Salário/Payroll

- [ ] `SalarySettingService` com create-with-validity (fecha aberta, rollback), update (valida datas + overlap), delete, e queries (history/current/open/rows).
- [ ] Replicar a regra de não-sobreposição (SAL-01) na camada de serviço (e/ou trigger no Postgres local).
- [ ] Decidir se o cálculo de payroll fica no front (recomendado) ou vira endpoint. Se backend: `decimal` + arredondamento idêntico + teto via `system_config`.
- [ ] Preservar o sentinel `'9999-12-31'` para vigência aberta (ou modelar `date_end` nullable — decisão de design; impacta queries).
