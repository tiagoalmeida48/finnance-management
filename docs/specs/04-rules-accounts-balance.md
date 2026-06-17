# 04 — Contas Bancárias e Sincronização de Saldo

> Contém o algoritmo AC-ALG-01 (sincronização de saldo) — segundo ponto de maior risco da migração depois da vinculação de fatura.
>
> ✅ **Verificado contra o trigger real do banco cloud (2026-06-17).** AC-ALG-01 confirmado **idêntico** ao documentado. A migration de fix incluiu também um **recálculo total** de saldos (a "alternativa robusta" do §3) — ver nota lá. Correção: `increment_account_balance` **não filtra `user_id`** (AC-05).

---

## 1. Conceitos

- **Conta** (`bank_accounts`): origem/destino de transações. Tem `initial_balance` (saldo no momento da criação) e `current_balance` (saldo derivado, mantido automaticamente). Soft-delete.
- **Tipos** (`type`): `checking, savings, investment, wallet, other`.
- **Regra de ouro (RT-03):** `current_balance` **nunca** é escrito diretamente pela aplicação (exceto na criação, onde recebe `initial_balance`, e via `increment_account_balance`). É recalculado por delta a cada mutação de transação.

---

## 2. Ciclo de vida da conta

**AC-01 — Criar (`create_account`):** params `p_name, p_type, p_initial_balance, p_color, p_icon, p_pluggy_account_id`. INSERT com `user_id = auth.uid()` e **`current_balance = initial_balance`** (saldo inicial vira saldo corrente). Defaults do schema: `type='checking'`, `color='#8b5cf6'`, `icon='wallet'`, `is_active=true`.

**AC-02 — Atualizar (`update_account`):** COALESCE em `name, type, color, icon, pluggy_account_id, initial_balance, current_balance, is_active`. `WHERE id AND user_id`. Se não → *"Account not found"*.
- ⚠️ Note que `update_account` **permite** passar `current_balance`. Isso é uma porta de escrita direta (usada por ajustes/import). Na migração, restringir/auditar esse caminho.

**AC-03 — Deletar (`delete_account`):** soft-delete → `deleted_at = now(), is_active = false, updated_at = now()`. `is_active = false` é **obrigatório** pela constraint `chk_bank_account_deletion`. Se não → *"Account not found"*.

**AC-04 — Listar (`get_accounts`):** `WHERE user_id = auth.uid() AND deleted_at IS NULL ORDER BY name`.

**AC-05 — Ajuste pontual de saldo (`increment_account_balance`)** ✅ **confirmada (def. real):** `UPDATE bank_accounts SET current_balance = COALESCE(current_balance,0) + p_amount, updated_at = now() WHERE id = p_account_id`. É **SECURITY INVOKER** e **NÃO filtra `user_id`** — depende inteiramente do RLS para isolamento. Client: `adjustBalance(id, delta)`.
> ⚠️ **Migração .NET:** ao reimplementar, **adicionar** o filtro de tenant explícito (`AND user_id = <usuário>`), pois não haverá RLS para proteger.

---

## 3. AC-ALG-01 — Sincronização de saldo ⭐

> Trigger `trg_sync_account_balance` / função `sync_account_balance_on_transaction`. AFTER INSERT/UPDATE/DELETE em `transactions`. Lógica de **delta incremental** (não recalcula do zero — aplica diferenças).

**Condição de elegibilidade (uma transação afeta saldo apenas se):**
`is_paid = TRUE AND card_id IS NULL AND account_id IS NOT NULL`.
(Transações de cartão **não** mexem no saldo da conta — são agregadas na fatura. Transações pendentes também não.)

