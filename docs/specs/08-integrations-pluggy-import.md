# 08 — Integrações: Pluggy (Open Finance) e Importação CSV

> Pluggy hoje vive em **Edge Functions Deno** (`pluggy-token` v5, `pluggy-sync` v14) + commit no client. Na migração viram Controllers/serviços .NET. CSV é processado inteiramente no client e gravado via `insert_transactions`.
>
> ✅ **Verificado contra o código real das edge functions e a tabela `pluggy_items` (2026-06-17).** Fluxos PL-01/PL-02 confirmados. Correção importante: `isSimilar` (PL-03) usa comparação **posicional caractere-a-caractere**, não "descrições normalizadas iguais". Tabela `pluggy_items` existe (ver §1.6 abaixo). Detalhes no doc 10 §7.

---

## 1. Pluggy — visão geral

Integração com a Pluggy (agregador de Open Finance brasileiro) para importar transações bancárias/cartão. Fluxo em 3 fases:
1. **Token** (`pluggy-token`): gera `connect_token` para o widget Pluggy Link no front.
2. **Sync/Preview** (`pluggy-sync`): busca transações da Pluggy, deduplica/filtra, retorna preview (sem gravar).
3. **Commit** (client): expande parcelas e grava via `insert_transactions`.

### Secrets / env (Edge Functions)
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (só sync), `PLUGGY_CLIENT_ID`, `PLUGGY_CLIENT_SECRET`.

### CORS permitido (hardcoded)
`https://finnance-management.vercel.app`, `http://localhost:5173`, `http://localhost:3000`, qualquer `*.vercel.app`.

---

## 2. PL-01 — `pluggy-token` (gerar connect token)

```
POST /functions/v1/pluggy-token   (Authorization: Bearer <supabase_jwt>)

1. Valida CORS + extrai Authorization.
2. supabase client (anon + JWT) → auth.getUser() (valida sessão). Falha → 401.
3. POST https://api.pluggy.ai/auth   body {clientId, clientSecret} → { apiKey }
4. POST https://api.pluggy.ai/connect_token
   header X-API-KEY: apiKey   body { clientUserId: user.id }   → { accessToken }
5. Retorna { accessToken } (200)
```
Erros: 401 (sem auth), 500 (env ausente), 502 (falha Pluggy).

---

## 3. PL-02 — `pluggy-sync` (preview de transações) ⭐

```
POST /functions/v1/pluggy-sync
body { pluggyItemId, localAccountId }

1. Valida CORS + JWT (auth.getUser).
2. serviceClient com SERVICE_ROLE_KEY (acesso total).
3. Valida que localAccountId pertence ao usuário (bank_accounts WHERE id AND user_id).
4. Pluggy auth → apiKey.
5. GET /accounts?itemId={pluggyItemId} → contas do item.
6. linkedCardId = credit_cards WHERE bank_account_id = localAccountId AND deleted_at IS NULL
                  ORDER BY created_at LIMIT 1   (1º cartão ativo da conta).
7. Janela de datas:
   - se existe tx com notes LIKE 'pluggy:%' → fromDate = ultima.payment_date + 1 dia
   - senão → fromDate = hoje - 90 dias
   - toDate = hoje
   - se fromDate > toDate → retorna { rows: [], upToDate: true }
8. Carrega tx locais p/ dedup: description, amount, payment_date entre (fromDate-2d) e (toDate+2d).
9. Para cada conta Pluggy do item:
   - se isCredit (type==='CREDIT') e !linkedCardId → PULA a conta.
   - GET /transactions?accountId=...&from=...&to=...&pageSize=500
   - para cada tx:
       a. isPaymentTx() → PULA
       b. shouldSkipInstallment() → PULA (mantém só a 1ª parcela)
       c. já existe por notes = `pluggy:{tx.id}` → PULA (dup exata)
       d. isSimilar() (fuzzy) → PULA (dup aproximada)
       e. monta PluggyPreviewRow
10. Retorna { rows, upToDate: false, fromDate, toDate }
```

### PL-03 — Filtros/mapeamentos

**isPaymentTx()** (ignora pagamentos de fatura/internos): `tx.type === 'PAYMENT'`; OU categoria contém "payment"/"pagamento"; OU descrição contém "pagamento", "pag *", "payment", ou "fatura" + ("pag"|"debito").

**shouldSkipInstallment()**: `paymentData.installmentNumber > 1`; sem paymentData, regex `(\d+)/(\d+)` na descrição com current > 1 → PULA. (A Pluggy retorna cada parcela; mantemos só a 1ª e expandimos no commit.)

