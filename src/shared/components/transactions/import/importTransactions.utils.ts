import type { TransactionType } from '@/shared/interfaces';

export const parseImportDate = (dateStr: string) => {
    if (!dateStr) return null;

    const brFormat = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brFormat) {
        const [, day, month, year] = brFormat;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const isoFormat = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoFormat) return dateStr;

    return null;
};

export const parseImportAmount = (value: string) => {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(cleanedValue);
};

export const inferImportTransactionType = (amount: number): TransactionType =>
    amount >= 0 ? 'income' : 'expense';
