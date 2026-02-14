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

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const pad = (value: number) => value.toString().padStart(2, '0');

interface DateParts {
    year: number;
    month: number;
    day: number;
}

const parseDateParts = (value?: string | null): DateParts | null => {
    if (!value) return null;
    const match = value.match(DATE_KEY_PATTERN);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
    if (month < 1 || month > 12) return null;

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) return null;

    return { year, month, day };
};

export const extractDayFromDateLike = (value?: string | null) => {
    const parts = parseDateParts(value);
    return parts?.day ?? null;
};

export const replaceDateDayPreservingMonth = (
    value: string | null | undefined,
    targetDay: number,
) => {
    const parts = parseDateParts(value);
    if (!parts) return null;
    if (!Number.isInteger(targetDay) || targetDay < 1 || targetDay > 31) return null;

    const maxDay = new Date(parts.year, parts.month, 0).getDate();
    const clampedDay = Math.min(targetDay, maxDay);

    return `${parts.year}-${pad(parts.month)}-${pad(clampedDay)}`;
};
