# SPECS - Sistema de Finanças Pessoais (Finnance)

## STACK TECNOLÓGICA

### Frontend
- **Build Tool:** rolldown-vite 7.2.5
- **Framework:** React 19+
- **Linguagem:** TypeScript 5.9+
- **UI Library:** Material UI (MUI) v7
- **Routing:** React Router v7
- **State Management:**
  - Zustand 5 (client state: sidebar, theme, filters)
  - TanStack Query v5 (server state: accounts, transactions, profiles)
- **Forms:** React Hook Form v7 + Zod v4
- **Gráficos:** Recharts 3
- **Datas:** date-fns v4
- **Animações:** Framer Motion 12
- **Ícones:** Lucide React + MUI Icons Material
- **CSV:** PapaParse
- **HTTP Client:** Supabase Client (nativo)

### Backend & Database
- **Platform:** Supabase
- **Database:** PostgreSQL 15+
- **Auth:** Supabase Auth (Email/Senha + Google OAuth)
- **Security:** Row Level Security (RLS) em todas as tabelas
- **Realtime:** Supabase Realtime (opcional)

### Infraestrutura
- **Hosting:** Vercel (SPA)
- **Repository:** GitHub
- **CI/CD:** GitHub Actions (Build & Lint)
- **Package Manager:** pnpm 9+

---

## ARQUITETURA DA APLICAÇÃO

### Estrutura de Pastas (Folder-by-Type)
```
src/
  app-routes/
    AppRouter.tsx              # Rotas com lazy loading e guards (Protected/Admin)
  assets/                      # Imagens e assets estáticos
  lib/
    supabase/
      client.ts                # Inicialização do Supabase Client
      auth-context.tsx          # AuthProvider com user, session, profile
  pages/                       # Páginas de rota (componentes de página)
    AccountsPage.tsx
    BillTrackingPage.tsx
    CategoriesPage.tsx
    CreditCardDetailsPage.tsx
    CreditCardsPage.tsx
    DashboardPage.tsx
    LoginPage.tsx
    ProfilePage.tsx
    SalarySimulatorPage.tsx
    TransactionsPage.tsx
    UsersManagementPage.tsx
  shared/
    components/                # Componentes organizados por domínio
      accounts/                # Componentes de contas bancárias
      cards/                   # Componentes de cartões de crédito
      categories/              # Componentes de categorias
      common/                  # Componentes reutilizáveis (loaders, modais genéricos)
      dashboard/               # Widgets e gráficos do dashboard
      layout/                  # Header, Sidebar, MainLayout
      profile/                 # Componentes do perfil do usuário
      salary-simulator/        # Componentes do simulador de salário
      tracking/                # Componentes de acompanhamento mensal
      transactions/            # CRUD, filtros, importação CSV
        import/                # Modal e utilitários de importação CSV
        TransactionForm/       # Formulário de transação
      users/                   # Gestão de usuários (admin)
    constants/
      queryKeys.ts             # Chaves centralizadas do React Query
    contexts/
      site-branding-context.tsx
      site-branding-context-object.ts
    hooks/                     # Hooks de lógica de página e dados
    interfaces/                # Tipos e interfaces TypeScript
    services/                  # Serviços de acesso a dados (Supabase)
    theme/
      index.ts                 # Tema MUI customizado
    utils/                     # Utilitários e formatadores
  App.tsx
  main.tsx
  index.css
```

---

## ROTAS DA APLICAÇÃO

| Rota | Página | Guard |
|---|---|---|
| `/` | Redirect → Dashboard ou Login | — |
| `/auth/login` | LoginPage | Público |
| `/dashboard` | DashboardPage | ProtectedRoute |
| `/accounts` | AccountsPage | ProtectedRoute |
| `/transactions` | TransactionsPage | ProtectedRoute |
| `/categories` | CategoriesPage | ProtectedRoute |
| `/cards` | CreditCardsPage | ProtectedRoute |
| `/cards/:id` | CreditCardDetailsPage | ProtectedRoute |
| `/tracking` | BillTrackingPage | ProtectedRoute |
| `/salary-simulator` | SalarySimulatorPage | ProtectedRoute |
| `/profile` | ProfilePage | ProtectedRoute |
| `/users` | UsersManagementPage | AdminRoute |

Todas as páginas protegidas usam `React.lazy()` com `Suspense` para code-splitting.

---

## SCHEMA DO BANCO DE DADOS (SUPABASE)

### Convenções
- Todas as tabelas possuem `user_id` para isolamento via RLS
- Soft deletes: `deleted_at TIMESTAMPTZ NULL`
- Audit trail: `created_at`, `updated_at`
- UUIDs para IDs primários
- snake_case para colunas

### Tabela: profiles
```
id              UUID PK (ref auth.users)
full_name       TEXT
avatar_url      TEXT
currency        TEXT DEFAULT 'BRL'
locale          TEXT DEFAULT 'pt-BR'
is_admin        BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Tabela: accounts
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
name            TEXT NOT NULL
type            ENUM('checking','savings','investment','wallet','other')
initial_balance DECIMAL(15,2) DEFAULT 0
current_balance DECIMAL(15,2) DEFAULT 0
color           TEXT
icon            TEXT
notes           TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```

