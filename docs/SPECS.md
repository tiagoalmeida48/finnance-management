# SPECS - Sistema de Finanças Pessoais (Finnance)

## STACK TECNOLÓGICA

### Frontend
- **Build Tool:** rolldown-vite 7.2.5
- **Framework:** React 19+
- **Linguagem:** TypeScript 5.9+
- **UI Library:** Tailwind CSS v4 + shadcn/ui + Magic UI + Radix UI
- **Routing:** React Router v7
- **State Management:**
  - Zustand 5 (client state: sidebar, theme, filters)
  - TanStack Query v5 (server state: accounts, transactions, profiles)
- **Forms:** React Hook Form v7 + Zod v4
- **Gráficos:** Recharts 3
- **Datas:** date-fns v4
- **Animações:** Framer Motion 12
- **Ícones:** Lucide React
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
  pages/                       # Páginas de rota organizadas em subdiretórios
    accounts/
    auth/
    cards/
    categories/
    dashboard/
    profile/
    salary-simulator/
    tracking/
    transactions/
    users/
  shared/
    components/                # Componentes UI organizados arquiteturalmente
      composite/               # Componentes que unem múltiplos blocos menores
      forms/                   # Elementos isolados de formulários com form manager
      layout/                  # Header, Sidebar, Wrapper macro
      ui/                      # Primitivos shadcn/ui / Design System
    constants/
      queryKeys.ts             # Chaves centralizadas do React Query
    contexts/
      site-branding-context.tsx
      site-branding-context-object.ts
    hooks/                     # Hooks customizados
      api/                     # Centraliza funções de fetching do React Query
    interfaces/                # Tipos e interfaces TypeScript
    services/                  # Serviços de acesso a dados (Supabase) organizados por domínio
    theme/
      index.ts                 # Tema TypeScript derivado das variáveis CSS
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
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
is_admin        BOOLEAN DEFAULT false
```

### Tabela: site_branding
```
id              INTEGER PK
site_title      TEXT DEFAULT 'FINNANCE'
logo_image      TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Tabela: settings_salary
```
user_id                   UUID (ref auth.users)
date_start                DATE
date_end                  DATE
hourly_rate               NUMERIC
base_salary               NUMERIC
inss_discount_percentage  NUMERIC
admin_fee_percentage      NUMERIC
PRIMARY KEY (user_id, date_start, date_end)
```

### Tabela: bank_accounts
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
name            CHARACTER VARYING
type            CHARACTER VARYING DEFAULT 'checking'
initial_balance NUMERIC DEFAULT 0
current_balance NUMERIC DEFAULT 0
color           CHARACTER VARYING DEFAULT '#8b5cf6'
icon            CHARACTER VARYING DEFAULT 'wallet'
notes           TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMP WITHOUT TIME ZONE
```

### Tabela: categories
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
type            TEXT ('income' | 'expense')
name            TEXT
color           TEXT
icon            TEXT
is_active       BOOLEAN DEFAULT true
deleted_at      TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Tabela: credit_cards
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
bank_account_id UUID (ref bank_accounts)
name            TEXT
color           TEXT
credit_limit    NUMERIC DEFAULT 0
closing_day     INTEGER (1-31)
due_day         INTEGER (1-31)
is_active       BOOLEAN DEFAULT true
deleted_at      TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
notes           TEXT
```

### Tabela: credit_card_invoices
```
id              UUID PK
user_id         UUID (ref auth.users)
card_id         UUID (ref credit_cards)
month_key       TEXT
closing_date    DATE
due_date        DATE
total_amount    NUMERIC DEFAULT 0
paid_amount     NUMERIC DEFAULT 0
status          TEXT ('open', 'closed', 'paid', 'partial')
closed_at       TIMESTAMPTZ
paid_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Tabela: credit_card_statement_cycles
```
id              UUID PK
user_id         UUID NOT NULL (ref auth.users)
card_id         UUID (ref credit_cards)
date_start      DATE
date_end        DATE DEFAULT '9999-12-31'
closing_day     SMALLINT
due_day         SMALLINT
notes           TEXT
created_at      TIMESTAMPTZ
```

### Tabela: credit_card_statement_period_ranges
```
id                  UUID PK
user_id             UUID NOT NULL (ref auth.users)
card_id             UUID NOT NULL (ref credit_cards)
period_start        DATE NOT NULL
period_end          DATE NOT NULL
statement_month_key TEXT NOT NULL
statement_name      TEXT NOT NULL
notes               TEXT
created_at          TIMESTAMPTZ NOT NULL
```

### Tabela: transactions
```
id                    UUID PK
user_id               UUID NOT NULL (ref auth.users)
type                  TEXT ('receita', 'despesa', 'income', 'expense', 'transfer')
amount                NUMERIC
payment_date          DATE
description           TEXT
account_id            UUID (ref bank_accounts)
to_account_id         UUID (ref bank_accounts)
card_id               UUID (ref credit_cards)
category_id           UUID (ref categories)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
is_fixed              BOOLEAN DEFAULT false
notes                 TEXT
payment_method        TEXT
purchase_date         DATE
installment_group_id  UUID
installment_number    INTEGER
total_installments    INTEGER
recurring_group_id    UUID DEFAULT gen_random_uuid()
is_paid               BOOLEAN
invoice_id            UUID (ref credit_card_invoices)
```

---

## DESIGN SYSTEM (Tailwind + CSS Variables)

### Fonte única de estilo global
- Arquivo central: `src/App.css`
- Bootstrap de estilos: `src/index.css` (`@import 'tailwindcss'` + `@import './App.css'`)
- Tema TS derivado: `src/shared/theme/index.ts` (usa `var(--color-...)`)

### Regras de uso
- Sempre priorizar tokens globais (`var(--color-...)`, `var(--font-...)`, `var(--radius-...)`).
- Evitar novas cores hardcoded (`#hex`, `rgba(...)`) fora de casos dinâmicos inevitáveis.
- Em `className`, preferir classes com token:
  - `bg-[var(--color-card)]`
  - `text-[var(--color-text-primary)]`
  - `border-[var(--color-border)]`

