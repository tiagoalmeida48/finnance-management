import { Card } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { TransactionSummary } from '../types/transactions.types';

interface TransactionsSummaryProps {
  summary: TransactionSummary | undefined;
  loading: boolean;
}

export function TransactionsSummary({ summary, loading }: TransactionsSummaryProps) {
  const income = summary?.income ?? 0;
  const expense = summary?.expense ?? 0;
  const balance = income - expense;
  const pending = summary?.pending ?? 0;

  const items = [
    { label: 'Receitas', value: income, className: 'text-income' },
    { label: 'Despesas', value: expense, className: 'text-expense' },
    { label: 'Saldo', value: balance, className: balance >= 0 ? 'text-income' : 'text-expense' },
    { label: 'Pendente', value: pending, className: 'text-text' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {item.label}
          </p>
          {loading ? (
            <div className="mt-1.5 h-6 w-24 animate-pulse rounded bg-surface-2" />
          ) : (
            <p className={`mt-0.5 text-xl font-bold tracking-tight ${item.className}`}>
              {formatCurrency(item.value)}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