### Tabela: categories
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
name            TEXT NOT NULL
type            ENUM('income','expense')
icon            TEXT
color           TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```

### Tabela: credit_cards
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
bank_account_id UUID (ref accounts)
name            TEXT NOT NULL
credit_limit    DECIMAL(15,2) NOT NULL
closing_day     INTEGER (1-31)
due_day         INTEGER (1-31)
color           TEXT
notes           TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ
```

### Tabela: transactions
```
id                    UUID PK
user_id               UUID NOT NULL (ref auth.users)
type                  ENUM('income','expense','transfer')
description           TEXT NOT NULL
amount                DECIMAL(15,2) NOT NULL
payment_date          DATE
purchase_date         DATE
account_id            UUID (ref accounts)
to_account_id         UUID (ref accounts, para transferências)
card_id               UUID (ref credit_cards)
category_id           UUID (ref categories)
payment_method        TEXT
is_fixed              BOOLEAN DEFAULT false
is_paid               BOOLEAN DEFAULT false
installment_group_id  UUID (agrupa parcelas)
installment_number    INTEGER
total_installments    INTEGER
recurring_group_id    UUID (agrupa recorrentes)
notes                 TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
deleted_at            TIMESTAMPTZ
```

### Tabela: credit_card_statement_cycles
```
id              UUID PK
user_id         UUID NOT NULL
card_id         UUID (ref credit_cards)
date_start      DATE
date_end        DATE
closing_day     INTEGER
due_day         INTEGER
notes           TEXT
created_at      TIMESTAMPTZ
```

### Tabela: credit_card_statement_period_ranges
```
id                  UUID PK
user_id             UUID NOT NULL
card_id             UUID (ref credit_cards)
period_start        DATE
period_end          DATE
statement_month_key TEXT
statement_name      TEXT
notes               TEXT
created_at          TIMESTAMPTZ
```

### Tabela: salary_settings
```
user_id                   UUID (ref auth.users)
date_start                DATE
date_end                  DATE
hourly_rate               DECIMAL
base_salary               DECIMAL
inss_discount_percentage  DECIMAL
admin_fee_percentage      DECIMAL
```

---

## DESIGN SYSTEM (Theme MUI)

- **Modo:** Dark (ultra-dark)
- **Fontes:** DM Sans (body) + Plus Jakarta Sans (headings)
- **Border Radius:** 16px (cards), 10px (botões e inputs)
- **Accent:** Gold `#C9A84C`

### Paleta de Cores
```
Background Primary:    #0A0A0F
Background Secondary:  #111118
Background Card:       #14141E
Background Card Hover: #1A1A28
Border:                rgba(255, 255, 255, 0.06)
Text Primary:          #F0F0F5
Text Secondary:        #8B8B9E
Text Muted:            #5A5A6E
Accent (Gold):         #C9A84C
Success (Green):       #10B981
Error (Red):           #EF4444
Warning (Yellow):      #F5A623
Info (Blue):           #3B82F6
Purple:                #8B5CF6
```

---

## SERVICES

| Arquivo | Responsabilidade |
|---|---|
| `accounts.service.ts` | CRUD de contas bancárias |
| `cards.service.ts` | CRUD de cartões + cálculo de faturas e limites |
| `categories.service.ts` | CRUD de categorias |
| `transactions.service.ts` | CRUD de transações + queries por range |
| `transactions-operations.service.ts` | Operações em lote e parcelamento |
| `dashboard.service.ts` | Agregações para o dashboard (saldos, gráficos) |
| `salary-settings.service.ts` | CRUD de configurações salariais e cálculos de holerite |
| `site-branding.service.ts` | Configurações de branding do site |
| `card-statement-cycle.utils.ts` | Utilitários de ciclos de fatura |
| `transactionsGroup.utils.ts` | Agrupamento de transações |

---

## HOOKS

| Arquivo | Responsabilidade |
|---|---|
| `useAccounts.ts` | Query hook para contas |
| `useAccountsPageLogic.ts` | Lógica da página de contas |
| `useBillTrackingPageLogic.ts` | Lógica de acompanhamento mensal |
| `useCategories.ts` | Query hook para categorias |
| `useCategoriesPageLogic.ts` | Lógica da página de categorias |
| `useCreditCards.ts` | Query hook para cartões |
| `useCreditCardsPageLogic.ts` | Lógica da página de cartões |
| `useCreditCardDetailsLogic.ts` | Lógica da página de detalhes do cartão |
| `useDashboardPageLogic.ts` | Lógica do dashboard |
| `useProfilePageLogic.ts` | Lógica do perfil do usuário |
| `useSalarySettings.ts` | Query hook para configurações salariais |
| `useSalarySimulatorPageLogic.ts` | Lógica do simulador de salário |
| `useSiteBranding.ts` | Hook de branding |
| `useTransactionFormLogic.ts` | Lógica do formulário de transação |
| `useTransactions.ts` | Query hook para transações |
| `useTransactionsPageLogic.ts` | Lógica da página de transações |

---

## TESTES

Testes unitários com Vitest + Testing Library em `tests/`:

- `importTransactions.utils.test.ts` — Parser e normalização da importação CSV
- `billTracking.utils.test.ts` — Resumo de tracking mensal
- `transactionsGroup.utils.test.ts` — Filtro/agrupamento de transações
- `payroll-calculations.test.ts` — Cálculos de folha (`calculatePayroll`)
- `transactionsPage.utils.test.ts` — Resumo e agrupamento de transações
- `cardStatementCycles.utils.test.ts` — Lógica de ciclos de fatura do cartão
