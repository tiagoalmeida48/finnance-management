import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { DashboardStats } from '../types/dashboard.types';

interface DashboardSummaryProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

interface SummaryValueProps {
  value: number;
  isLoading: boolean;
  className: string;
}

function SummaryValue({ value, isLoading, className }: SummaryValueProps) {
  if (isLoading) return <div className="mt-2 h-8 w-32 animate-pulse rounded bg-surface-2" />;
  return <p className={`nums font-semibold ${className}`}>{formatCurrency(value)}</p>;
}

export function DashboardSummary({ stats, isLoading }: DashboardSummaryProps) {
  const balance = stats?.totalBalance ?? 0;
  const income = stats?.monthlyIncome ?? 0;
  const expenses = stats?.monthlyExpenses ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <Card className="relative overflow-hidden lg:col-span-2">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/12 blur-2xl" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px] text-text-muted">Saldo total</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-bg/40 text-primary">
              <Wallet size={17} strokeWidth={1.75} />
            </div>
          </div>
          <SummaryValue
            value={balance}
            isLoading={isLoading}
            className="text-[2.6rem] leading-none text-text"
          />
        </div>
      </Card>

      <Card className="flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px] text-text-muted">Receitas</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-income/10 text-income">
            <TrendingUp size={17} strokeWidth={1.9} />
          </div>
        </div>
        <SummaryValue value={income} isLoading={isLoading} className="text-2xl text-income" />
      </Card>

      <Card className="flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px] text-text-muted">Despesas</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-expense/10 text-expense">
            <TrendingDown size={17} strokeWidth={1.9} />
          </div>
        </div>
        <SummaryValue value={expenses} isLoading={isLoading} className="text-2xl text-expense" />
      </Card>
    </div>
  );
}
