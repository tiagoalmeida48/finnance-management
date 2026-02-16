import { expect, test } from 'vitest';
import { planCycleInsertion, resolveStatementMonth } from '../src/shared/services/card-statement-cycle.utils';
import type { Transaction } from '../src/shared/interfaces';

type TransactionDateInput = Pick<Transaction, 'purchase_date' | 'payment_date'>;

const baseCycles = [
    {
        id: 'cycle-old',
        date_start: '2024-01-01',
        date_end: '2025-08-31',
        closing_day: 26,
        due_day: 4,
    },
    {
        id: 'cycle-new',
        date_start: '2025-09-01',
        date_end: '9999-12-31',
        closing_day: 2,
        due_day: 10,
    },
];

test('resolveStatementMonth preserva competencia antiga e aplica novo ciclo apos mudanca', () => {
    const oldInput: TransactionDateInput = { purchase_date: '2025-08-20', payment_date: '2025-08-20' };
    const newInput: TransactionDateInput = { purchase_date: '2025-09-05', payment_date: '2025-09-05' };

    const oldTransaction = resolveStatementMonth(
        oldInput,
        baseCycles
    );
    const newTransaction = resolveStatementMonth(
        newInput,
        baseCycles
    );

    expect(oldTransaction?.statementMonthKey).toBe('2025-09');
    expect(newTransaction?.statementMonthKey).toBe('2025-10');
});

test('resolveStatementMonth usa purchase_date com fallback para payment_date', () => {
    const withPurchaseDate: TransactionDateInput = { purchase_date: '2025-07-25', payment_date: '2025-08-10' };
    const withPaymentDateFallback: TransactionDateInput = { purchase_date: null, payment_date: '2025-07-15' };

    const byPurchaseDate = resolveStatementMonth(
        withPurchaseDate,
        baseCycles
    );
    const byPaymentDate = resolveStatementMonth(
        withPaymentDateFallback,
        baseCycles
    );

    expect(byPurchaseDate?.anchorDateKey).toBe('2025-07-25');
    expect(byPurchaseDate?.statementMonthKey).toBe('2025-08');

    expect(byPaymentDate?.anchorDateKey).toBe('2025-07-15');
    expect(byPaymentDate?.statementMonthKey).toBe('2025-08');
});

test('resolveStatementMonth trata fechamento em dia 31 para meses curtos', () => {
    const cycle = [
        {
            id: 'cycle-31',
            date_start: '2025-01-01',
            date_end: '9999-12-31',
            closing_day: 31,
            due_day: 10,
        },
    ];

    const transactionInput: TransactionDateInput = { purchase_date: '2025-02-28', payment_date: '2025-02-28' };

    const result = resolveStatementMonth(
        transactionInput,
        cycle
    );

    expect(result?.statementMonthKey).toBe('2025-03');
});

