export interface Category {
    id: string;
    user_id: string;
    name: string;
    icon?: string;
    color?: string;
    type: 'income' | 'expense';
    created_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    category_id?: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    status: TransactionStatus;
    is_recurring: boolean;
    recurring_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    destination_account_id?: string;
    created_at: string;
}
