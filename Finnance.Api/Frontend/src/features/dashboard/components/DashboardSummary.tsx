import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui';
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
          <Card key={card.title} className="p-4 sm:p-5">
            <CardContent className="flex flex-col gap-3 sm:gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconClass}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-text-muted sm:text-sm">{card.title}</p>
                {isLoading ? (
                  <div className="h-7 w-28 animate-pulse rounded bg-surface-2" />
                ) : (
                  <p className={`text-lg font-bold tracking-tight sm:text-2xl ${card.valueClass}`}>
                    {formatCurrency(card.value)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
