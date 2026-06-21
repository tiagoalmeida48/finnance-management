# Contrato da API .NET (fonte de verdade p/ os services do frontend)

Backend: `Finnance.Api` (.NET 9). Base URL: `/api` (proxy Vite → https://localhost:5000).
Todas as respostas vêm no envelope `ResultApi<T>` (`{ success, message, internalError, result }`) — **a camada `apiClient` em `src/config/http.ts` já desempacota e retorna `result`**. JSON é **camelCase** (Newtonsoft CamelCasePropertyNamesContractResolver). Auth via header `Authorization: Bearer <token>` (interceptor já configurado). 401 → limpa token e vai p/ /login.

## Convenção de rotas
`POST/GET/PUT/DELETE /api/<controller-kebab>/<action-kebab>` (RouteTokenTransformer slugify: PascalCase→kebab).
Ex: controller `BankAccount`, action `List` → `GET /bank-account/list`. `CreditCardInvoice`/`GetByCard` → `/credit-card-invoice/get-by-card`. `CreditCardStatementCycle`/`UpdateStart` → `/credit-card-statement-cycle/update-start`.
**Nos services, use paths SEM o prefixo `/api`** (o baseURL já é `/api`). Ex: `apiClient.get('/bank-account/list')`.

Parâmetros: `[FromQuery]` → querystring (`apiClient.get(url, { bankAccount: id })`); `[FromBody]` → corpo (`apiClient.post(url, dto)`). Quando o body é um escalar (`[FromBody] long x`), envie o valor cru: `apiClient.delete('/bank-account/delete', id)`.

## Tipos compartilhados (gerar em `src/shared/types/` ou no `types/` de cada feature)
Todos os ids são `number`. Datas chegam como string ISO. Bool é bool.

### Auth (já existe em features/auth)
- `POST /auth/login` body `{ email, password }` → `SessionDto { token, user, fullName, email, isAdmin }` (confirmar campos reais no backend; SessionDto/MeDto)
- `GET /auth/me` → `MeDto`

### Lookups (read-only; cachear forte no React Query)
- `GET /account-type/list` → `AccountTypeDisplayDto[] { accountType, name }`
- `GET /category-type/list` → `{ categoryType, name, active }[]`
- `GET /transaction-type/list` → `{ transactionType, name, active }[]`
- `GET /payment-method/list` → `{ paymentMethod, name, active }[]`
- `GET /invoice-status/list` → `{ invoiceStatus, name, active }[]`
- `GET /system-config/list`, `/system-config/get-by-key?key=` → `{ systemConfig, key, value }`

### BankAccount (controller `BankAccount`)
- `GET /bank-account/list` → `BankAccountDisplayDto[]`
- `GET /bank-account/get?bankAccount=` → `BankAccountDisplayDto`
- `POST /bank-account/create` body `BankAccountCreateDto { name, accountType, initialBalance, color, icon, notes }` → `number` (id)
- `PUT /bank-account/update` body `BankAccountUpdateDto { bankAccount, name, accountType, color, icon, notes, active }` → `bool`
- `DELETE /bank-account/delete` body `number` (id) → `bool`
`BankAccountDisplayDto { bankAccount, accountType, name, initialBalance, currentBalance, color, icon, notes, active, created, updated }`

### Category (controller `Category`)
- `GET /category/list` → `CategoryDisplayDto[]`
- `GET /category/get?category=` → `CategoryDisplayDto`
- `POST /category/create` body `CategoryCreateDto` → `number`
- `PUT /category/update` body `CategoryUpdateDto` → `bool`
- `DELETE /category/delete` body `number` → `bool`
`CategoryDisplayDto` tem (confirmar no backend): `{ category, categoryType, name, color, icon, active }`. CreateDto: `{ categoryType, name, color, icon }`. UpdateDto inclui `category` + `active`.

### CreditCard (controller `CreditCard`)
- `GET /credit-card/list` → `CreditCardDisplayDto[]`
- `GET /credit-card/get?creditCard=` → `CreditCardDisplayDto`
- `POST /credit-card/create` body `CreditCardCreateDto { bankAccount, name, color, creditLimit, notes }` → `number`
- `PUT /credit-card/update` body `CreditCardUpdateDto { creditCard, bankAccount, name, color, creditLimit, notes, active }` → `bool`
- `DELETE /credit-card/delete` body `number` → `bool`
- `GET /credit-card/stats?creditCard=` → `CreditCardStatsDto { creditCard, creditLimit, usage, currentInvoice, availableLimit }`
- `GET /credit-card/all-stats` → `CreditCardStatsDto[]`
`CreditCardDisplayDto { creditCard, bankAccount, name, color, creditLimit, notes, active, created, updated }`

### CreditCardStatementCycle (controller `CreditCardStatementCycle`)
- `GET /credit-card-statement-cycle/get-by-card?card=` → `StatementCycleDisplayDto[]`
- `POST /credit-card-statement-cycle/create` body `StatementCycleCreateDto { card, ... }` → `number`
- `POST /credit-card-statement-cycle/insert-cycle` body `StatementCycleCreateDto` → `number`
- `PUT /credit-card-statement-cycle/update-start?cycle=&dateStart=` → `bool`
- `PUT /credit-card-statement-cycle/update-end?cycle=&dateEnd=` → `bool`
(confirmar campos do StatementCycleDisplayDto/CreateDto no backend: card, dateStart, dateEnd, closingDay, dueDay, notes)

### CreditCardInvoice (controller `CreditCardInvoice`)
- `GET /credit-card-invoice/get-by-card?card=&year=` → `CreditCardInvoiceDisplayDto[]`
- `GET /credit-card-invoice/get-by-month?card=&monthKey=` → `CreditCardInvoiceDisplayDto`
- `POST /credit-card-invoice/recalculate` body `number` (invoiceId) → `bool`
- `POST /credit-card-invoice/reprocess?card=&fromDate=` → `bool`
`CreditCardInvoiceDisplayDto { creditCardInvoice, card, invoiceStatus, monthKey, closingDate, dueDate, totalAmount, paidAmount, closedAt, paidAt, active }`

### Transaction (controller `Transaction`) — núcleo
Actions: `List(filter)`, `Recent`, `GetById`, `Summary`, `Create`, `Update`, `TogglePaid`, `Delete`, `BatchPay`, `BatchUnpay`, `BatchDelete`, `BatchChangeDay`, `InsertInstallmentBetween`, `DeleteGroup`, `UpdateGroup`, `Duplicate`. Rotas kebab (`/transaction/toggle-paid`, `/transaction/batch-pay`, etc).
DTOs (confirmar no backend `Modules/Transaction/Application/Dto/`):
- `TransactionCreateDto { transactionType, amount, paymentDate, purchaseDate, description, account, toAccount, card, category, paymentMethod, notes, isPaid, isFixed, isInstallment, totalInstallments, repeatCount, installmentAmounts:number[], recurringGroup }`
- `TransactionUpdateDto` (campos nullable p/ patch parcial)
- `TransactionDisplayDto`, `TransactionFilterDto { account, category, startDate, endDate, isPaid, limit, offset, sortAsc }`, `TransactionSummaryDto`
- `BatchIdsDto`, `BatchPayDto`, `BatchChangeDayDto`, `UpdateGroupDto`

### Dashboard (controller `Dashboard`)
- `GET /dashboard/stats?startDate=&endDate=` → `DashboardStatsDto { totalBalance, totalAvailableLimit, monthlyIncome, monthlyExpenses }`
- `GET /dashboard/chart-data?startDate=&endDate=` → `ChartPointDto[] { monthKey, income, expense }`
- `GET /dashboard/category-distribution?startDate=&endDate=` → `CategoryDistributionDto[] { ... , total }`
- `GET /dashboard/first-transaction-date` → date

### SettingsSalary (controller `SettingsSalary`)
- history/current/create/update/delete + `POST /settings-salary/simulate` body `SalarySimulationInputDto` → `SalarySimulationResultDto` (cálculo de folha; confirmar DTOs)
- `SalarySettingCreateDto { dateStart, hourlyRate, baseSalary, inssDiscountPercentage, adminFeePercentage }`

### Users (controller `User`, admin) e AuditLog (admin)
- `GET /user/list` (ADMIN) → `UserLightDto[]`; create/update/update-password/delete (ver UserController)
- `GET /audit-log/list?quantity=`, `/audit-log/search?changedBy=&tableName=&record=&auditAction=&quantity=` (ADMIN)

> **Importante:** Para os DTOs marcados "(confirmar no backend)", o agente DEVE abrir o arquivo real em `Finnance.Api/Modules/<Mod>/Application/Dto/*.cs` e espelhar os campos exatos (camelCase no TS). Nunca inventar campos.
