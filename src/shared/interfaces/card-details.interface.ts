import type { CreditCard } from './credit-card.interface';
import type { Transaction } from './transaction.interface';

export interface CreditCardDetails extends CreditCard {
    transactions: Transaction[];
    usage: number;
    current_invoice: number;
    available_limit: number;
}

export interface StatementTransaction extends Transaction {
    statementDate: Date;
    statementMonthKey: string;
}

export interface CardStatement {
    month: string;
    monthKey: string;
    total: number;
    unpaidTotal: number;
    unpaidIds: string[];
    transactions: StatementTransaction[];
    date: Date;
}

export interface CardHistoryChartPoint {
    name: string;
    total: number;
}

export interface CardCategoryPoint {
    name: string;
    value: number;
    fill?: string;
    percentage?: number;
}
