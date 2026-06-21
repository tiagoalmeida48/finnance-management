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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-sm text-text-muted">{item.label}</p>
          <p className={`text-xl font-bold mt-1 ${item.className}`}>
            {loading ? '—' : formatCurrency(item.value)}
          </p>
        </Card>
      ))}
    </div>
  );
}
