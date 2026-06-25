# Validação de Paridade — Finnance (atual .NET+React vs. legado Supabase)

**Data:** 2026-06-25
**Escopo:** auditoria de paridade de **código** entre o app em produção (React + API .NET) e o app legado de referência (React + Supabase). 10 domínios de frontend + 8 áreas de regra de negócio do backend, com gaps verificados adversarialmente (somente `confirmedGaps`).

---

## Veredito geral

**Não.** O sistema **não está 100% completo** em relação ao legado. O núcleo está sólido — os fluxos diários (login, dashboard, tracking, listar/criar/editar transações, contas, categorias, cartões, gestão de usuários) funcionam com endpoints .NET reais e os dois algoritmos de maior risco (transação→fatura e recálculo de fatura) batem com a spec. Porém restam **fluxos secundários inteiros ausentes ou divergentes** e **três regras críticas de backend** que tornam recursos prometidos pela UI inoperantes: cartão novo nasce **sem ciclo de fatura** (nenhuma transação de cartão é vinculada), o **cálculo de folha** do backend está com fórmula incorreta, e **perfil/senha self-service** está bloqueado para usuário não-admin. A integração **Pluggy + import CSV avançado** está totalmente ausente.

**Percentual de completude honesto: ~78% na auditoria original → ~88% após as correções de 2026-06-25.**
Ponderação original: 4 de 10 domínios de frontend completos (dashboard, tracking, auth, users) e 6 parciais; backend com 2/8 áreas `full`, 5 `partial`, 1 `missing`. Depois das correções desta data (as **3 regras críticas resolvidas** + RC-01 + extrato da fatura + pagar fatura + filtro por cartão/fatura + perfil self-service), profile passou a completo e cards/salary/transactions ficaram bem mais perto da paridade. O que ainda puxa para baixo: Pluggy/import CSV (ausente), filtros ricos de transação, gráficos do cartão, e os fluxos secundários de ciclo/vigência salarial.

> **Atualizações — 2026-06-25** (verificadas em runtime):
> - ✅ **RC-01 (ciclo inicial do cartão).** `CreateCard` recebe `closingDay`/`dueDay` e cria o primeiro ciclo (`date_start = hoje`, `date_end = 9999-12-31`) na mesma transação, com rollback atômico se o ciclo falhar (cartão com dia inválido → 400, sem cartão órfão). Form de cartão ganhou os campos de fechamento/vencimento.
> - ✅ **Perfil self-service (AU-06).** Novos endpoints `PUT /user/update-profile` e `PUT /user/update-my-password` com `[Authorization]` simples, escopados ao `UserLogged.user`, atualizando só `fullName`/senha (sem `email`/`isAdmin`). Testado: usuário não-admin edita nome/senha (antes dava "Acesso negado"); `is_admin`/`email` permanecem intactos; endpoints admin seguem protegidos.
> - ✅ **Folha (SAL-ALG-01).** Removido o endpoint redundante e divergente `POST /settings-salary/simulate` (+ `SimulatePayroll`, `ResolveInssCeiling`, DTOs e o hook/serviço frontend mortos). O cálculo de folha é 100% client-side (como o legado e a spec recomendam). Verificado: a rota não responde mais (405). **As 3 regras críticas de backend estão resolvidas.**
> - ✅ **Transações por cartão/fatura.** `TransactionFilterDto` ganhou `Card` e `Invoice`, propagados por `GetPaginated`/`GetSummary`/`AppendReadFilters`. O **extrato da fatura** foi ligado no frontend: cada fatura no detalhe do cartão expande e lista suas transações (`/transaction/list` com `{invoice}`). Verificado em runtime.
> - ✅ **Pagar fatura.** Endpoint `POST /transaction/pay-bill` (`PayBill`): marca as transações não pagas da fatura como pagas (sem re-link) e cria a despesa **"Pgto Fatura {mês}"** na conta escolhida, que debita o saldo (compras de cartão não tocam o saldo — só a quitação) — tudo numa transação. `PayBillModal` + botão "Pagar" no `InvoiceRow`. Verificado em runtime (saldo 1000→800, fatura→Paga, idempotente).
> - ✅ **Filtros ricos + ordenação por campo (TX-24/25).** `TransactionFilterDto` → `TransactionQuery` (via `.MapTo<>()`); `AppendReadFilters` agora aplica `transaction_type`, `payment_method`, `description ILIKE %search%`, `hide_credit_cards` (`card IS NULL`), `only_credit_cards` (`card IS NOT NULL`) e `only_installments` (`installment_group IS NOT NULL`), além dos filtros account/category/card/invoice/datas/paid já existentes. `sort_field` é **whitelisted** (`payment_date, purchase_date, amount, paid, payment_method, description, transaction_type`, default `payment_date`) — sem injeção via `ORDER BY`. Backend compila 0/0; frontend `check:ci` ok. **Ainda pendente do cartão: `total_count` (`COUNT(*) OVER()`) p/ paginação real, fiação da barra de filtros/tabs no frontend de transações, gráficos do cartão e edição/delete rica de ciclo.**
> - **Import Supabase:** o arquivo `exported_data.json` veio **truncado** (SQL Editor cortou em ~100KB por causa do `audit_log`); só os 2 usuários eram recuperáveis. Foram importados com mapa UUID→numérico em `imp.user_map` (Tiago→6, teste→7), senha temporária `Trocar@2026`. Falta reexportar as tabelas de negócio sem `audit_log` (ver `docs/sql/export_supabase.sql`).

