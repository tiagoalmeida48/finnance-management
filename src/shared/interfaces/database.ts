export type AccountType = 'checking' | 'savings' | 'investment' | 'wallet' | 'other';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    initial_balance: number;
    current_balance: number;
    color: string;
    icon: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
    id: string;
    user_id: string;
    type: CategoryType;
    name: string;
    color: string;
    icon: string;
    is_active: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreditCard {
    id: string;
    user_id: string;
    bank_account_id: string;
    name: string;
    color: string;
    credit_limit: number;
    closing_day: number;
    due_day: number;
    is_active: boolean;
    deleted_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
// The database supports both English and Portuguese types, but we'll use English in the UI logic.

export interface Transaction {
    id: string;
    user_id: string;
    type: TransactionType;
    amount: number;
    payment_date?: string | null;
    purchase_date?: string | null;
    description: string;
    account_id?: string | null;
    to_account_id?: string | null;
    card_id?: string | null;
    category_id?: string | null;
    is_fixed: boolean;
    is_paid: boolean;
    installment_group_id?: string | null;
    installment_number?: number | null;
    total_installments?: number | null;
    recurring_group_id?: string | null;
    notes?: string | null;
    payment_method?: string | null;
    created_at: string;
    updated_at: string;

    // Relations (loaded by Supabase)
    bank_account?: { name: string };
    to_bank_account?: { name: string };
    category?: { name: string, color: string, icon: string };
    credit_card?: { name: string };
}
