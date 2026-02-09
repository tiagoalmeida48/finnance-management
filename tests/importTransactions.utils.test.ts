import { expect, test } from 'vitest';
import { inferImportTransactionType, parseImportAmount, parseImportDate } from '../src/shared/components/transactions/import/importTransactions.utils';

test('parseImportDate converte formato brasileiro para ISO', () => {
    expect(parseImportDate('09/02/2026')).toBe('2026-02-09');
});

test('parseImportDate mantem formato ISO valido', () => {
    expect(parseImportDate('2026-02-09')).toBe('2026-02-09');
});

test('parseImportDate retorna null para formato invalido', () => {
    expect(parseImportDate('2026/02/09')).toBeNull();
});

test('parseImportAmount normaliza separadores brasileiros', () => {
    expect(parseImportAmount('-1.234,56')).toBe(-1234.56);
});

test('inferImportTransactionType define income/expense corretamente', () => {
    expect(inferImportTransactionType(150)).toBe('income');
    expect(inferImportTransactionType(-10)).toBe('expense');
});