**resolveAmount()**: usa `amountInAccountCurrency` se `!= 0`, senão `amount`; sempre `Math.abs`.

**isSimilar()** (dedup fuzzy) ✅ **def. real corrigida:**
1. Normaliza ambas as descrições: `lowercase`, troca não-alfanuméricos por espaço, colapsa espaços, `trim`, `slice(0,30)`.
2. `minLen = min(descA.length, descB.length, 20)`; se `0` → não similar.
3. Conta matches **posicionais** (caractere a caractere) nos primeiros `minLen` chars; se `matches/minLen < 0.6` → **não** similar.
4. Valor: `diff = |valorA - valorB|`; `pct = diff/valorA`; se `pct > 0.05 E diff > 1.0` → **não** similar (ou seja, reprova só se ambos: >5% relativo E >R$1 absoluto).
5. Data: similar somente se `|dataA - dataB| ≤ 2 dias`.

**extractInstallmentFromDesc()**: regex `/\(?\b(\d+)\s*\/\s*(\d+)\b\)?/` → `{ current, total }`.

### PL-04 — Schema `PluggyPreviewRow`
```ts
{
  pluggyId: string;            // "pluggy:{tx.id}" → vai em notes (chave de dedup/external ref)
  description: string;         // tx.description ?? merchant.name ?? "Transacao importada"
  amount: number;              // Math.abs(amountInAccountCurrency ?? amount)
  type: 'income' | 'expense';  // crédito → sempre 'expense'; débito: tx.type==='CREDIT' ? 'income' : 'expense'
  paymentDate: string;         // tx.date.split('T')[0]
  isPaid: boolean;             // tx.status !== 'PENDING'
  isCredit: boolean;           // conta Pluggy type === 'CREDIT'
  cardId: string | null;       // linkedCardId se isCredit, senão null
  accountId: string;           // localAccountId
  installmentNumber: number | null;   // 1 se parcelado
  totalInstallments: number | null;   // do paymentData ou regex
  installmentGroupId: string | null;  // "pluggy-group:{desc}:{amount}:{cardId}"
  category: string | null;            // tx.category (não mapeado p/ category_id automaticamente)
}
```

---

## 4. PL-05 — Commit (client, `commitPluggyRows`)

> O commit acontece **no cliente**, não na Edge Function.

Para cada `PluggyPreviewRow`:
1. Se `totalInstallments > 1`: gera `installment_group_id` (UUID) e expande em N registros.
2. Para cada parcela `i` de 1 a N:
   - `payment_date = paymentDate + (i-1) meses`
   - `purchase_date = paymentDate` (data original)
   - `description = "{desc} ({i}/{total})"` se parcelado
   - `notes = "pluggy:{id}"` para `i=1`; `"pluggy:{id}:p{i}"` para `i>1`
   - `is_paid = true` só se `i===1 && isPaid` original
   - `installment_number = i`
3. `supabase.rpc('insert_transactions', { p_rows })`.
4. Invalida queries `['transactions']` e `['accounts']`.

### PL-06 — Mapa de campos Pluggy → `transactions`
| Campo local | Origem |
|---|---|
| `type` | crédito→'expense'; débito: tx.type==='CREDIT'?'income':'expense' |
| `amount` | `Math.abs(amountInAccountCurrency ?? amount)` |
| `payment_date` | `tx.date` (+offset mensal nas parcelas) |
| `purchase_date` | `tx.date` original |
| `description` | `tx.description ?? merchant.name` |
| `account_id` | `localAccountId` |
| `card_id` | `linkedCardId` (1º cartão ativo) se crédito |
| `category_id` | `null` (não mapeado) |
| `notes` | `"pluggy:{tx.id}"` (external ref p/ dedup) |
| `is_paid` | `tx.status !== 'PENDING'` |
| `is_fixed` | `false` |
| `installment_*` | conforme parcelamento |

> ✅ **Confirmado:** o RPC `commit_pluggy_transactions(p_rows jsonb)` existe (SECURITY DEFINER). Para cada linha faz INSERT com campos camelCase do JSON: `type, amount, payment_date (=purchase_date), description, isPaid, is_fixed=false, accountId, cardId, installmentNumber, totalInstallments, installmentGroupId, notes=pluggyId`. É um caminho **server-side** de commit, paralelo ao caminho client (`insert_transactions`). **Migração .NET:** unificar em um único `POST /api/pluggy/sync/commit` no servidor.

