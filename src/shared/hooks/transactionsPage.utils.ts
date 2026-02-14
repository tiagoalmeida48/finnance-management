import type { Transaction } from '../services/transactions.service';

export interface TransactionGroup {
    id: string;
    isGroup: boolean;
    type: 'installment' | 'recurring';
    mainTransaction: Transaction;
    items: Transaction[];
    totalAmount: number;
    paidAmount: number;
    paidItemsCount: number;
    totalItemsCount: number;
    paidItemsPercent: number;
    isAllPaid: boolean;
    categoryName?: string;
    categoryColor?: string;
}

export type TransactionSortField = keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method' | 'installment_progress';

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
    showPendingOnly,
    typeFilter,
    searchQuery,
    categoryFilter,
    paymentMethodFilter,
    accountFilter,
    cardFilter,
    hideCreditCards,
    showOnlyCardPurchases,
    showInstallmentsOnly,
    sortConfig,
}: {
    transactions: Transaction[];
    showPendingOnly: boolean;
    typeFilter: string | null;
    searchQuery: string;
    categoryFilter: string;
    paymentMethodFilter: string;
    accountFilter: string;
    cardFilter: string;
    hideCreditCards: boolean;
    showOnlyCardPurchases: boolean;
    showInstallmentsOnly: boolean;
    sortConfig: TransactionSortConfig;
}) {
    const filtered = transactions.filter(t => {
        if (showPendingOnly && t.is_paid) return false;
        if (typeFilter && t.type !== typeFilter) return false;
        if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
        if (paymentMethodFilter !== 'all' && t.payment_method !== paymentMethodFilter) return false;
        if (accountFilter !== 'all' && t.account_id !== accountFilter) return false;
        if (cardFilter !== 'all' && t.card_id !== cardFilter) return false;
        if (hideCreditCards && t.card_id) return false;
        if (showOnlyCardPurchases && !t.card_id) return false;
        if (showInstallmentsOnly && !t.installment_group_id) return false;
        return true;
    });

    const stats = filtered.reduce((acc, t) => {
        const amount = t.amount;
        if (t.type === 'income') {
            acc.income += amount;
        } else if (t.type === 'expense') {
            if (showOnlyCardPurchases || !t.card_id) acc.expense += amount;
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
        if (field === 'installment_progress') {
            const getProgress = (transaction: Transaction) => {
                if (!transaction.installment_group_id) return -1;
                const total = transaction.total_installments || 0;
                const current = transaction.installment_number || 0;
                if (total <= 0) return 0;
                return current / total;
            };
            valA = getProgress(a);
            valB = getProgress(b);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return { filteredTransactions: filtered, summaries };
}

export function getGroupedTransactions(filteredTransactions: Transaction[], sortConfig?: TransactionSortConfig) {
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
                    paidItemsCount: 0,
                    totalItemsCount: 0,
                    paidItemsPercent: 0,
                    isAllPaid: true,
                    categoryName: undefined,
                    categoryColor: undefined,
                };
                groups.push(groupMap[groupId]);
            }
            const group = groupMap[groupId];
            group.items.push(t);
            group.totalAmount += t.amount;
            if (t.is_paid) group.paidAmount += t.amount;
            if (!t.is_paid) group.isAllPaid = false;
            if (t.is_paid) group.paidItemsCount += 1;
            group.totalItemsCount = t.total_installments || group.items.length;
            group.paidItemsPercent = group.totalItemsCount > 0
                ? Math.round((group.paidItemsCount / group.totalItemsCount) * 100)
                : 0;

            group.items.sort((a, b) => {
                if (groupType === 'installment') return (a.installment_number || 0) - (b.installment_number || 0);
                return new Date(a.payment_date + 'T12:00:00').getTime() - new Date(b.payment_date + 'T12:00:00').getTime();
            });
            group.mainTransaction = group.items[0];
            const categoryCount = new Map<string, { count: number, name: string, color?: string }>();
            for (const item of group.items) {
                const name = item.category?.name;
                if (!name) continue;
                const existing = categoryCount.get(name);
                if (existing) {
                    existing.count += 1;
                } else {
                    categoryCount.set(name, {
                        count: 1,
                        name,
                        color: item.category?.color ?? undefined,
                    });
                }
            }

            const mostFrequentCategory = Array.from(categoryCount.values())
                .sort((a, b) => b.count - a.count)[0];

            group.categoryName = mostFrequentCategory?.name;
            group.categoryColor = mostFrequentCategory?.color;
        } else {
            groups.push(t);
        }
    });

    if (sortConfig?.field === 'installment_progress') {
        groups.sort((a, b) => {
            const progressA = 'isGroup' in a && a.isGroup ? a.paidItemsPercent : -1;
            const progressB = 'isGroup' in b && b.isGroup ? b.paidItemsPercent : -1;
            if (progressA < progressB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (progressA > progressB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return groups;
}
