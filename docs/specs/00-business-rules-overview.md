# Especificação de Regras de Negócio — finnance-management

> **Objetivo deste documento:** Capturar **TODAS** as regras de negócio do sistema atual (React + Supabase) com fidelidade total, para servir de contrato funcional na migração do backend Supabase para um **backend local em .NET Core**.
>
> **Escopo desta entrega:** APENAS a especificação das regras de negócio. Nenhum código .NET é produzido aqui. A arquitetura alvo, modelagem EF Core, e plano de migração serão tratados em documentos posteriores.
>
> **Fonte de verdade:** ✅ **VERIFICADA contra o banco Supabase cloud real** (2026-06-17, via MCP). A versão inicial desta spec foi escrita sobre as migrations locais (desatualizadas em 7 migrations); todos os documentos foram então conferidos e corrigidos contra o catálogo real do PostgreSQL, edge functions e advisors. O diff completo está em **`10-db-verification-report.md`** — leia-o junto deste índice. Os "gaps a recuperar do cloud" do doc 09 foram **todos fechados**.

---

## Índice da Especificação

| Doc | Conteúdo |
|---|---|
| `00-business-rules-overview.md` | **(este)** Visão geral, glossário, regras transversais, gaps de migração |
| `01-data-model.md` | Modelo de dados completo: tabelas, colunas, tipos, constraints, índices, views, relacionamentos |
| `02-rules-transactions.md` | Regras de transações: criação, parcelamento, recorrência, batch, grupos |
| `03-rules-cards-invoices.md` | Cartões de crédito, ciclos de fatura, faturas, reconciliação, algoritmo de vinculação |
| `04-rules-accounts-balance.md` | Contas bancárias, sincronização de saldo, soft-delete |
| `05-rules-salary-payroll.md` | Vigências salariais e cálculos de folha/payroll |
| `06-rules-dashboard-stats.md` | Dashboard, estatísticas agregadas, gráficos |
| `07-rules-auth-admin.md` | Autenticação, perfis, gerenciamento de usuários (admin), RLS |
| `08-integrations-pluggy-import.md` | Integração Pluggy (Open Finance) e importação CSV |
| `09-migration-gaps-net.md` | Mapa RPC→endpoint, funções não versionadas, decisões pendentes para .NET |
| `10-db-verification-report.md` | **Verificação contra o banco cloud real** — diff vs. spec inferida (trilha de auditoria) |

---

## 1. Visão Geral do Domínio

**finnance-management** é um SPA de gestão financeira pessoal (UI em pt-BR), single-user / pequena família. Domínios funcionais:

1. **Contas bancárias** (`bank_accounts`) — saldo sincronizado automaticamente.
2. **Categorias** (`categories`) — de receita ou despesa.
3. **Transações** (`transactions`) — manuais, em lote, importadas (CSV/Pluggy); com suporte a parcelamento e recorrência.
4. **Cartões de crédito** (`credit_cards`) — com ciclos de fatura versionados e faturas mensais.
5. **Faturas** (`credit_card_invoices`) — agregadas a partir de transações, com reconciliação.
6. **Vigências salariais** (`settings_salary`) — para o simulador de folha.
7. **Perfis e administração** (`profiles`, admin RPCs) — multi-usuário com flag `is_admin`. Perfil é criado automaticamente ao registrar usuário (trigger `on_auth_user_created`). Avatar guardado no bucket de storage `avatars`.
8. **Integração Open Finance** (`pluggy_items`, edge functions) — itens/conexões Pluggy + sincronização de transações.
9. **Auditoria** (`audit_log`) — log de mudanças em transações, faturas e cartões.
10. **Configuração de sistema** (`system_config`) — key/value global (ex.: teto INSS).

> ⚠️ **`site_branding` foi REMOVIDA** do banco (migration `drop_site_branding`). Não é mais um domínio do sistema. (A versão inicial desta spec a listava — corrigido após verificação.)

### Arquitetura atual (que será substituída)

```
React SPA → React Query hooks → Services (TS) → Supabase JS client
                                                    ├── PostgREST (.from().select())
                                                    ├── RPC (.rpc('fn', params))  ← lógica de negócio
                                                    ├── Auth (JWT)
                                                    └── Edge Functions (Deno) ← Pluggy
PostgreSQL:
  ├── Tabelas com RLS (multi-tenancy via auth.uid())
  ├── RPCs SECURITY DEFINER (regras de negócio atômicas)
  ├── Triggers (saldo, vinculação de fatura, auditoria, etc.)
  └── Views (limites de cartão, grupos de parcela/recorrência)
```

