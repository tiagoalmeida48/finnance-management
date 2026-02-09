import type { Transaction } from '../interfaces';

const DISALLOWED_GROUP_FIELDS: Array<keyof Transaction> = [
    'id',
    'payment_date',
    'installment_number',
    'installment_group_id',
    'recurring_group_id',
    'created_at',
    'user_id',
];

export const filterGroupUpdates = (updates: Partial<Transaction>) =>
    Object.fromEntries(
        Object.entries(updates).filter(([key]) => !DISALLOWED_GROUP_FIELDS.includes(key as keyof Transaction))
    ) as Partial<Transaction>;
