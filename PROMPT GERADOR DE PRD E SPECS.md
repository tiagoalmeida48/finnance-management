# PROMPT GERADOR DE PRD E SPECS - Sistema de Finanças Pessoais

Você é um Product Manager e Tech Lead especializado em criar documentação técnica profissional para aplicações web.

Sua tarefa é criar dois documentos completos:
1. **PRD.md** (Product Requirements Document)
2. **SPECS.md** (Especificações Técnicas)

---

## STACK TECNOLÓGICA OBRIGATÓRIA

Use SEMPRE estas tecnologias:

**Frontend:**
- React 18+ com Vite
- TypeScript 5+
- Material UI (MUI) v5+
- React Router v6
- React Hook Form + Zod (validação)
- TanStack Query v5 (server state)
- Zustand (client state)
- date-fns (manipulação de datas)
- Recharts ou Chart.js (gráficos)

**Backend & Database:**
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Supabase Auth (autenticação nativa)
- Row Level Security (RLS)

**Infraestrutura:**
- Vite (build tool)

---

## CONTEXTO DO PROJETO: SISTEMA DE FINANÇAS PESSOAIS

O sistema deve gerenciar:
- **Contas bancárias** (corrente, poupança)
- **Cartões de crédito** (limite, fatura, vencimento)
- **Categorias** (receitas e despesas)
- **Transações** (entrada, saída, transferência)
- **Pagamentos mensais** (recorrentes, parcelas)
- **Dashboard** (visão geral, gráficos, indicadores)
- **Usuários** (multi-user com isolamento de dados)

---

## ESTRUTURA DO PRD.md

Crie um documento seguindo EXATAMENTE esta estrutura:

```markdown
# PRD - [Nome do Produto]

## 1. VISÃO DO PRODUTO
[Descrição clara do que é o produto em 2-3 frases]

## 2. OBJETIVOS DE NEGÓCIO
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

## 3. PERSONAS

### Persona Principal
- **Nome:** [Nome fictício]
- **Perfil:** [Idade, ocupação, contexto]
- **Dores:** [Problemas que enfrenta]
- **Necessidades:** [O que precisa resolver]
- **Comportamento:** [Como usa tecnologia]

### Persona Secundária (se aplicável)
[...]

## 4. FUNCIONALIDADES CORE

### 4.1 Autenticação (Supabase Auth)
**Descrição:**
Sistema de login e registro usando Supabase Auth nativo.

**Requisitos:**
- Login com email/senha
- Login com OAuth (Google)
- Recuperação de senha
- Verificação de email
- Sessão persistente

**Fluxo do usuário:**
1. Usuário acessa a aplicação
2. Se não autenticado, redireciona para /login
3. Pode criar conta ou fazer login
4. Após autenticado, acessa o dashboard

### 4.2 Gestão de Contas Bancárias
**Descrição:**
[Explicação detalhada]

**Requisitos:**
- [Requisito específico 1]
- [Requisito específico 2]

**Campos:**
- [Campo 1]: [Tipo e descrição]
- [Campo 2]: [Tipo e descrição]

**Fluxo do usuário:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### 4.3 Gestão de Cartões de Crédito
**Descrição:**
[...]

**Requisitos:**
[...]

**Campos:**
[...]

### 4.4 Gestão de Categorias
**Descrição:**
[...]

### 4.5 Gestão de Transações
**Descrição:**
[...]

**Tipos de transação:**
- Receita (entrada)
- Despesa (saída)
- Transferência entre contas

### 4.6 Pagamentos Recorrentes e Parcelas
**Descrição:**
[...]

### 4.7 Dashboard e Relatórios
**Descrição:**
[...]

**Indicadores:**
- Saldo total
- Receitas do mês
- Despesas do mês
- Balanço mensal
- [Outros indicadores]

**Gráficos:**
- [Gráfico 1]
- [Gráfico 2]

## 5. REQUISITOS NÃO-FUNCIONAIS
- **Performance:** [metas específicas]
- **Segurança:** [requisitos - RLS, auth, etc]
- **Responsividade:** Mobile-first, suporte a tablet e desktop
- **Acessibilidade:** WCAG 2.1 nível AA

## 6. FORA DO ESCOPO V1
❌ [Item 1]
❌ [Item 2]
❌ [Item 3]

## 7. ONBOARDING
**Fluxo:**
1. [Passo 1 - Sign Up]
2. [Passo 2]
3. [Passo 3]

**Checklist de Primeiros Passos:**
- [ ] Criar primeira conta bancária
- [ ] Cadastrar categorias
- [ ] Registrar primeira transação
- [ ] [...]

## 8. MÉTRICAS DE SUCESSO
- [Métrica 1]: [Meta]
- [Métrica 2]: [Meta]
- [Métrica 3]: [Meta]
```

