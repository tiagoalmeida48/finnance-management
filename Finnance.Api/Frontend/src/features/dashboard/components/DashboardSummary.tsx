import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { DashboardStats } from '../types/dashboard.types';

interface DashboardSummaryProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function DashboardSummary({ stats, isLoading }: DashboardSummaryProps) {
  const cards = [
    {
      title: 'Saldo total',
      value: stats?.totalBalance ?? 0,
      icon: Wallet,
      iconClass: 'bg-primary/15 text-primary',
      valueClass: 'text-text',
    },
    {
      title: 'Receitas',
      value: stats?.monthlyIncome ?? 0,
      icon: TrendingUp,
      iconClass: 'bg-income/15 text-income',
      valueClass: 'text-income',
    },
    {
      title: 'Despesas',
      value: stats?.monthlyExpenses ?? 0,
      icon: TrendingDown,
      iconClass: 'bg-expense/15 text-expense',
      valueClass: 'text-expense',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {card.title}
              </p>
              {isLoading ? (
                <div className="mt-1.5 h-7 w-28 animate-pulse rounded bg-surface-2" />
              ) : (
                <p className={`mt-0.5 text-2xl font-bold tracking-tight ${card.valueClass}`}>
                  {formatCurrency(card.value)}
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