---

## Matriz de paridade

| Domínio | Status | Nº gaps high+ | Observação curta |
|---|---|---|---|
| accounts | parcial | 1 | Exclusão é hard-delete com guarda de FK em vez de soft-delete; sem ajuste manual de saldo na edição |
| auth | completo | 0 | Login/me/guards equivalentes; só divergências cosméticas (toast, redirect de /login, sem auto-refresh) |
| cards | parcial | 1 | ✅ ciclo inicial (RC-01), ✅ extrato e ✅ pagar fatura resolvidos; falta gráficos e edição/delete rica de ciclo |
| categories | parcial | 0 | CRUD ok; exclusão física vs. soft, busca textual, seed de padrões, divergência ícone (Lucide vs emoji) |
| dashboard | completo | 0 | Portado com alta fidelidade; só falta nome da categoria nas recentes |
| profile | parcial | 0 | ✅ Self-service de nome/senha resolvido (2026-06-25); resta só avatar (medium) |
| salary | parcial | 1 | ✅ endpoint de simulação divergente removido; resta excluir vigência + restaurar anterior (SAL-04) |
| tracking | completo | 0 | Portado fiel; é até um leve superset (honra conta de débito no pagamento) |
| transactions | parcial | 0 | ✅ filtro por cartão/fatura + pay-bill + filtros ricos (search/type/pm/hide-only-credit/only_installments) + ordenação por campo (backend); falta `total_count`, fiação da barra no frontend, agrupamento de parcelas, import CSV |
| users | completo | 0 | 5 fluxos admin completos com regras críticas portadas; só divergências cosméticas |

Totais de gaps confirmados de frontend: **59** — high: 11, medium: 18, low: 30 (0 critical no frontend).

---

## Gaps confirmados por domínio (priorizados por severidade)

### accounts
- **[high · backend]** Exclusão é HARD delete com guarda de FK, não SOFT delete. `BankAccountService.DeleteAccount` (`_BankAccountService.cs:40-48`) → `BaseRepository.Delete` roda `GetReference` e lança `PendingRegistrationAnotherTable` se houver transações/cartões vinculados; sem coluna `deleted`/`deleted_at` em `BankAccountMod`. Diverge da spec 04 AC-03 e do RPC legado `delete_account`. Conta real (com qualquer transação) não pode ser excluída.
- **[medium · backend]** Campo "Saldo Atual" editável na edição ausente. `BankAccountUpdateDto`/`UpdateAccount` não aceitam `CurrentBalance`; `IncrementBalance` existe no service mas não exposto em rota/UI. Perde o ajuste manual via `update_account.p_current_balance`.
- **[low · frontend]** Botão "Ver Cartão Vinculado" no card ausente (`AccountCard.tsx` não busca cartões; rota `/cards/:id` já existe — portável).
- **[low · frontend]** Card não exibe "Saldo Inicial" nem colore o "Saldo Atual" por sinal (dados já vêm em `BankAccountDisplayDto`).
- **[low · backend]** Campo "Pluggy Item ID" ausente (pendência da integração Pluggy inteira, spec 08).
- **[low · frontend]** Lista omite contas inativas (`Search active:true`); badge "Inativa" é código morto.

