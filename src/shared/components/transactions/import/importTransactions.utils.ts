import type { TransactionType } from '@/shared/interfaces';

export const parseImportDate = (dateStr: string) => {
    if (!dateStr) return null;
    const normalizedDate = dateStr.trim();
    if (!normalizedDate) return null;

    const brFormat = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brFormat) {
        const [, day, month, year] = brFormat;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const isoFormat = normalizedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoFormat) return normalizedDate;

    return null;
};

export const parseImportAmount = (value: string) => {
    const normalizedValue = value.trim();
    const cleanedValue = normalizedValue.includes(',')
        ? normalizedValue.replace(/\./g, '').replace(',', '.')
        : normalizedValue;
    return parseFloat(cleanedValue);
};

export const inferImportTransactionType = (amount: number): TransactionType =>
    amount >= 0 ? 'income' : 'expense';

export interface InstallmentParseResult {
    numbers: number[];
    totalInstallments: number;
}

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeInstallmentDescriptionForGrouping = (description: string) => {
    const normalized = collapseWhitespace(description || '');
    if (!normalized) return '';

    return collapseWhitespace(
        normalized
            // remove "(10/12)"
            .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/gi, '')
            // remove "Parcela 10/12" with optional dash/colon before
            .replace(/[-:–—]?\s*parcela\s*\d+\s*\/\s*\d+/gi, '')
            // remove trailing/standalone "10/12"
            .replace(/\b\d+\s*\/\s*\d+\b/gi, '')
            .replace(/[-:–—]\s*$/g, ''),
    ).toLowerCase();
};

export const parseImportInstallments = (value?: string): InstallmentParseResult | null => {
    const normalized = (value || '').trim();

    if (!normalized) {
        return {
            numbers: [1],
            totalInstallments: 1,
        };
    }

    if (/^\d+$/.test(normalized)) {
        const total = Number(normalized);
        if (total < 1) return null;

        return {
            numbers: Array.from({ length: total }, (_, index) => index + 1),
            totalInstallments: total,
        };
    }

    const range = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!range) return null;

    const start = Number(range[1]);
    const end = Number(range[2]);

    if (start < 1 || end < start) return null;

    return {
        numbers: Array.from({ length: end - start + 1 }, (_, index) => start + index),
        totalInstallments: end,
    };
};
