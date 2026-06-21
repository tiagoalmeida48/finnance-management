import { TransactionTypeId } from '@/config/constants';

type BadgeVariant = 'income' | 'expense' | 'transfer';

export function transactionTypeLabel(transactionType: number): string {
  switch (transactionType) {
    case TransactionTypeId.INCOME:
      return 'Receita';
    case TransactionTypeId.EXPENSE:
      return 'Despesa';
    case TransactionTypeId.TRANSFER:
      return 'Transferência';
    default:
      return 'Outro';
  }
}

export function transactionTypeBadge(transactionType: number): BadgeVariant {
  switch (transactionType) {
    case TransactionTypeId.INCOME:
      return 'income';
    case TransactionTypeId.TRANSFER:
      return 'transfer';
    default:
      return 'expense';
  }
}

export function lookupName<T>(
  items: T[] | undefined,
  idKey: keyof T,
  nameKey: keyof T,
  id: number | null,
): string {
  if (!id || !items) return '—';
  const match = items.find((item) => Number(item[idKey]) === id);
  return match ? String(match[nameKey]) : '—';
}
