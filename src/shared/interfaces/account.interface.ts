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
    deleted_at?: string;
}
