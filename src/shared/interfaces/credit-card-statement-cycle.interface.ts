export interface CreditCardStatementCycle {
    id: string;
    user_id: string;
    card_id: string;
    date_start: string;
    date_end: string;
    closing_day: number;
    due_day: number;
    notes?: string | null;
    created_at: string;
}

export interface CreateCreditCardStatementCycleInput {
    card_id: string;
    date_start: string;
    closing_day: number;
    due_day: number;
    notes?: string;
}

export interface UpdateCreditCardStatementCycleInput {
    closing_day: number;
    due_day: number;
    notes?: string;
}
