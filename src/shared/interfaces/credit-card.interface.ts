import type { CreditCardStatementCycle } from './credit-card-statement-cycle.interface';

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
    statement_cycles?: CreditCardStatementCycle[];
    current_statement_cycle?: CreditCardStatementCycle | null;
    usage?: number;
    current_invoice?: number;
    available_limit?: number;
}

export type CreateCreditCardInput = Omit<
    CreditCard,
    'id'
    | 'user_id'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'bank_account'
    | 'statement_cycles'
    | 'current_statement_cycle'
    | 'usage'
    | 'current_invoice'
    | 'available_limit'
>;

export type UpdateCreditCardInput = Partial<Omit<CreateCreditCardInput, 'closing_day' | 'due_day'>>;