### auth
- **[low · frontend]** Rota `/login` não redireciona usuário já autenticado (`AppRouter.tsx:53` sem guard).
- **[low · frontend]** Sem refresh automático de token; JWT expira em 8h fixas e o 401 desloga (`config/http.ts`).
- **[low · frontend]** Erro de login via toast efêmero em vez de banner inline (`AuthProvider.tsx:61`).

### cards
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25 (extrato base)]** Extrato da fatura: `InvoiceRow` agora expande e lista as transações da fatura via `/transaction/list {invoice}`. *(Ainda falta editar/excluir transação inline e ordenação por coluna.)*
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25]** Listar transações por cartão/fatura: `TransactionFilterDto` ganhou `Card`/`Invoice`, aplicados em `GetPaginated`/`GetSummary`/`AppendReadFilters`. Verificado em runtime.
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25]** Pagar fatura: `POST /transaction/pay-bill` quita as transações da fatura + cria a despesa "Pgto Fatura {mês}" que debita a conta; `PayBillModal` + botão "Pagar" no `InvoiceRow`. Verificado em runtime.
- **[high · backend]** Edição de vigência não altera `closing_day`/`due_day` (só datas). Controller só expõe `UpdateStart`/`UpdateEnd`; campos coletados e descartados (`useCardCyclesLogic.ts:115-131`).
- **[~~high · frontend~~ ✅ RESOLVIDO 2026-06-25]** Criar cartão não definia closing/due day nem criava ciclo inicial. Agora o form pede fechamento/vencimento e `CreateCard` encadeia `CreateInitialCycle` na mesma transação (atômico). Verificado em runtime.
- **[medium · backend]** Gráficos do cartão (área histórico + pizza por categoria) ausentes. Área é servível por `/credit-card-invoice/get-by-card`; pizza depende de transações por fatura (bloqueada).
- **[medium · backend]** Excluir vigência de ciclo ausente. Sem `Delete` no service/controller (`/credit-card-statement-cycle/delete`).
- **[medium · backend]** Editar/excluir transação a partir do extrato ausente (depende de listar transações por fatura).
- **[low · frontend]** Subtítulo da lista sem totais de limite/uso (`statsByCard` disponível).
- **[low · frontend]** Duas telas de detalhe divergentes (modal `CardDetailModal` vs. página `/cards/:id` órfã).

### categories
- **[medium · backend]** Exclusão é DELETE físico com guarda de FK, não soft delete permissivo. `DeleteCategory` (`_CategoryService.cs:42-51`) lança `PendingRegistrationAnotherTable`; a UI promete "ficar sem categoria" mas o backend nega. Diverge do `delete_category` legado.
- **[medium · frontend]** Busca textual por nome ausente (substituída por SegmentedControl de tipo).
- **[medium · frontend]** Botão "Adicionar padrões" (seed de 5 categorias) ausente (POST `/category/create` já existe — loop client-side).
- **[medium · frontend/dados]** Ícones: legado grava nome Lucide (`utensils`...), atual grava emoji — incompatível e set reduzido (38→16).
- **[low · frontend]** Seletor de cor reduzido de hex livre para 16 swatches fixos.
- **[low · frontend]** Preview ao vivo da categoria no modal ausente.
- **[low · frontend]** Faixa colorida lateral (stripe) no card ausente.
- **[low · frontend]** Validação de nome diverge (min 3 legado vs. min 1 atual); atual adiciona unicidade por usuário+tipo.
- **[low · backend]** `List` não exclui categorias inativas (`Search` sem flag active); relevante só se soft-delete for adotado.

### dashboard
- **[low · frontend]** Lista de recentes não exibe nome da categoria. `RecentTransaction.category` é `number|null`; `TransactionDisplayDto.Category` é `long?` sem join do nome.

