# SPECS - Sistema de Finanças Pessoais

## STACK TECNOLÓGICA

### Frontend
- **Build Tool:** Vite 5+
- **Framework:** React 18+
- **Linguagem:** TypeScript 5+
- **UI Library:** Material UI (MUI) v5
- **Routing:** React Router v6
- **State Management:** 
  - Zustand (client state: sidebar, theme, filters)
  - TanStack Query v5 (server state: accounts, transactions, profiles)
- **Forms:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Datas:** date-fns
- **HTTP Client:** Supabase Client (nativo)

### Backend & Database
- **Platform:** Supabase
- **Database:** PostgreSQL 15+
- **Auth:** Supabase Auth (Email/Senha + Google)
- **Security:** Row Level Security (RLS) implementado em todas as tabelas
- **Realtime:** Supabase Realtime para notificações de transações (opcional)

### Infraestrutura
- **Hosting:** Vercel (para o SPA)
- **Repository:** GitHub
- **CI/CD:** GitHub Actions (Build & Lint)

---

## ARQUITETURA DA APLICAÇÃO

### Estrutura de Pastas
```
/src
  /assets
  /components
    /common          # Buttons, Modals, Loaders genéricos
    /layout          # Header, Sidebar, Wrapper
  /features
    /auth            # Login, Register, Recovery
    /accounts        # Contas bancárias
    /cards           # Cartões de crédito
    /categories      # CRUD Categorias
    /transactions    # Listagem, Filtros, CRUD
    /recurring       # Agendamentos e parcelas
    /dashboard       # Widgets e Gráficos
  /hooks             # useLocalStorage, useDebounce, etc
  /lib
    /supabase        # client.ts, auth-context.tsx
    /utils           # formatters.ts, constants.ts
    /validators      # Schemas Zod reutilizáveis
  /stores            # zustand/useUIStore.ts
  /types             # database.ts (gerado), domain-types.ts
  /routes            # AppRoutes.tsx
  /theme             # custom-theme.ts (MUI)
  App.tsx
  main.tsx
```

---

## SCHEMA DO BANCO DE DADOS (SUPABASE)

### Tabela: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  locale TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Tabela: accounts
```sql
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'investment', 'wallet', 'other');

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type account_type NOT NULL DEFAULT 'checking',
  bank_name TEXT,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#1976d2',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
```

### Tabela: transactions
```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  credit_card_id UUID REFERENCES credit_cards(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
```

---

## IMPLEMENTAÇÃO DO SERVICE

```typescript
// src/features/transactions/services/transactions.service.ts
import { supabase } from '@/lib/supabase/client';

export const transactionsService = {
  async getByRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color, icon)')
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(payload: any) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

---

## MATERIAL UI THEME (Swiss Moral Inspiration)

```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37', // Gold
    },
    background: {
      default: '#0A0A0A',
      paper: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    }
  },
  shape: {
    borderRadius: 2, // Sharp corners for "Swiss Moral"
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
        },
      },
    },
  },
});
```

---

## ROADMAP TÉCNICO

**Fase 1 - Infra & Auth (Semana 1):**
- [ ] Configuração do projeto Vite + MUI.
- [ ] Setup do cliente Supabase e AuthContext.
- [ ] Telas de Login/Cadastro com validação Zod.

**Fase 2 - Core CRUD (Semana 2):**
- [ ] Gestão de Contas e Categorias.
- [ ] Lançamento de Transações (Income/Expense).
- [ ] Implementação de RLS e Soft Deletes.

**Fase 3 - Dashboard & Analytics (Semana 3):**
- [ ] Gráficos Recharts (Fluxo de caixa).
- [ ] Widget de saldo consolidado.
- [ ] Filtros por período.

**Fase 4 - Avançado (Semana 4):**
- [ ] Transações recorrentes e parcelas.
- [ ] Modo faturas de cartão de crédito.
- [ ] Exportação de relatórios.
