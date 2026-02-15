export type InvoiceStatus = 'open' | 'partial' | 'paid' | 'overdue';

export interface CreditCardInvoice {
    id: string;
    user_id: string;
    card_id: string;
    month_key: string;
    closing_date: string;
    due_date: string;
    total_amount: number;
    paid_amount: number;
    status: InvoiceStatus;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
}
