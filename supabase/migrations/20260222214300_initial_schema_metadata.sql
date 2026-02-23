-- Arquivo consolidado a partir da extração de metadados das tabelas via MCP.
-- ATENÇÃO: Esta migração contém APENAS a estrutura base do banco de dados 
-- (Tabelas, Tipos e Referências/Constraints). Não inclui Políticas RLS nativas, 
-- Triggers customizados nem Stored Procedures/RPCs.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. perfis e branding (não possuem FK para outras tabelas próprias, só auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid primary key references auth.users(id),
    full_name text,
    avatar_url text,
    currency text default 'BRL'::text,
    locale text default 'pt-BR'::text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_admin boolean default false
);

CREATE TABLE IF NOT EXISTS public.site_branding (
    id integer primary key check(id = 1),
    site_title text default 'FINNANCE'::text,
    logo_image text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 2. configurações salariais
CREATE TABLE IF NOT EXISTS public.settings_salary (
    user_id uuid references auth.users(id),
    date_start date,
    date_end date default '9999-12-31'::date,
    hourly_rate numeric check (hourly_rate >= 0::numeric),
    base_salary numeric check (base_salary >= 0::numeric),
    inss_discount_percentage numeric check (inss_discount_percentage >= 0::numeric AND inss_discount_percentage <= 100::numeric),
    admin_fee_percentage numeric check (admin_fee_percentage >= 0::numeric AND admin_fee_percentage <= 100::numeric),
    PRIMARY KEY (user_id, date_start, date_end)
);

-- 3. contas bancárias e categorias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    name character varying,
    type character varying default 'checking'::character varying,
    initial_balance numeric default 0,
    current_balance numeric default 0,
    color character varying default '#8b5cf6'::character varying,
    icon character varying default 'wallet'::character varying,
    notes text,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    type text check (type = ANY (ARRAY['income'::text, 'expense'::text])),
    name text,
    color text,
    icon text,
    is_active boolean default true,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 4. cartões de crédito (depende de conta bancária)
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    bank_account_id uuid references public.bank_accounts(id),
    name text,
    color text,
    credit_limit numeric default 0,
    closing_day integer check (closing_day >= 1 AND closing_day <= 31),
    due_day integer check (due_day >= 1 AND due_day <= 31),
    is_active boolean default true,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    notes text
);

-- 5. faturas e ciclos de faturamento (depende de cartão)
CREATE TABLE IF NOT EXISTS public.credit_card_invoices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    card_id uuid references public.credit_cards(id),
    month_key text,
    closing_date date,
    due_date date,
    total_amount numeric default 0,
    paid_amount numeric default 0,
    status text default 'open'::text check (status = ANY (ARRAY['open'::text, 'closed'::text, 'paid'::text, 'partial'::text])),
    closed_at timestamp with time zone,
    paid_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.credit_card_statement_cycles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    card_id uuid references public.credit_cards(id),
    date_start date,
    date_end date default '9999-12-31'::date,
    closing_day smallint,
    due_day smallint,
    notes text,
    created_at timestamp with time zone default now()
);

-- 6. Adicionado: Estrutura da nova tabela local vista anteriormente em 20260211_add_credit_card_statement_period_ranges.sql
CREATE TABLE IF NOT EXISTS public.credit_card_statement_period_ranges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.credit_cards(id) on delete cascade,
    period_start date not null,
    period_end date not null,
    statement_month_key text not null,
    statement_name text not null,
    notes text,
    created_at timestamptz not null default now(),
    constraint credit_card_statement_period_ranges_valid_dates check (period_start <= period_end)
);

-- 7. transações (depende de diversas tabelas formatadas acima)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    type text check (type = ANY (ARRAY['receita'::text, 'despesa'::text, 'income'::text, 'expense'::text, 'transfer'::text])),
    amount numeric check (amount > 0::numeric),
    payment_date date,
    description text,
    account_id uuid references public.bank_accounts(id),
    to_account_id uuid references public.bank_accounts(id),
    card_id uuid references public.credit_cards(id),
    category_id uuid references public.categories(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_fixed boolean default false,
    notes text,
    payment_method text,
    purchase_date date,
    installment_group_id uuid,
    installment_number integer,
    total_installments integer,
    recurring_group_id uuid default gen_random_uuid(),
    is_paid boolean,
    invoice_id uuid references public.credit_card_invoices(id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_salary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_statement_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_card_statement_period_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Policies para site_branding
CREATE POLICY "site_branding_read_public" ON public.site_branding FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "site_branding_insert_admin" ON public.site_branding FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "site_branding_update_admin" ON public.site_branding FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Policies padronizadas para outras tabelas (onde user_id = auth.uid())
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'settings_salary', 'bank_accounts', 'categories', 
            'credit_cards', 'credit_card_invoices', 'credit_card_statement_cycles', 
            'credit_card_statement_period_ranges', 'transactions'
        ])
    LOOP
        EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING (user_id = auth.uid());', table_name, table_name);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (user_id = auth.uid());', table_name, table_name);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());', table_name, table_name);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING (user_id = auth.uid());', table_name, table_name);
    END LOOP;
END $$;

