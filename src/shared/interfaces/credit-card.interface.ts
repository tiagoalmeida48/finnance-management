export interface CreditCard {
    id: string;
    user_id: string;
    name: string;
    credit_limit: number;
    closing_day: number;
    due_day: number;
    bank_account_id: string;
    color: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    bank_account?: {
        name: string;
    };
    usage?: number;
    available_limit?: number;
}