### profile
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25]** `/user/update` e `/user/update-password` eram admin-only. Adicionados `PUT /user/update-profile` e `PUT /user/update-my-password` com `[Authorization]` simples, escopados ao `UserLogged.user`. Não-admin já edita nome/senha. Verificado em runtime.
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25]** Self-edit não envia mais `email`/`isAdmin`: `UpdateOwnProfile(user, fullName)` toca só o `FullName`; `profileService`/`useProfilePageLogic` enviam apenas `fullName`/`password`. (Avatar segue pendente.)
- **[medium · backend]** Upload e exibição de avatar totalmente ausentes. `avatar_url` é só-leitura; sem endpoint de upload nem storage de imagem no .NET.

### salary
- **[high · backend]** "Excluir vigência atual + restaurar anterior" substituída por "Encerrar" (só seta `date_end=hoje`). Sem `Delete`/`Reopen` no backend (`deleteCurrentSettingAndRestorePrevious` do legado, spec SAL-04).
- **[medium · backend]** Faltam endpoints de delete e reopen de vigência (`delete_salary_setting`/`reopen_salary_setting`).
- **[low · frontend]** Tabela de histórico perdeu paginação e seletor de linhas-por-página.
- **[~~low · backend~~ ✅ RESOLVIDO 2026-06-25]** Endpoint `/settings-salary/simulate` (redundante e com fórmula divergente) foi removido junto com o código morto associado; cálculo permanece client-side como o legado.
- **[low · backend]** Criação de vigência não tem a mensagem dedicada `novoStart <= aberta.date_start` (efeito de bloqueio existe via overlap, só falta o texto).

### tracking
- **[low · frontend]** Título/subtítulo da página reescritos (cosmético).
- **[low · frontend]** Fallback de ciclo de vigência é global (`{1,10}`) em vez de por-cartão (impacto raro).
- **[low · frontend]** Ciclos serializados como `DateTime` ISO (`T00:00:00`) comparados lexicograficamente; limite inferior na data exata de início falha — recomendado `.slice(0,10)`.

### transactions
- **[~~high · backend~~ ✅ RESOLVIDO 2026-06-25]** `TransactionFilterDto` agora suporta filtros ricos (type, search, card, payment_method, hide/only credit, only_installments) via `TransactionQuery`; `AppendReadFilters` aplica todos em `GetPaginated`/`GetSummary`. Falta só a fiação da barra de filtros/tabs no frontend.
- **[medium · backend]** ✅ `sort_field` resolvido (whitelist server-side, default `payment_date`). **Falta `total_count`** (`COUNT(*) OVER()`) na listagem — `/transaction/list` ainda devolve lista plana sem total para paginação real.
- **[medium · backend(parcial)]** Navegação por mês + month-picker e visões Mensal/Geral/Parcelas ausentes. Mensal/Geral é só frontend; "Somente Parcelas" depende de `only_installments` (backend).
- **[medium · frontend]** Tabela não agrupa parcelas/recorrências em linhas expansíveis com progresso (`getGroupedTransactions` do legado ausente).
- **[medium · frontend]** Excluir grupo inteiro não exposto na UI (`deleteGroup`/`DELETE /transaction/delete-group` já existem, mas não ligados).
- **[medium · frontend]** Editar "aplicar ao grupo" não implementado no formulário (`updateGroup`/`PUT /transaction/update-group` existem, mas não usados).
- **[medium · frontend]** Ação "Inserir parcela no meio" do menu de linha ausente (`insertInstallmentBetween`/rota existem).
- **[~~medium · backend~~ ✅ RESOLVIDO 2026-06-25]** Pagar Fatura (payBill): `POST /transaction/pay-bill` faz a quitação atômica + lançamento "Pgto Fatura".
- **[low · frontend]** Import CSV muito mais pobre (sem drag-drop, preview editável, forma de pagamento, cartão, parcelas, template). Backend tampouco tem bulk-insert.
- **[low · backend]** Paginação reduzida: sem seletor de linhas/página e sem total (consequência da ausência de `total_count`).
- **[low · frontend]** Layout mobile (cards por transação) não portado.
- **[low · frontend]** Invalidação de cache mais estreita (só `transactions`); saldo de contas/limite de cartões podem ficar desatualizados até refetch.