---

## ESTRUTURA DO SPECS.md

Crie um documento seguindo EXATAMENTE esta estrutura:

```markdown
# SPECS - [Nome do Produto]

## STACK TECNOLÓGICA

### Frontend
- **Build Tool:** Vite 5+
- **Framework:** React 18+
- **Linguagem:** TypeScript 5+
- **UI Library:** Material UI (MUI) v5
- **Routing:** React Router v6
- **State Management:** 
  - Zustand (client state)
  - TanStack Query v5 (server state / cache)
- **Forms:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Datas:** date-fns
- **HTTP Client:** Supabase Client (nativo)

### Backend & Database
- **Platform:** Supabase
- **Database:** PostgreSQL 15+
- **Auth:** Supabase Auth (email + OAuth)
- **Security:** Row Level Security (RLS)
- **Realtime:** Supabase Realtime (opcional)

### Infraestrutura
- **Hosting:** Vercel / Netlify (SPA)
- **Repository:** GitHub
- **CI/CD:** GitHub Actions

---

## ARQUITETURA DA APLICAÇÃO

### Estrutura de Pastas
```
/src
  /assets
    /images
  /components
    /common          # Componentes reutilizáveis
    /layout          # Header, Sidebar, Footer
    /forms           # Componentes de formulário
    /charts          # Componentes de gráficos
  /features
    /auth            # Login, Register, etc
    /accounts        # Contas bancárias
    /cards           # Cartões de crédito
    /categories      # Categorias
    /transactions    # Transações
    /recurring       # Pagamentos recorrentes
    /dashboard       # Dashboard e relatórios
  /hooks             # Custom hooks
  /lib
    /supabase        # Cliente e helpers
    /utils           # Utilitários
    /validators      # Schemas Zod
  /stores            # Zustand stores
  /types             # TypeScript types/interfaces
  /routes            # Configuração de rotas
  /theme             # Tema MUI customizado
  App.tsx
  main.tsx
```

### Padrão de Feature
Cada feature segue a estrutura:
```
/features/[feature]
  /components        # Componentes específicos
  /hooks             # Hooks específicos
  /services          # Chamadas ao Supabase
  /types             # Types específicos
  index.ts           # Exports
```

---

## SCHEMA DO BANCO DE DADOS (SUPABASE)

### Convenções
- Todas as tabelas têm `user_id` para isolamento
- RLS policies em TODAS as tabelas
- Soft deletes: `deleted_at TIMESTAMPTZ NULL`
- Audit trail: `created_at`, `updated_at`
- UUIDs para IDs primários
- Snake_case para colunas

### Tabela: profiles
```sql
-- Extensão do auth.users
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

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Tabela: accounts (Contas Bancárias)
```sql
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'investment', 'wallet', 'other');

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type account_type NOT NULL DEFAULT 'checking',
  bank_name TEXT,
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#1976d2',
  icon TEXT DEFAULT 'account_balance',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id);
```

### Tabela: credit_cards (Cartões de Crédito)
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  last_digits TEXT, -- últimos 4 dígitos
  brand TEXT, -- Visa, Mastercard, etc
  credit_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  available_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  color TEXT DEFAULT '#d32f2f',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);

-- RLS
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own cards"
  ON credit_cards FOR ALL
  USING (auth.uid() = user_id);
```

### Tabela: categories
```sql
CREATE TYPE category_type AS ENUM ('income', 'expense');

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type category_type NOT NULL,
  icon TEXT DEFAULT 'category',
  color TEXT DEFAULT '#9e9e9e',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT false, -- categorias padrão
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(user_id, name, type)
);

-- Indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id);
```

### Tabela: transactions
```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'completed',
  date DATE NOT NULL,
  
  -- Relacionamentos
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  
  -- Para transferências
  destination_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  
  -- Para parcelas
  recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  installment_number INTEGER,
  total_installments INTEGER,
  
  notes TEXT,
  tags TEXT[], -- array de tags
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_credit_card_id ON transactions(credit_card_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);
```

### Tabela: recurring_transactions
```sql
CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type transaction_type NOT NULL,
  
  frequency recurrence_frequency NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = sem fim
  next_date DATE NOT NULL,
  
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  
  -- Para parcelas fixas
  total_installments INTEGER,
  current_installment INTEGER DEFAULT 1,
  
  is_active BOOLEAN DEFAULT true,
  auto_create BOOLEAN DEFAULT false, -- criar automaticamente
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_date ON recurring_transactions(next_date);

-- RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own recurring"
  ON recurring_transactions FOR ALL
  USING (auth.uid() = user_id);
```

### Views úteis
```sql
-- View: Resumo mensal
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) AS month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance
FROM transactions
WHERE deleted_at IS NULL AND status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', date);

-- View: Gastos por categoria
CREATE OR REPLACE VIEW expenses_by_category AS
SELECT 
  t.user_id,
  DATE_TRUNC('month', t.date) AS month,
  t.category_id,
  c.name AS category_name,
  c.color AS category_color,
  SUM(t.amount) AS total
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense' AND t.deleted_at IS NULL
GROUP BY t.user_id, DATE_TRUNC('month', t.date), t.category_id, c.name, c.color;
```

### Funções úteis
```sql
-- Função: Atualizar saldo da conta
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza conta de origem
  IF NEW.account_id IS NOT NULL THEN
    UPDATE accounts SET 
      current_balance = initial_balance + COALESCE((
        SELECT SUM(
          CASE 
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN -amount
            WHEN type = 'transfer' AND account_id = NEW.account_id THEN -amount
            WHEN type = 'transfer' AND destination_account_id = NEW.account_id THEN amount
            ELSE 0
          END
        )
        FROM transactions 
        WHERE (account_id = NEW.account_id OR destination_account_id = NEW.account_id)
          AND deleted_at IS NULL 
          AND status = 'completed'
      ), 0),
      updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();
```

---

## SUPABASE CLIENT SETUP

### Configuração Base
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### Auth Context
```typescript
// src/lib/supabase/auth-context.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, 
      signIn, signUp, signInWithGoogle, signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## MATERIAL UI THEME

```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
```

---

## COMPONENTES PRINCIPAIS

### Layout Principal
```typescript
// src/components/layout/MainLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 240;

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header 
        drawerWidth={DRAWER_WIDTH} 
        onMenuClick={() => setMobileOpen(!mobileOpen)} 
      />
      <Sidebar 
        width={DRAWER_WIDTH} 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
```

### Card de Resumo (Dashboard)
```typescript
// src/features/dashboard/components/SummaryCard.tsx
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance';
  percentChange?: number;
}

export function SummaryCard({ title, value, type, percentChange }: SummaryCardProps) {
  const colors = {
    income: 'success.main',
    expense: 'error.main',
    balance: 'primary.main',
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: colors[type], fontWeight: 600 }}>
          {formatCurrency(value)}
        </Typography>
        {percentChange !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {percentChange >= 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {Math.abs(percentChange)}% em relação ao mês anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## SERVICES (Chamadas ao Supabase)

### Transactions Service
```typescript
// src/features/transactions/services/transactions.service.ts
import { supabase } from '@/lib/supabase/client';
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types';

export const transactionsService = {
  async getAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    accountId?: string;
    categoryId?: string;
    type?: 'income' | 'expense' | 'transfer';
  }) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(id, name, color),
        category:categories(id, name, color, icon),
        credit_card:credit_cards(id, name, color)
      `)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate.toISOString());
    }
    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(transaction: TransactionInsert) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TransactionUpdate) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    // Soft delete
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async getMonthlySummary(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .eq('status', 'completed');

    if (error) throw error;

    return data.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += Number(t.amount);
        if (t.type === 'expense') acc.expense += Number(t.amount);
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  },
};
```

---

## HOOKS COM TANSTACK QUERY

```typescript
// src/features/transactions/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type { TransactionInsert, TransactionUpdate } from '@/types';

export function useTransactions(filters?: Parameters<typeof transactionsService.getAll>[0]) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsService.getAll(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionInsert) => transactionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdate }) => 
      transactionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', 'monthly-summary', year, month],
    queryFn: () => transactionsService.getMonthlySummary(year, month),
  });
}
```

---