**Princípio central:** A lógica de negócio crítica vive no PostgreSQL (RPCs + triggers), não no cliente. Isso foi uma decisão de segurança deliberada — o cliente é "burro" e qualquer cliente autenticado não consegue burlar regras. **Na migração para .NET, toda essa lógica precisa ser reimplementada na camada de aplicação/serviço .NET**, pois um banco PostgreSQL local "puro" não terá mais essas RPCs/triggers (a menos que se opte por mantê-los — ver §7 de decisões).

---

## 2. Glossário de Termos do Domínio

| Termo | Definição |
|---|---|
| **Ciclo de fatura (statement cycle)** | Período de vigência de um par `closing_day`/`due_day` de um cartão. Versionado: ao mudar fechamento/vencimento cria-se novo ciclo. O ciclo vigente tem `date_end = '9999-12-31'`. |
| **`closing_day`** | Dia do mês em que a fatura fecha. |
| **`due_day`** | Dia do mês em que a fatura vence. |
| **Fatura (invoice)** | Agregação mensal (`month_key = 'yyyy-MM'`) das transações de um cartão. Criada sob demanda pelo trigger de vinculação. |
| **`month_key`** | Chave da fatura no formato `'yyyy-MM'`. Único por `(card_id, month_key)`. |
| **Grupo de parcelamento** | Conjunto de transações que compõem uma compra parcelada, ligadas por `installment_group_id` (UUID compartilhado, sem FK). |
| **Grupo de recorrência** | Conjunto de transações fixas recorrentes ligadas por `recurring_group_id`. |
| **Vigência salarial** | Intervalo `[date_start, date_end]` com parâmetros de cálculo de folha. Apenas uma "aberta" por usuário (`date_end = '9999-12-31'`). |
| **Sentinel `'9999-12-31'`** | Valor mágico que marca "em aberto / vigente" tanto para ciclos de cartão quanto para vigências salariais. |
| **Soft-delete** | Registro marcado como deletado (`deleted_at IS NOT NULL` + `is_active = FALSE`) em vez de removido fisicamente. |
| **`is_paid`** | Marca se a transação foi liquidada. Só transações pagas (e sem cartão) movem o saldo da conta. |
| **`is_fixed`** | Marca transação recorrente fixa. |
| **`auth.uid()`** | Função Supabase que retorna o UUID do usuário autenticado (do JWT). Base de toda a multi-tenancy. |
| **`payment_date` vs `purchase_date`** | `payment_date` = data de liquidação/pagamento; `purchase_date` = data da compra (relevante para cartão). A âncora para vinculação de fatura é `purchase_date ?? payment_date`. |

---

## 3. Regras de Negócio Transversais

Estas regras valem para o sistema todo e devem ser garantidas pela camada de serviço .NET:

### RT-01 — Multi-tenancy por usuário
Toda entidade de domínio pertence a um usuário (`user_id`). **Toda** query/mutação deve ser filtrada por `user_id = <usuário autenticado>`. No Supabase isso é garantido por RLS + RPCs com `auth.uid()`. **No .NET:** deve ser garantido na camada de aplicação (filtro global / interceptor) e/ou query filters do EF Core. Nunca confiar em IDs vindos do cliente sem checar ownership.

### RT-02 — Soft-delete
`bank_accounts`, `categories` e `credit_cards` **nunca** são deletados fisicamente. Deletar = `SET deleted_at = now(), is_active = FALSE`. Há CHECK garantindo consistência: `deleted_at IS NULL OR is_active = FALSE`. Toda leitura "normal" deve filtrar `deleted_at IS NULL`. Transações, faturas, ciclos, perfis e configs **são** deletados fisicamente.

### RT-03 — Saldo de conta é derivado, nunca escrito diretamente
`bank_accounts.current_balance` é mantido automaticamente. No Supabase, pelo trigger `trg_sync_account_balance` em INSERT/UPDATE/DELETE de transações. Só transações com `is_paid = TRUE AND card_id IS NULL AND account_id IS NOT NULL` afetam o saldo. **No .NET:** replicar essa lógica de delta na camada de serviço de transações (ver `04-rules-accounts-balance.md`). A exceção é `create_account` (define o saldo inicial = `initial_balance`) e o RPC `increment_account_balance` (ajuste pontual).

