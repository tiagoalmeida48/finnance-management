export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
    id: string;
    user_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    payment_date: string;
    purchase_date?: string | null;
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
    bank_account?: { name: string };
    to_bank_account?: { name: string };
    category?: { name: string; color: string; icon: string };
    credit_card?: { name: string };
}

export interface CreateTransactionData extends Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'bank_account' | 'to_bank_account' | 'category' | 'credit_card'> {
    installment_amounts?: number[];
    repeat_count?: number;
    is_installment?: boolean;
}
