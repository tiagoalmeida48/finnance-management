import { expect, test } from 'vitest';
import {
    inferImportTransactionType,
    normalizeInstallmentDescriptionForGrouping,
    parseImportAmount,
    parseImportDate,
    parseImportInstallments,
} from '../src/shared/components/transactions/import/importTransactions.utils';

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

test('parseImportAmount aceita decimal com ponto', () => {
    expect(parseImportAmount('5000.25')).toBe(5000.25);
});

test('inferImportTransactionType define income/expense corretamente', () => {
    expect(inferImportTransactionType(150)).toBe('income');
    expect(inferImportTransactionType(-10)).toBe('expense');
});

test('parseImportInstallments expande numero simples', () => {
    expect(parseImportInstallments('4')).toEqual({
        numbers: [1, 2, 3, 4],
        totalInstallments: 4,
    });
});

test('parseImportInstallments expande numero simples em sequencia completa', () => {
    expect(parseImportInstallments('10')).toEqual({
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        totalInstallments: 10,
    });
});

test('parseImportInstallments expande intervalo', () => {
    expect(parseImportInstallments('8-10')).toEqual({
        numbers: [8, 9, 10],
        totalInstallments: 10,
    });
});

test('parseImportInstallments expande intervalo parcial preservando total', () => {
    expect(parseImportInstallments('2-5')).toEqual({
        numbers: [2, 3, 4, 5],
        totalInstallments: 5,
    });
});

test('parseImportInstallments retorna null para valor invalido', () => {
    expect(parseImportInstallments('3-1')).toBeNull();
    expect(parseImportInstallments('abc')).toBeNull();
});

test('normalizeInstallmentDescriptionForGrouping remove sufixo de parcela', () => {
    expect(normalizeInstallmentDescriptionForGrouping('Curso XP - Parcela 10/12')).toBe('curso xp');
    expect(normalizeInstallmentDescriptionForGrouping('Curso XP (10/12)')).toBe('curso xp');
    expect(normalizeInstallmentDescriptionForGrouping('Curso XP 10/12')).toBe('curso xp');
});