### RT-04 — Recálculo de fatura é obrigatório após mutações
Toda operação que altere `amount`, `type`, `is_paid`, `card_id`, `purchase_date` ou `payment_date` de uma transação vinculada a fatura, **e todo DELETE**, deve disparar o recálculo da(s) fatura(s) afetada(s) — tanto a fatura antiga quanto a nova (se a transação migrou de fatura). Ver `recalculate_invoice_total` em `03-rules-cards-invoices.md`.

### RT-05 — Vinculação automática de fatura
Ao inserir/alterar uma transação com `card_id`, o sistema determina automaticamente a qual fatura mensal ela pertence (criando a fatura se necessário) via o algoritmo de "month shift" (ver RC-ALG-01 em `03-rules-cards-invoices.md`). No Supabase é o trigger `trg_link_transaction_to_invoice`. **A mesma lógica existe duplicada no frontend** (`resolveStatementMonth`), o que confirma o algoritmo.

### RT-06 — Imutabilidade de `closing_day`/`due_day` via update direto
Não é permitido alterar fechamento/vencimento de um cartão via update do cartão. Só por criação/edição de **ciclo de vigência**. O frontend bloqueia com erro: *"Alteracoes de vencimento e fechamento devem ser feitas pelo historico de ciclo da fatura."* As colunas físicas `closing_day`/`due_day` foram **removidas** de `credit_cards`; os valores vivem em `credit_card_statement_cycles` e são lidos via view `v_credit_cards_with_cycles`.

### RT-07 — Atomicidade
Operações compostas (criar cartão + primeiro ciclo; pagar lote + recalcular faturas; inserir parcela + shift das demais) devem ser **transacionais**. No Supabase isso vem de graça pois RPCs rodam numa transação. **No .NET:** usar `TransactionScope` / `DbContext` transaction explícita por operação composta.

### RT-08 — Valores monetários
Todas as colunas monetárias são `NUMERIC(15,2)`. **No .NET:** usar `decimal` (nunca `double`/`float`). Configurar precisão `(15,2)` no EF Core. Arredondamento bancário a 2 casas.

### RT-09 — `amount` sempre positivo
CHECK `amount > 0` em `transactions`. O sinal/efeito é determinado pelo `type` (income/expense/transfer), não pelo sinal do valor. Importação infere o `type` a partir do sinal e depois grava o valor absoluto.

### RT-10 — Datas como `DATE` (sem timezone para datas de negócio)
`payment_date`, `purchase_date`, `closing_date`, `due_date`, `date_start`, `date_end` são `DATE`. Timestamps de auditoria (`created_at`, etc.) são `TIMESTAMPTZ`. O frontend normaliza datas para `'yyyy-MM-dd'` ignorando horário. **No .NET:** usar `DateOnly` para datas de negócio e `DateTimeOffset` para timestamps.

### RT-11 — Idioma e localização
UI e mensagens de erro em **pt-BR**. Moeda BRL, locale `pt-BR`. Mensagens de exceção de negócio (lançadas por RPCs/serviços) são em português e exibidas ao usuário — devem ser preservadas na migração.

### RT-12 — Auditoria
Mudanças em `transactions`, `credit_card_invoices` e `credit_cards` são gravadas em `audit_log` (ação, dados antigos/novos em JSONB, autor, timestamp). Acessível somente a admins. **No .NET:** replicar via interceptor de `SaveChanges` ou serviço de auditoria.

---

## 4. Enums e Domínios de Valores (consolidado)

| Domínio | Valores permitidos | Onde aplicado |
|---|---|---|
| **Tipo de transação** | `income`, `expense`, `transfer` | `transactions.type` (CHECK) |
| **Método de pagamento** | `credit`, `debit`, `pix`, `cash`, `bill_payment`, `transfer`, `other` (ou NULL) | `transactions.payment_method` (CHECK) |
| **Tipo de conta** | `checking`, `savings`, `investment`, `wallet`, `other` | `bank_accounts.type` (CHECK) |
| **Tipo de categoria** | `income`, `expense` | `categories.type` (CHECK) |
| **Status de fatura** | `open`, `closed`, `partial`, `paid`, `overdue` | `credit_card_invoices.status` (CHECK). ⚠️ Apenas `open`/`partial`/`paid` são efetivamente atribuídos pela lógica (`recalculate_invoice_total`); `closed`/`overdue` existem no enum mas **nenhuma função os produz** (ver doc 10 §7) |
| **Ação de auditoria** | `INSERT`, `UPDATE`, `DELETE` | `audit_log.action` (CHECK) |
| **Tipo de grupo (RPC param)** | `installment`, `recurring` | params de RPCs de grupo |
| **Método de import (UI)** | `pix`, `debit`, `credit`, `money` | importação CSV |

