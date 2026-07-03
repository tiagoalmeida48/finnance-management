import { Card, CountUp } from '@/shared/components/ui';
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
    { label: 'Pendente', value: pending, className: 'text-primary-soft' },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-2 gap-px bg-border/60 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-surface px-5 py-4">
            <p className="mono-label text-[10px] text-text-muted">{item.label}</p>
            {loading ? (
              <div className="mt-2 h-7 w-24 animate-pulse rounded bg-surface-2" />
            ) : (
              <p className={`nums mt-1 text-[1.4rem] font-semibold leading-tight ${item.className}`}>
                <CountUp value={item.value} format={formatCurrency} />
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