### Quando usar estilo inline
- Somente para casos realmente dinâmicos (ex.: cor vinda do banco).
- Evitar concatenação de alpha com CSS var (ex.: `var(--color-primary)40` é inválido).
- Quando precisar fallback com alpha, usar uma cor fixa compatível para esse cálculo ou um token já com alpha.

### Tokens principais e Paleta
- Base: `--color-background`, `--color-surface`, `--color-card`, `--color-card-hover`
- Texto: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- Ação: `--color-primary`, `--color-primary-light`, `--color-primary-dark`, `--color-secondary`
- Semânticas: `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- Auxiliares: `--color-accent`, `--color-accentGlow`, `--color-blue`, `--color-greenBg`, `--color-redBg`, `--color-purpleBg`, `--color-yellowBg`, `--color-bgSecondary`

- **Modo:** Dark (ultra-dark)
- **Fontes:** DM Sans (body) + Plus Jakarta Sans (headings)
- **Border Radius:** 16px (cards), 10px (botões e inputs)
- **Accent:** Gold `#C9A84C`

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

| Arquivo/Pasta | Responsabilidade |
|---|---|
| `accounts.service.ts` | CRUD de contas bancárias |
| `cards.service.ts` | CRUD de cartões, limites e ciclos |
| `categories.service.ts` | CRUD de categorias |
| `dashboard.service.ts` | Agregações para o dashboard (saldos, gráficos) |
| `invoice-reconciliation.service.ts` | Reconciliação de faturas |
| `invoices.service.ts` | CRUD e pagamentos de faturas |
| `salary-settings.service.ts` | CRUD de configurações salariais |
| `salary-simulator.service.ts` | Cálculos e simulações de holerite |
| `site-branding.service.ts` | Configurações de branding do site |
| `transactions/` | Pasta contendo os serviços focados em transações |
| `transactions-import.service.ts` | Lógica e parse de importações CSV |
| `transactions.service.ts` | CRUD unificado de transações |
| `users.service.ts` | Gestão de usuários do sistema |

---

## HOOKS

Os hooks do sistema agora são divididos entre **API (React Query)** e **Feature Logic (Páginas)**.

### `src/shared/hooks/api/` (Data Fetching / React Query)
| Arquivo | Responsabilidade |
|---|---|
| `useAccounts.ts` | Query hook para contas |
| `useCategories.ts` | Query hook para categorias |
| `useCreditCards.ts` | Query hook para cartões |
| `useInvoices.ts` | Query hook para faturas |
| `useSalarySettings.ts` | Query hook para configurações salariais |
| `useSiteBranding.ts` | Query hook para branding do site |
| `useTransactions.ts` | Query hook para transações |

### `src/pages/*/hooks/` (Feature Logic)
Cada módulo de página (`accounts`, `cards`, `transactions`, etc.) contém seus próprios hooks de lógica:
Exemplo: `src/pages/accounts/hooks/useAccountsPageLogic.ts`.
A responsabilidade destes hooks é centralizar os modais, manipulação de estado local, formatação de listagens e ligações com as queries e mutations relativas à página.

---

## TESTES

Testes unitários com Vitest + Testing Library em `tests/`:

- `importTransactions.utils.test.ts` — Parser e normalização da importação CSV
- `billTracking.utils.test.ts` — Resumo de tracking mensal
- `transactionsGroup.utils.test.ts` — Filtro/agrupamento de transações
- `payroll-calculations.test.ts` — Cálculos de folha (`calculatePayroll`)
- `transactionsPage.utils.test.ts` — Resumo e agrupamento de transações
- `cardStatementCycles.utils.test.ts` — Lógica de ciclos de fatura do cartão