```
FASE A — REVERTER (em UPDATE ou DELETE, usando a linha OLD):
  SE OLD elegível (OLD.is_paid AND OLD.card_id IS NULL AND OLD.account_id NOT NULL):
    income   : account_delta = -OLD.amount            (desfaz a entrada)
    expense  : account_delta = +OLD.amount            (desfaz a saída)
    transfer : account_delta  = +OLD.amount           (desfaz débito na origem)
               transfer_delta = -OLD.amount           (desfaz crédito no destino)
    UPDATE bank_accounts SET current_balance += account_delta WHERE id = OLD.account_id
    SE transfer_delta <> 0 AND OLD.to_account_id NOT NULL:
      UPDATE bank_accounts SET current_balance += transfer_delta WHERE id = OLD.to_account_id

FASE B — APLICAR (em INSERT ou UPDATE, usando a linha NEW):
  SE NEW elegível (NEW.is_paid AND NEW.card_id IS NULL AND NEW.account_id NOT NULL):
    income   : account_delta = +NEW.amount
    expense  : account_delta = -NEW.amount
    transfer : account_delta  = -NEW.amount           (debita origem)
               transfer_delta = +NEW.amount           (credita destino)
    UPDATE bank_accounts SET current_balance += account_delta WHERE id = NEW.account_id
    SE transfer_delta <> 0 AND NEW.to_account_id NOT NULL:
      UPDATE bank_accounts SET current_balance += transfer_delta WHERE id = NEW.to_account_id

Retorno: NEW (INSERT/UPDATE) ou OLD (DELETE).
```

**Casos cobertos pela combinação reverter+aplicar:**
- INSERT pago → só Fase B (aplica).
- DELETE de pago → só Fase A (reverte).
- UPDATE marcando como pago (`is_paid` false→true) → Fase A não faz nada (OLD não elegível), Fase B aplica.
- UPDATE desmarcando pago (true→false) → Fase A reverte, Fase B não faz nada.
- UPDATE de valor/conta de transação já paga → Fase A reverte o antigo, Fase B aplica o novo (inclusive se mudou de conta).

> **Migração .NET:** Implementar como serviço chamado em todo create/update/delete de transação, **dentro da mesma transação de banco**. Recomendado: método `ApplyBalanceDelta(oldTx, newTx)` que recebe estados antes/depois (null para insert/delete) e executa as duas fases. Cobrir com testes: transfer entre contas, toggle de pagamento, mudança de conta de transação paga, exclusão de transfer paga.
>
> **Alternativa mais robusta (com respaldo no banco real):** recalcular `current_balance` do zero por conta afetada. A migration `fix_sync_account_balance_trigger_and_recalculate` faz exatamente isso para reparar saldos — fórmula confirmada:
> ```sql
> current_balance = initial_balance
>   + SUM(CASE WHEN type='income' THEN amount WHEN type IN('expense','transfer') THEN -amount ELSE 0 END)
>       de transações WHERE account_id = conta AND is_paid AND card_id IS NULL
>   + SUM(amount) de transações WHERE to_account_id = conta AND is_paid AND type='transfer'
> ```
> Mais simples de raciocinar, imune a drift, ao custo de uma agregação. Decisão de design; o comportamento observável é idêntico ao delta.

---

## 4. Relação com transações (recap das constraints)

- `chk_card_has_account`: se há `card_id`, `account_id` é obrigatório (mesmo não afetando saldo — é a conta de débito da fatura).
- `chk_transfer_account`: `to_account_id` só em `type='transfer'`.

---

## 5. Checklist de migração .NET para Contas/Saldo

- [ ] `AccountService` com create (current=initial), update (restringir escrita direta de current_balance), soft-delete, list (deleted_at null).
- [ ] `BalanceSyncService` implementando AC-ALG-01 (ou a alternativa de recálculo total), invocado em toda mutação de transação na mesma transação de banco.
- [ ] Endpoint/serviço equivalente a `increment_account_balance` para ajustes pontuais.
- [ ] Testes do delta para os 6 casos listados acima.
- [ ] Decidir e documentar: delta incremental vs. recálculo do zero.
