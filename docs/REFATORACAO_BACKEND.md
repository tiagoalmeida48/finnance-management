# Refatoração Backend — endpoints/DTOs faltantes para o frontend

Itens do backend `Finnance.Api` que **faltam** para o frontend (`Finnance.Api/Frontend`) completar a paridade com o frontend de referência (`docs/Referencia`). Levantados pela auditoria de gap (2026-06-21) e pelos porters de feature. Cada item segue as convenções do backend (skill `dotnet-backend-pattern`: `ResultApi<T>`, `ApplicationException` + `Constants.ErrorMessage`, DTO via `MapTo`, Dapper inline, `[Authorization]`).

> Enquanto não existirem, o frontend porta o que é possível e marca o fluxo como **pendência** (sem inventar endpoint nem reintroduzir Supabase).

## 1. Endpoints novos

### 1.1 Upload de avatar do usuário — `profile`
- **Endpoint**: `POST /user/avatar` (multipart ou base64) → atualiza `avatar_url` do usuário logado.
- **Decisão pendente**: onde armazenar o arquivo (filesystem local em `wwwroot/uploads`, Azure Blob, S3…). A Referencia usava Supabase Storage.
- **Relacionado**: `MeDto` já tem (ou precisa ter) `avatarUrl`; confirmar e expor no `GET /auth/me`.
- **Sem isso**: a tela de Perfil é portada **sem** troca de avatar.

### 1.2 Importação de transações via CSV — `transactions`
- **Endpoint**: `POST /transaction/import` — recebe lista de transações parseadas (ou o arquivo), valida e cria em lote. A Referencia usa `papaparse` no cliente + insert em lote no Supabase.
- **Forma sugerida**: cliente faz o parse (papaparse) e envia o payload validado; backend valida e persiste em transação (`TransactionScope`).
- **Sem isso**: o modal de importação CSV não é portado.

## 2. DTOs a expor/confirmar (não são endpoints novos, mas campos faltantes)

Vários fluxos de `cards` e `tracking` dependem de campos que o frontend precisa ler. Confirmar se os DTOs já os retornam; se não, expor:

- **`CreditCard*Dto`**: ciclos de fatura (`statement_cycles` / `current_statement_cycle`) — necessários para o histórico de ciclos e para resolver a fatura de uma transação no Bill Tracking.
- **`Transaction*Dto`**: `isFixed` (despesa fixa) e `isPaid` (pago/pendente) — usados pelo Bill Tracking e pelos toggles de pagamento.
- Confirmar rotas de ciclo: `credit-card-statement-cycle/list` e afins, e que o `toggle-paid`/`batch-pay` de transações estão expostos.

## 3. Integrações não portadas (decisão de produto)

- **Pluggy** (sincronização bancária automática): dependia de Edge Functions + Supabase na Referencia. Reimplementar no backend .NET é um épico à parte — fora do escopo da migração de UI.

## Pendências reportadas pelos porters (2026-06-21)

Por prioridade (o frontend já porta tudo que é possível; estes itens destravam os fluxos restantes):

### Alta — quebram fluxos self-service/comuns

1. **Perfil self-service** (`profile`). `PUT /user/update` e `PUT /user/update-password` são `[Authorization(admin: true)]` e operam sobre um `id` arbitrário do DTO — são gestão por admin, não self-service. Um usuário comum recebe 403 ao editar o próprio perfil. **Criar** rotas self-service `[Authorization()]` que usem `UserLogged.user` do JWT, ex.: `PUT /profile/update` (nome) e `PUT /profile/update-password`.
2. **Import CSV** (`transactions`). `POST /transaction/import` (lote validado) — inexistente. Sem ele o modal de importação não funciona.
3. **Pagar fatura de cartão** (`transactions`, `cards`). Endpoint dedicado `POST /credit-card-invoice/pay` (faturaId + conta + data) ou `POST /transaction/pay-bill` — hoje só há `transaction/batch-pay` genérico.

### Média — fluxos de detalhe do cartão

4. **Transações por cartão/fatura** (`cards`). `GET /transaction/by-card?card={id}` e/ou `by-invoice?invoice={id}`, OU adicionar `card`/`invoice` ao `TransactionFilterDto`. Necessário para a lista de transações da fatura e o breakdown por categoria do cartão.
5. **Remover ciclo de fatura** (`cards`). `DELETE /credit-card-statement-cycle/delete` (body: `creditCardStatementCycle`).
6. **Remover vigência atual de salário** (`salary-simulator`). `DELETE/POST /settings-salary/delete-current` — reabre a vigência anterior. Hoje só há `/settings-salary/close`.

### Baixa — melhorias de payload

7. **`avatar_url`** (`profile`). `POST /user/avatar` (upload) + definir storage. Ver §1.1.
8. **`recent` enriquecido** (`dashboard`). `GET /transaction/recent` retornar `categoryName` (ou endpoint de recentes com nome de categoria) para a lista de transações recentes.
9. **DTOs de ciclo/flags** (`tracking`, `cards`). Confirmar que `CreditCard*Dto` expõe `statementCycles`/`currentStatementCycle` e `Transaction*Dto` expõe `isFixed`/`isPaid`.

### Fora de escopo (produto)

10. **Pluggy / Open Finance** (`dashboard`): sincronização bancária automática — dependia de Edge Functions/Supabase; reimplementar é um épico próprio.