### users
- **[low · frontend]** Menu de ações (popover) substituído por botões de ícone inline (funcionalidade idêntica).
- **[low · frontend]** Ordenação da lista difere (email asc no cliente vs. `created_at desc` no legado).
- **[low · ambos]** Data de criação carregada no tipo mas nunca exibida (paridade — ambos não exibem).

---

## Cobertura de regras de negócio (backend)

| Área | Implementado | Gaps principais |
|---|---|---|
| transacao-fatura | **parcial** | Núcleo RC-ALG-01/02 fiel. ✅ filtros TX-24/25 completos + `sort_field` whitelisted (2026-06-25); **falta só `total_count`** na leitura. Gaps remanescentes em **ciclo** (RC-18 overlap, RC-07/RC-09). |
| recalculo-fatura-ciclo | **parcial** | ✅ **RC-01 RESOLVIDO (2026-06-25):** 1º ciclo agora é criado atômico com o cartão. Ainda falta RC-18 (não-sobreposição), RC-07 (update closing/due/notes), RC-09 (delete com continuidade) e guard de RC-11 (reprocess sem ciclo aberto corromperia faturas). Pasta `Modules/StatementCycle` vazia. |
| sync-saldo-conta | **parcial** | AC-ALG-01 (delta incremental) robusto e fiel, invocado em toda mutação dentro de `TransactionScope`. Gaps na borda: delete físico (AC-03, espelha o gap de accounts), e ajustes em `Search` sem filtro active caso soft-delete seja adotado. |
| folha-salario | **parcial** | Vigências `full` (CreateWithValidity, overlap SAL-01). ✅ **SAL-ALG-01 RESOLVIDO (2026-06-25):** endpoint `SimulatePayroll` divergente removido; cálculo é client-side (spec recomenda). Ainda falta SAL-04 Delete/Reopen de vigência. |
| stats-dashboard | **full** | DS-01/02/03 cobertos e fiéis aos RPCs. Divergência verificada: `AND paid = TRUE` adicionado nas 4 queries (não consta na spec) — provavelmente intencional, **decidir e documentar**. `card` extra em ChartData. |
| auth-admin | **parcial** | Login (Argon2), JWT com `is_admin`, `/auth/me`, guards e 5 fluxos admin com regras críticas. ✅ **AU-06 RESOLVIDO (2026-06-25):** perfil self-service (`/user/update-profile`, `/user/update-my-password`). Ainda: sem COALESCE no update, `AD-01` sem `ORDER BY created DESC`, avatar storage ausente, ações admin sem audit_log, hashes bcrypt do Supabase não migráveis. |
| import-pluggy-csv | **missing** | Área inteira da spec 08 ausente. Zero ocorrências de "pluggy". Sem PL-01 (token), PL-02/03/04 (preview+dedup), PL-05/06 (commit), entidade `pluggy_items`, e import CSV (IM-01..05) com parse/validação/bulk-insert. O CSV presente é só exportação genérica do template. |
| parcelamento-recorrencia | **full** | TX-02/03/04, grupos TX-20/21, TX-23 InsertInstallmentBetween fiéis. Gaps menores: `UpdateGroup` aplica subconjunto fixo de campos (sem notes/account), linhas órfãs de grupo nunca coletadas. |

---

## Backlog priorizado para atingir 100%

Ordenado do mais ao menos impactante. **[BACKEND]** = exige endpoint/regra .NET nova; **[FRONTEND]** = só fiação/UI sobre backend pronto; **[AMBOS]** = backend + UI.

