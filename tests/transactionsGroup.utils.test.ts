import { expect, test } from 'vitest';
import {
    buildInstallmentDescription,
    filterGroupUpdates,
    replaceDateDayPreservingMonth,
    shiftDateByMonths,
    stripInstallmentSuffix,
    toDateKeyIgnoringTime,
} from '../src/shared/services/transactionsGroup.utils';

test('stripInstallmentSuffix remove sufixo de parcela no fim da descricao', () => {
    expect(stripInstallmentSuffix('Supermercado (03/12)')).toBe('Supermercado');
    expect(stripInstallmentSuffix('  Streaming   ( 1 / 6 )  ')).toBe('Streaming');
});

test('buildInstallmentDescription formata numero atual e total com 2 digitos', () => {
    expect(buildInstallmentDescription('Notebook', 2, 10)).toBe('Notebook (02/10)');
});

test('shiftDateByMonths preserva dia quando possivel e faz clamp em meses curtos', () => {
    expect(shiftDateByMonths('2025-01-31', 1)).toBe('2025-02-28');
    expect(shiftDateByMonths('2025-03-15', 2)).toBe('2025-05-15');
});

test('replaceDateDayPreservingMonth altera so o dia e respeita limite do mes', () => {
    expect(replaceDateDayPreservingMonth('2025-04-10', 25)).toBe('2025-04-25');
    expect(replaceDateDayPreservingMonth('2025-02-10', 31)).toBe('2025-02-28');
});

test('toDateKeyIgnoringTime extrai apenas a parte yyyy-MM-dd', () => {
    expect(toDateKeyIgnoringTime('2025-09-03T23:59:59-03:00')).toBe('2025-09-03');
});

test('filterGroupUpdates remove campos proibidos para atualizacao em grupo', () => {
    const result = filterGroupUpdates({
        id: 'transaction-id',
        installment_group_id: 'group-id',
        description: 'Nova descricao',
        amount: 100,
        payment_date: '2025-10-15',
    });

    expect(result).toEqual({
        description: 'Nova descricao',
        amount: 100,
        payment_date: '2025-10-15',
    });
});
