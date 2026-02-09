import { expect, test } from 'vitest';
import { filterGroupUpdates } from '../src/shared/services/transactionsGroup.utils';

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