1. ~~**[BACKEND · CRÍTICO] RC-01 — criar ciclo inicial atômico com o cartão.**~~ ✅ **RESOLVIDO (2026-06-25).** `CreateCard` recebe `closingDay`/`dueDay` e chama `CreateInitialCycle` na mesma `TransactionScope` com rollback; form de cartão atualizado; validação 1-31 server-side. Verificado em runtime (happy path cria ciclo; dia inválido faz rollback sem cartão órfão).
2. ~~**[BACKEND · CRÍTICO] Folha — corrigir/remover `SimulatePayroll` (SAL-ALG-01).**~~ ✅ **RESOLVIDO (2026-06-25):** endpoint removido; cálculo consolidado no client-side da spec.
3. ~~**[BACKEND · CRÍTICO] Perfil self-service (AU-06).**~~ ✅ **RESOLVIDO (2026-06-25).** Endpoints `PUT /user/update-profile` e `PUT /user/update-my-password` (`[Authorization]` simples, escopados ao `UserLogged.user`, só `fullName`/senha). Não-admin edita nome/senha; sem reenvio de `isAdmin`/`email`. Verificado em runtime. (Avatar — gap medium — segue pendente.)
4. **[BACKEND] Transações por cartão/fatura + filtros ricos.** ✅ **Resolvido no backend (2026-06-25):** `Card`/`Invoice` → extrato da fatura; e agora type/search/payment_method/hide-only-credit/only_installments + `sort_field` whitelisted em `TransactionQuery`/`AppendReadFilters`. **Ainda falta:** `total_count` (COUNT(*) OVER()) para paginação real, a fiação da barra de filtros/tabs/visões no frontend de transações, e a pizza do cartão.
5. ~~**[AMBOS] Pagar fatura (payBill).**~~ ✅ **RESOLVIDO (2026-06-25):** `POST /transaction/pay-bill` + `PayBillModal`/botão "Pagar" no `InvoiceRow`. *(Falta apenas portar o `PayBillModal` também para a página de transactions, se desejado.)*
6. **[BACKEND] Soft-delete em contas e categorias (AC-03 / delete_category).** Trocar hard-delete + guarda de FK por desativação (`active=false`), alinhar listagens (`Search active`) e ajustar diálogos da UI. Resolve os gaps de accounts (high) e categories (medium) e o de sync-saldo.
7. **[BACKEND] Ciclo de fatura completo (RC-07/RC-09/RC-18) + guard RC-11.** Update de closing/due/notes, delete de ciclo com continuidade temporal, validação de não-sobreposição de vigências, e guard de "ciclo aberto" no reprocess (evita corromper faturas). Resolve gaps high/medium de cards (editar/excluir vigência).
8. **[BACKEND] Vigência salarial — delete + reopen (SAL-04).** `delete_salary_setting` + `reopen_salary_setting` transacionais (excluir vigência atual e restaurar a anterior). Restaura o fluxo "Excluir vigência" do legado (hoje só "Encerrar").
9. **[FRONTEND] Fiação de fluxos com backend já pronto.** Excluir grupo (`delete-group`), editar "aplicar ao grupo" (`update-group`), "inserir parcela no meio" (`insert-installment-between`), agrupamento de parcelas em linhas expansíveis, navegação por mês + visão Geral, "Ver Cartão Vinculado", "Saldo Inicial"/cor no card de conta, busca textual + "Adicionar padrões" em categorias, e invalidação de cache cruzada (transactions+accounts+cards).
10. **[AMBOS] Avatar de perfil.** Endpoint de upload + storage de imagem no .NET + persistência de `avatar_url`; `ProfileHeaderSection` e exibição no Sidebar/Header no frontend.
11. **[FRONTEND] Import CSV avançado.** Drag-drop, preview editável, forma de pagamento, seletor de cartão, coluna de parcelas, template. (Backend opcional: `insert_transactions` bulk para evitar N chamadas.)
12. **[BACKEND] Decisão sobre `paid = TRUE` no dashboard.** Confirmar se a divergência das 4 queries é intencional e alinhar a spec, ou remover o filtro.
13. **[FRONTEND] Polimentos de baixa severidade.** Redirect de `/login`, nome da categoria nas recentes, paginação da tabela de vigências, layout mobile de transações, picker de ícone Lucide (compat. de dados), e demais itens `low`.

---

## Nota sobre importação de dados

A **importação dos dados do Supabase** para o banco PostgreSQL local é um **item separado, em andamento, dependente do dump fornecido pelo usuário**, e **não faz parte desta validação de paridade de código**. Os gaps acima referem-se exclusivamente a paridade de funcionalidade/comportamento entre as duas bases de código.
