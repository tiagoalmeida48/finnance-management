import type { Transaction, TransactionType } from '@/shared/interfaces';

export interface FileData {
    Data: string;
    Descrição: string;
    Valor: string;
    Categoria?: string;
    Parcelas?: string;
    'Data de pagamento'?: string;
    'Conta de pagamento'?: string;
    Notas?: string;
}

export type NormalizedImportTransaction = Omit<Partial<Transaction>, 'type' | 'purchase_date' | 'payment_date'> & {
    type: TransactionType;
    purchase_date?: string;
    payment_date?: string;
};

export interface ImportPreviewRow {
    original: FileData;
    mapped: NormalizedImportTransaction;
    isValid: boolean;
    errors: {
        amount: boolean;
        date: boolean;
        entity: boolean;
        installments: boolean;
    };
}
