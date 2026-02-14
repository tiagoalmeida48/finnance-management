export interface CreditCardStatementPeriodRange {
    id: string;
    user_id: string;
    card_id: string;
    period_start: string;
    period_end: string;
    statement_month_key: string;
    statement_name: string;
    notes?: string | null;
    created_at: string;
}

export interface CreateCreditCardStatementPeriodRangeInput {
    card_id: string;
    period_start: string;
    period_end: string;
    statement_month_key: string;
    statement_name: string;
    notes?: string;
}
