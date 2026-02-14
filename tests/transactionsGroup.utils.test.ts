import { expect, test } from 'vitest';
import {
    extractDayFromDateLike,
    filterGroupUpdates,
    replaceDateDayPreservingMonth,
} from '../src/shared/services/transactionsGroup.utils';

test('filterGroupUpdates remove campos bloqueados para atualizacao em grupo', () => {
    const updates = {
        id: 'tx-1',
        payment_date: '2026-02-09',
        user_id: 'user-1',
        description: 'Novo nome',
        amount: 123,
        is_paid: true,
        notes: 'ok',
    };

    const filtered = filterGroupUpdates(updates);

    expect('id' in filtered).toBe(false);
    expect('payment_date' in filtered).toBe(false);
    expect('user_id' in filtered).toBe(false);
    expect(filtered.description).toBe('Novo nome');
    expect(filtered.amount).toBe(123);
    expect(filtered.is_paid).toBe(true);
    expect(filtered.notes).toBe('ok');
});

test('extractDayFromDateLike le dia de data simples e datetime', () => {
    expect(extractDayFromDateLike('2026-02-09')).toBe(9);
    expect(extractDayFromDateLike('2026-02-19T23:59:59-03:00')).toBe(19);
    expect(extractDayFromDateLike('data-invalida')).toBeNull();
});

test('replaceDateDayPreservingMonth altera apenas o dia e respeita limite do mes', () => {
    expect(replaceDateDayPreservingMonth('2026-02-09', 25)).toBe('2026-02-25');
    expect(replaceDateDayPreservingMonth('2026-02-09', 31)).toBe('2026-02-28');
    expect(replaceDateDayPreservingMonth('2026-01-09T12:34:56Z', 31)).toBe('2026-01-31');
});
