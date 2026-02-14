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

    expect(oldTransaction?.statementMonthKey).toBe('2025-08');
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
    expect(byPurchaseDate?.statementMonthKey).toBe('2025-07');

    expect(byPaymentDate?.anchorDateKey).toBe('2025-07-15');
    expect(byPaymentDate?.statementMonthKey).toBe('2025-07');
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

    expect(result?.statementMonthKey).toBe('2025-02');
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
    const atStartOfClosingDayUTC: TransactionDateInput = {
        purchase_date: '2025-02-05T00:00:00Z',
        payment_date: '2025-02-05T00:00:00Z',
    };
    const fallbackPaymentDateTimestamp: TransactionDateInput = {
        purchase_date: null,
        payment_date: '2025-02-04T23:59:59Z',
    };

    expect(resolveStatementMonth(atEndOfDayBeforeClosing, cycle)?.statementMonthKey).toBe('2025-02');
    expect(resolveStatementMonth(atStartOfClosingDay, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(atEndOfClosingDay, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(atStartOfClosingDayUTC, cycle)?.statementMonthKey).toBe('2025-03');
    expect(resolveStatementMonth(fallbackPaymentDateTimestamp, cycle)?.statementMonthKey).toBe('2025-02');
});

test('resolveStatementMonth usa range explicito de fatura e fallback no fechamento da vigencia quando nao houver range', () => {
    const cycle = [
        {
            id: 'cycle-5-range',
            date_start: '2025-01-01',
            date_end: '9999-12-31',
            closing_day: 5,
            due_day: 10,
        },
    ];

    const statementPeriodRanges = [
        {
            period_start: '2025-01-05',
            period_end: '2025-02-05',
        },
    ];

    const insideConfiguredRange: TransactionDateInput = { purchase_date: '2025-02-05', payment_date: '2025-02-05' };
    const outsideConfiguredRange: TransactionDateInput = { purchase_date: '2025-02-20', payment_date: '2025-02-20' };

    expect(resolveStatementMonth(insideConfiguredRange, cycle, undefined, statementPeriodRanges)?.statementMonthKey).toBe('2025-02');
    expect(resolveStatementMonth(outsideConfiguredRange, cycle, undefined, statementPeriodRanges)?.statementMonthKey).toBe('2025-03');
});

test('resolveStatementMonth usa statement_month_key do range para montar a fatura', () => {
    const cycle = [
        {
            id: 'cycle-jan-key',
            date_start: '2024-01-01',
            date_end: '9999-12-31',
            closing_day: 5,
            due_day: 10,
        },
    ];

    const statementPeriodRanges = [
        {
            period_start: '2024-11-27',
            period_end: '2024-12-27',
            statement_month_key: '2025-01',
        },
    ];

    const transactionInput: TransactionDateInput = {
        purchase_date: '2024-12-10',
        payment_date: '2024-12-10',
    };

    expect(resolveStatementMonth(transactionInput, cycle, undefined, statementPeriodRanges)?.statementMonthKey).toBe('2025-01');
});

test('resolveStatementMonth respeita range explicito e nao reaplica fallback para o mesmo mes', () => {
    const cycle = [
        {
            id: 'cycle-explicit-jan',
            date_start: '2024-01-01',
            date_end: '9999-12-31',
            closing_day: 31,
            due_day: 10,
        },
    ];

    const statementPeriodRanges = [
        {
            period_start: '2024-11-27',
            period_end: '2024-12-27',
            statement_month_key: '2025-01',
        },
    ];

    const transactionOutsideExplicitRangeButFallbackToSameMonth: TransactionDateInput = {
        purchase_date: '2025-01-10',
        payment_date: '2025-01-10',
    };

    expect(resolveStatementMonth(
        transactionOutsideExplicitRangeButFallbackToSameMonth,
        cycle,
        undefined,
        statementPeriodRanges
    )).toBeNull();
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