### 1.6 Tabela `pluggy_items` (conexões Open Finance)
✅ Existe no banco: `id, user_id, item_id, connector, status, last_synced_at, created_at, updated_at`; UNIQUE `(user_id, item_id)`; FK `user_id → auth.users ON DELETE CASCADE`; RLS `user_owns_pluggy_item`. Guarda os "itens" (conexões bancárias) que o usuário criou via Pluggy Link. **Migração .NET:** entidade `PluggyItem` + persistir o `item_id` retornado pelo widget; usar `last_synced_at`/`status` para controle de sincronização. (Hoje o fluxo de sync recebe `pluggyItemId` do client — ver PL-02 — mas é bom centralizar os itens nesta tabela.)

---

## 5. Importação CSV

> Totalmente client-side (papaparse), grava via `insert_transactions`. Arquivos: `transactions-import.service.ts` + `pages/transactions/.../import/`.

### IM-01 — Colunas esperadas (pt-BR, header)
| Coluna | Obrigatória | Uso |
|---|---|---|
| `Data` | Sim | data da compra |
| `Descrição` / `Descricao` | Sim | descrição |
| `Valor` | Sim | valor (vírgula/ponto, prefixos R$/-) |
| `Categoria` | Não | match fuzzy por nome |
| `Parcelas` | Não | nº de parcelas |
| `Data de pagamento` | Não | p/ débito/pix/dinheiro |
| `Conta de pagamento` | Não | nome da conta |
| `Notas` | Não | texto → `notes` |

Parsing: papaparse `header:true, skipEmptyLines:true`; `normalizeCsvRow` resolve variações de chave.

### IM-02 — Conversões
- **`parseImportDate`**: aceita `dd/MM/yyyy` (regex) e `yyyy-MM-dd`; inválido → `null` (linha inválida).
- **`parseImportAmount`**: se tem vírgula, remove pontos (milhar) e troca vírgula por ponto → `parseFloat`; senão `parseFloat` direto; `NaN` → inválido.
- **`inferImportTransactionType`**: `amount >= 0 ? 'income' : 'expense'`. (Grava-se o valor absoluto.)

### IM-03 — Validação por linha (`validateAndMapImportData`)
`isValid = !amountInvalid && !dateInvalid && !entityInvalid && !installmentsInvalid`.
- entity: crédito exige cardId e accountId; débito exige accountId.
- Detecta parcelamento por `(N/M)` na descrição; agrupa parcelas por **assinatura** (descrição normalizada + valor) num `Map` → mesmo `installment_group_id`.
- Datas de parcelas: `shiftInstallmentDate(date, n) = addMonths(date, n-1)`.
- Match de conta/categoria/cartão: case-insensitive, trim. Categoria não encontrada → sem categoria.

### IM-04 — Método de pagamento (`ImportPaymentMethod`: `pix|debit|credit|money`)
- `credit` → `card_id = selectedCardId`, `is_paid = false`.
- demais → `card_id = null`, `is_paid = !!parsedPaymentDate`.

### IM-05 — Commit
Só linhas `isValid`; `supabase.rpc('insert_transactions', { p_rows })`.

---

## 6. Hooks de integração (cache)
| Hook | Ação |
|---|---|
| `usePluggySync` → fetch | invoca Edge `pluggy-sync` → preview state |
| `usePluggySync` → commit | `commitPluggyRows` → `insert_transactions` → invalida `transactions` + `accounts` |

---

## 7. Checklist de migração .NET para Integrações

- [ ] `POST /api/pluggy/token` (PL-01) — guardar `PLUGGY_CLIENT_ID/SECRET` em config segura (User Secrets/Key Vault), nunca no client.
- [ ] `POST /api/pluggy/sync/preview` (PL-02/03/04) — replicar janela de datas, filtros (payment/installment), dedup exata (`notes` = pluggy ref) e fuzzy (isSimilar).
- [ ] `POST /api/pluggy/sync/commit` (PL-05) — expansão de parcelas, offset mensal, `notes` como external ref. Idealmente **mover o commit para o servidor** (hoje está no client).
- [ ] `POST /api/transactions/import` ou processamento client + `insert_transactions` (IM-*) — decidir onde fica o parse CSV.
- [ ] Preservar `notes = "pluggy:{id}"` como chave de idempotência/dedup (índice/lookup por `notes`).
- [ ] **Investigar:** `pluggy_items` (tabela não versionada) e o RPC `commit_pluggy_transactions` (caminho server-side alternativo).
- [ ] Unificar o caminho de commit Pluggy (client vs. `commit_pluggy_transactions`).
