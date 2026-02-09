import { expect, test } from 'vitest';
import { calculateTrackingSummary } from '../src/shared/hooks/billTracking.utils';

test('calculateTrackingSummary calcula totais, progresso e valor', () => {
    const summary = calculateTrackingSummary([
        { total: 100, isPaid: true },
        { total: 200, isPaid: false },
        { total: 50, isPaid: true },
    ]);

    expect(summary).toEqual({
        totalItems: 3,
        paidItems: 2,
        progress: (2 / 3) * 100,
        totalAmount: 350,
    });
});

test('calculateTrackingSummary trata lista vazia', () => {
    const summary = calculateTrackingSummary([]);

    expect(summary).toEqual({
        totalItems: 0,
        paidItems: 0,
        progress: 0,
        totalAmount: 0,
    });
});