> **Nota histórica:** Os valores `'receita'`/`'despesa'` (pt) foram migrados para `'income'`/`'expense'` (en) na migration `20260320000000`. O banco hoje é **EN-only** para enums.

---

## 5. Labels de UI (pt-BR)

Mapeamentos de exibição que devem ser preservados (vivem no frontend, mas documentados para completude):

| Tipo de conta | Label |
|---|---|
| `checking` | Conta Corrente |
| `savings` | Poupança |
| `investment` | Investimento |
| `wallet` | Dinheiro |
| `other` | Outro |

---

## 6. Funções "não versionadas" — ✅ TODAS recuperadas e confirmadas

> A versão inicial desta spec marcava estas como "recuperar do cloud". **Já recuperadas** (2026-06-17) via catálogo do PostgreSQL. Definições reais documentadas nos docs de domínio e no diff (doc 10 §3).

| Função | Status | Observação |
|---|---|---|
| `is_current_user_admin()` | ✅ confirmada | `EXISTS(profiles WHERE id=auth.uid() AND is_admin)` |
| `is_admin(uuid)` | ✅ confirmada | usada em RLS de `profiles` (criada p/ quebrar recursão de RLS) |
| `increment_account_balance(uuid, numeric)` | ✅ confirmada | **INVOKER, NÃO filtra `user_id`** (confia em RLS) — no .NET, **adicionar** filtro de tenant |
| `create_credit_card_statement_cycle(...)` | ✅ confirmada | faz o split de ciclo no servidor (≡ `planCycleInsertion` do client) |
| `commit_pluggy_transactions(jsonb)` | ✅ confirmada | caminho server-side de commit Pluggy |
| `handle_new_user()` + trigger | ➕ descoberta | cria `profiles` automaticamente ao registrar usuário |
| `get_installment_group_summary(uuid)` | ➕ descoberta | agrega 1 grupo de parcelas |
| `sync_credit_card_cycle_days(uuid, date)` | ⚠️ **órfã/morta** | atualiza `credit_cards.closing_day/due_day` (colunas inexistentes); ninguém a chama — **não portar** |
| `v_credit_cards_with_cycles` (view) | ✅ confirmada | definição real em `01-data-model.md` |

**Funções que eu havia inferido mas NÃO existem:** `enforce_site_branding_singleton` (tabela dropada), `check_salary_period_no_overlap` (não há trigger de overlap salarial — só índice único + validação client), `sync_card_closing_due_day` (o real é `sync_credit_card_cycle_days`, órfã).

> **Status do dump:** desnecessário — o catálogo foi lido diretamente via MCP. Para o plano de **dados** (não schema), ainda vale exportar conteúdo (transactions, pluggy_items, bucket avatars).

---

## 7. Decisões de arquitetura pendentes para a migração .NET

Estas NÃO são regras de negócio, mas decisões que afetam como as regras serão implementadas. Listadas aqui para discussão antes da fase de design:

1. **Onde fica a lógica hoje em RPC/trigger?** Opções:
   - (a) Reimplementar tudo em C# na camada de serviço (recomendado para portabilidade e testabilidade);
   - (b) Manter triggers/funções no Postgres local (menos reescrita, mas acopla ao Postgres);
   - (c) Híbrido.
2. **Sistema de identidade:** substituir Supabase Auth por ASP.NET Core Identity, ou JWT próprio? Impacta `auth.users`, `profiles`, hashing de senha (hoje bcrypt via `crypt`/`gen_salt('bf')`).
3. **Multi-tenancy:** EF Core global query filters vs. filtro manual por serviço.
4. **Auditoria:** interceptor de `SaveChanges` vs. tabela/trigger.
5. **Edge Functions Pluggy:** virar Controllers/BackgroundServices .NET.
6. **Banco:** manter PostgreSQL (recomendado — preserva tipos/constraints) ou migrar para SQL Server?

Estes pontos serão resolvidos no documento de arquitetura alvo (fora do escopo desta entrega de spec).

---

## 8. Como ler o restante da spec

- Cada documento de domínio (`02`–`08`) lista as regras com **IDs estáveis** (ex.: `TX-03`, `RC-ALG-01`) para referência cruzada e rastreabilidade nos testes/PRs da migração.
- Algoritmos críticos (vinculação de fatura, sincronização de saldo, payroll, shift de parcelas) são transcritos **passo a passo** — são os pontos de maior risco de regressão.
- Onde a lógica server-side (RPC) e client-side (service/util) divergem ou se complementam, ambos são documentados.
