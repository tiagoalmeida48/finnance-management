import type { Transaction } from '../services/transactions.service';

export interface TransactionGroup {
    id: string;
    isGroup: boolean;
    type: 'installment' | 'recurring';
    mainTransaction: Transaction;
    items: Transaction[];
    totalAmount: number;
    paidAmount: number;
    isAllPaid: boolean;
}

export type TransactionSortField = keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method';

export interface TransactionSortConfig {
    field: TransactionSortField;
    direction: 'asc' | 'desc';
}

export interface TransactionSummaries {
    income: number;
    expense: number;
    balance: number;
    pending: number;
}

const toComparable = (value: unknown): number | string => {
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
};

export function getFilteredTransactionsAndSummaries({
    transactions,
    typeFilter,
    searchQuery,
    categoryFilter,
    paymentMethodFilter,
    hideCreditCards,
    sortConfig,
}: {
    transactions: Transaction[];
    typeFilter: string | null;
    searchQuery: string;
    categoryFilter: string;
    paymentMethodFilter: string;
    hideCreditCards: boolean;
    sortConfig: TransactionSortConfig;
}) {
    const filtered = transactions.filter(t => {
        if (typeFilter && t.type !== typeFilter) return false;
        if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
        if (paymentMethodFilter !== 'all' && t.payment_method !== paymentMethodFilter) return false;
        if (hideCreditCards && t.card_id) return false;
        return true;
    });

    const stats = filtered.reduce((acc, t) => {
        const amount = t.amount;
        if (t.type === 'income') {
            acc.income += amount;
        } else if (t.type === 'expense') {
            if (!t.card_id) acc.expense += amount;
        } else if (t.type === 'transfer') {
            acc.expense += amount;
        }
        if (!t.is_paid) acc.pending += amount;
        return acc;
    }, { income: 0, expense: 0, balance: 0, pending: 0 });

    const summaries: TransactionSummaries = { ...stats, balance: stats.income - stats.expense };

    filtered.sort((a, b) => {
        const field = sortConfig.field;
        let valA: number | string = toComparable(a[field as keyof Transaction]);
        let valB: number | string = toComparable(b[field as keyof Transaction]);

        if (field === 'category_id') {
            valA = toComparable(a.category?.name);
            valB = toComparable(b.category?.name);
        }

        if (field === 'is_paid') {
            valA = a.is_paid ? 1 : 0;
            valB = b.is_paid ? 1 : 0;
        }

        if (field === 'payment_method') {
            valA = toComparable(a.payment_method || (a.card_id ? 'credit' : 'account'));
            valB = toComparable(b.payment_method || (b.card_id ? 'credit' : 'account'));
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return { filteredTransactions: filtered, summaries };
}

export function getGroupedTransactions(filteredTransactions: Transaction[]) {
    const groups: (Transaction | TransactionGroup)[] = [];
    const groupMap: Record<string, TransactionGroup> = {};

    filteredTransactions.forEach(t => {
        const groupId = t.installment_group_id || t.recurring_group_id;
        const groupType = t.installment_group_id ? 'installment' : 'recurring';

        if (groupId) {
            if (!groupMap[groupId]) {
                groupMap[groupId] = {
                    id: groupId,
                    isGroup: true,
                    type: groupType,
                    mainTransaction: t,
                    items: [],
                    totalAmount: 0,
                    paidAmount: 0,
                    isAllPaid: true
                };
                groups.push(groupMap[groupId]);
            }
            const group = groupMap[groupId];
            group.items.push(t);
            group.totalAmount += t.amount;
            if (t.is_paid) group.paidAmount += t.amount;
            if (!t.is_paid) group.isAllPaid = false;

            group.items.sort((a, b) => {
                if (groupType === 'installment') return (a.installment_number || 0) - (b.installment_number || 0);
                return new Date(a.payment_date + 'T12:00:00').getTime() - new Date(b.payment_date + 'T12:00:00').getTime();
            });
            group.mainTransaction = group.items[0];
        } else {
            groups.push(t);
        }
    });

    return groups;
}
