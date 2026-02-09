import { expect, test } from 'vitest';
import { getFilteredTransactionsAndSummaries, getGroupedTransactions } from '../src/shared/hooks/transactionsPage.utils';
import type { Transaction } from '../src/shared/interfaces/transaction.interface';

const makeTransaction = (overrides: Partial<Transaction>): Transaction => ({
    id: 'tx-1',
    user_id: 'user-1',
    type: 'expense',
    amount: 0,
    description: 'transacao',
    payment_date: '2026-02-10',
    account_id: 'acc-1',
    is_fixed: false,
    is_paid: false,
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-02-10T00:00:00.000Z',
    ...overrides,
});

test('getFilteredTransactionsAndSummaries calcula receitas por transacoes do periodo', () => {
    const transactions: Transaction[] = [
        makeTransaction({
            id: 'income-1',
            type: 'income',
            amount: 1000,
            description: 'Salario',
            is_paid: true,
            category_id: 'cat-income',
        }),
        makeTransaction({
            id: 'expense-1',
            type: 'expense',
            amount: 300,
            description: 'Mercado',
            is_paid: true,
            category_id: 'cat-expense',
        }),
        makeTransaction({
            id: 'card-expense-1',
            type: 'expense',
            amount: 200,
            description: 'Cartao',
            is_paid: false,
            category_id: 'cat-expense',
            card_id: 'card-1',
        }),
    ];

    const { filteredTransactions, summaries } = getFilteredTransactionsAndSummaries({
        transactions,
        typeFilter: null,
        searchQuery: '',
        categoryFilter: 'all',
        paymentMethodFilter: 'all',
        hideCreditCards: false,
        sortConfig: { field: 'payment_date', direction: 'asc' },
    });

    expect(filteredTransactions).toHaveLength(3);
    expect(summaries).toEqual({
        income: 1000,
        expense: 300,
        balance: 700,
        pending: 200,
    });
});

test('getFilteredTransactionsAndSummaries retorna income zero sem transacoes de receita', () => {
    const transactions: Transaction[] = [
        makeTransaction({
            id: 'expense-1',
            type: 'expense',
            amount: 150,
            description: 'Mercado',
            is_paid: true,
        }),
        makeTransaction({
            id: 'transfer-1',
            type: 'transfer',
            amount: 50,
            description: 'Transferencia',
            is_paid: true,
        }),
    ];

    const { summaries } = getFilteredTransactionsAndSummaries({
        transactions,
        typeFilter: null,
        searchQuery: '',
        categoryFilter: 'all',
        paymentMethodFilter: 'all',
        hideCreditCards: false,
        sortConfig: { field: 'payment_date', direction: 'asc' },
    });

    expect(summaries.income).toBe(0);
    expect(summaries.expense).toBe(200);
    expect(summaries.balance).toBe(-200);
});

test('getFilteredTransactionsAndSummaries respeita filtro por tipo e mantém income zero em despesas', () => {
    const transactions: Transaction[] = [
        makeTransaction({
            id: 'income-1',
            type: 'income',
            amount: 1000,
            is_paid: true,
        }),
        makeTransaction({
            id: 'expense-1',
            type: 'expense',
            amount: 300,
            is_paid: true,
        }),
        makeTransaction({
            id: 'card-expense-1',
            type: 'expense',
            amount: 200,
            is_paid: false,
            card_id: 'card-1',
        }),
    ];

    const { summaries } = getFilteredTransactionsAndSummaries({
        transactions,
        typeFilter: 'expense',
        searchQuery: '',
        categoryFilter: 'all',
        paymentMethodFilter: 'all',
        hideCreditCards: false,
        sortConfig: { field: 'payment_date', direction: 'asc' },
    });

    expect(summaries).toEqual({
        income: 0,
        expense: 300,
        balance: -300,
        pending: 200,
    });
});

test('getGroupedTransactions agrupa recorrencias e ordena parcelas', () => {
    const grouped = getGroupedTransactions([
        makeTransaction({
            id: 'installment-2',
            description: 'Parcela 2',
            installment_group_id: 'group-1',
            installment_number: 2,
            amount: 120,
            is_paid: false,
        }),
        makeTransaction({
            id: 'installment-1',
            description: 'Parcela 1',
            installment_group_id: 'group-1',
            installment_number: 1,
            amount: 120,
            is_paid: true,
        }),
        makeTransaction({
            id: 'single-1',
            description: 'Avulsa',
            amount: 50,
            is_paid: true,
        }),
    ]);

    expect(grouped).toHaveLength(2);
    const first = grouped[0];
    if (!('isGroup' in first) || !first.isGroup) {
        throw new Error('expected grouped transaction in first position');
    }

    expect(first.items).toHaveLength(2);
    expect(first.mainTransaction.id).toBe('installment-1');
    expect(first.totalAmount).toBe(240);
    expect(first.paidAmount).toBe(120);
    expect(first.isAllPaid).toBe(false);
});