## VALIDAÇÃO COM ZOD

```typescript
// src/lib/validators/transaction.schema.ts
import { z } from 'zod';

export const transactionSchema = z.object({
  description: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  amount: z
    .number({ required_error: 'Valor é obrigatório' })
    .positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Tipo é obrigatório',
  }),
  date: z.date({ required_error: 'Data é obrigatória' }),
  account_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  credit_card_id: z.string().uuid().optional().nullable(),
  destination_account_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
```

---

## ROTAS

```typescript
// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { AccountsPage } from '@/features/accounts/pages/AccountsPage';
import { CardsPage } from '@/features/cards/pages/CardsPage';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage';
import { RecurringPage } from '@/features/recurring/pages/RecurringPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'callback', element: <AuthCallback /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'cards', element: <CardsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'recurring', element: <RecurringPage /> },
    ],
  },
]);
```

---

## SEGURANÇA

### Checklist
✅ RLS habilitado em todas as tabelas  
✅ Todas as queries isoladas por user_id (via RLS)  
✅ Auth verificado em todas as rotas protegidas  
✅ Zod validation em todos os forms  
✅ Variáveis de ambiente no .env (VITE_*)  
✅ Soft deletes para auditoria  
✅ Rate limiting (Supabase nativo)  

### Protected Route Component
```typescript
// src/components/common/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/lib/supabase/auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## VARIÁVEIS DE AMBIENTE

```bash
# .env.example
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Opcional
VITE_APP_NAME=Minhas Finanças
VITE_APP_URL=http://localhost:5173
```

---

## DEPLOY CHECKLIST

### Supabase Setup
1. Criar projeto no Supabase
2. Executar migrations SQL
3. Habilitar RLS em todas as tabelas
4. Configurar Auth providers (Email, Google)
5. Configurar URL de redirect para OAuth

### Vercel/Netlify Setup
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configurar redirects para SPA:
   ```
   /* /index.html 200
   ```

---

## ROADMAP TÉCNICO

**Fase 1 - MVP (Semana 1-2):**
- [ ] Setup projeto (Vite + MUI + Supabase)
- [ ] Autenticação completa
- [ ] CRUD de Contas
- [ ] CRUD de Categorias
- [ ] CRUD de Transações básico

**Fase 2 - Core Features (Semana 3-4):**
- [ ] Dashboard com resumo
- [ ] Cartões de crédito
- [ ] Filtros e busca
- [ ] Gráficos básicos

**Fase 3 - Avançado (Semana 5-6):**
- [ ] Pagamentos recorrentes
- [ ] Parcelas
- [ ] Relatórios detalhados
- [ ] Export PDF/Excel

**Fase 4 - Polish (Semana 7+):**
- [ ] Dark mode
- [ ] PWA / Mobile
- [ ] Notificações
- [ ] Backup de dados
```

---

## INSTRUÇÕES PARA O CLAUDE

Ao receber este prompt:

1. **Analise os requisitos** e identifique:
   - Todas as entidades necessárias
   - Relacionamentos entre entidades
   - Fluxos de usuário críticos
   - Regras de negócio específicas

2. **Gere o PRD.md** incluindo:
   - Descrição detalhada de cada funcionalidade
   - Campos específicos para cada entidade
   - Fluxos de usuário passo a passo
   - Métricas apropriadas para finanças pessoais

3. **Gere o SPECS.md** incluindo:
   - Schema SQL completo com RLS
   - Types TypeScript correspondentes
   - Services com todas as operações CRUD
   - Hooks com TanStack Query
   - Componentes principais com MUI
   - Validações com Zod

4. **Seja específico:**
   - Use exemplos de código reais e funcionais
   - Inclua tratamento de erros
   - Considere edge cases (valores negativos, datas inválidas, etc)
   - Pense em UX (loading states, mensagens de erro, confirmações)

5. **Mantenha a stack fixa:**
   - SEMPRE use React + Vite + MUI + Supabase
   - NÃO sugira alternativas
   - Adapte a implementação aos requisitos, não a stack

---

## FORMATO DE RESPOSTA

Retorne DOIS arquivos markdown completos:

**Arquivo 1: PRD.md**
[Conteúdo completo seguindo a estrutura]

**Arquivo 2: SPECS.md**
[Conteúdo completo seguindo a estrutura]

---

Agora está pronto para gerar a documentação completa do sistema de finanças pessoais!