test('resolveStatementMonth usa dia de fechamento como fronteira do ciclo', () => {
    const cycle = [
        {
            id: 'cycle-5',
            date_start: '2025-01-01',
            date_end: '9999-12-31',
            closing_day: 5,
            due_day: 10,
        },
    ];

    const beforeClosing: TransactionDateInput = { purchase_date: '2025-02-04', payment_date: '2025-02-04' };
    const onClosing: TransactionDateInput = { purchase_date: '2025-02-05', payment_date: '2025-02-05' };
    const afterClosing: TransactionDateInput = { purchase_date: '2025-02-20', payment_date: '2025-02-20' };

    expect(resolveStatementMonth(beforeClosing, cycle)?.statementMonthKey).toBe('2025-02');
    expect(resolveStatementMonth(onClosing, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(afterClosing, cycle)?.statementMonthKey).toBe('2025-03');
});

test('resolveStatementMonth ignora horas e considera apenas a data para fronteiras', () => {
    const cycle = [
        {
            id: 'cycle-5-timestamp',
            date_start: '2025-01-01',
            date_end: '9999-12-31',
            closing_day: 5,
            due_day: 10,
        },
    ];

    const atEndOfDayBeforeClosing: TransactionDateInput = {
        purchase_date: '2025-02-04T23:59:59-03:00',
        payment_date: '2025-02-04T23:59:59-03:00',
    };
    const atStartOfClosingDay: TransactionDateInput = {
        purchase_date: '2025-02-05T00:00:00-03:00',
        payment_date: '2025-02-05T00:00:00-03:00',
    };
    const atEndOfClosingDay: TransactionDateInput = {
        purchase_date: '2025-02-05T23:59:59-03:00',
        payment_date: '2025-02-05T23:59:59-03:00',
    };
    const fallbackPaymentDateTimestamp: TransactionDateInput = {
        purchase_date: null,
        payment_date: '2025-02-04T23:59:59Z',
    };

    expect(resolveStatementMonth(atEndOfDayBeforeClosing, cycle)?.statementMonthKey).toBe('2025-02');
    expect(resolveStatementMonth(atStartOfClosingDay, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(atEndOfClosingDay, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(fallbackPaymentDateTimestamp, cycle)?.statementMonthKey).toBe('2025-02');
});

test('planCycleInsertion divide a vigencia contendo a nova data', () => {
    const plan = planCycleInsertion(
        [
            {
                id: 'cycle-1',
                date_start: '2025-01-01',
                date_end: '9999-12-31',
                closing_day: 26,
                due_day: 4,
            },
        ],
        '2025-09-01'
    );

    expect(plan).toEqual({
        targetCycleId: 'cycle-1',
        targetCycleStart: '2025-01-01',
        targetCycleEnd: '9999-12-31',
        previousCycleNewEnd: '2025-08-31',
        newCycleStart: '2025-09-01',
        newCycleEnd: '9999-12-31',
    });
});

test('planCycleInsertion impede data igual ao inicio do periodo atual', () => {
    expect(() =>
        planCycleInsertion(
            [
                {
                    id: 'cycle-1',
                    date_start: '2025-01-01',
                    date_end: '9999-12-31',
                    closing_day: 26,
                    due_day: 4,
                },
            ],
            '2025-01-01'
        )
    ).toThrowError(/deve ser maior/);
});

test('planCycleInsertion impede datas fora de qualquer vigencia', () => {
    expect(() =>
        planCycleInsertion(
            [
                {
                    id: 'cycle-1',
                    date_start: '2025-01-01',
                    date_end: '2025-03-31',
                    closing_day: 26,
                    due_day: 4,
                },
                {
                    id: 'cycle-2',
                    date_start: '2025-05-01',
                    date_end: '9999-12-31',
                    closing_day: 2,
                    due_day: 10,
                },
            ],
            '2025-04-15'
        )

    ).toThrowError(/Nao existe vigencia/);
});

test('resolveStatementMonth ajusta para o proximo ciclo quando data da transacao excede fechamento do ciclo atual', () => {
    // Cycle 1: Closes day 27. Cycle 2: Starts Sep 01, closes day 10.
    const cycles = [
        {
            id: 'cycle-1',
            date_start: '2025-01-01',
            date_end: '2025-08-31',
            closing_day: 27,
            due_day: 6,
        },
        {
            id: 'cycle-2',
            date_start: '2025-09-01',
            date_end: '9999-12-31',
            closing_day: 10,
            due_day: 16,
        },
    ];

    // Transaction on Aug 29th.
    // Old logic: 29 > 27 -> shift 1 month. Aug -> Sep.
    // BUT due_day 6 means dueMonthShift = 1 (27 >= 6).
    // So total shift = 2. Aug -> Oct (2025-10). WRONG.

    // New logic:
    // 29 > 27 AND next cycle exists.
    // Use next cycle closing/due days: Closing 10, Due 16.
    // 29 > 10 -> Closing Shift = 1.
    // 10 < 16 -> Due Shift = 0.
    // Total Shift = 1. Aug -> Sep (2025-09). CORRECT.

    const transaction: TransactionDateInput = {
        purchase_date: '2025-08-29',
        payment_date: '2025-08-29',
    };

    const resolved = resolveStatementMonth(transaction, cycles);
    expect(resolved?.statementMonthKey).toBe('2025-09');
});
