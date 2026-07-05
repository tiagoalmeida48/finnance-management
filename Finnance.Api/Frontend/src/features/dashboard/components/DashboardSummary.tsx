import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CountUp } from '@/shared/components/ui';
import { cn, formatCurrency } from '@/shared/utils';
import type { DashboardChartPoint, DashboardStats } from '../types/dashboard.types';

interface DashboardSummaryProps {
  stats: DashboardStats | undefined;
  chartData: DashboardChartPoint[] | undefined;
  isLoading: boolean;
}

interface SummaryValueProps {
  value: number;
  isLoading: boolean;
  className: string;
}

function SummaryValue({ value, isLoading, className }: SummaryValueProps) {
  if (isLoading) return <div className="mt-2 h-8 w-32 animate-pulse rounded bg-surface-2" />;
  return (
    <p className={`nums font-semibold ${className}`}>
      <CountUp value={value} format={formatCurrency} />
    </p>
  );
}

function BalanceSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const coords = points.map(
    (value, index) =>
      `${(index / (points.length - 1)) * 100},${26 - ((value - min) / range) * 20}`,
  );
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-11 h-16 w-full"
    >
      <defs>
        <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,28 L${coords.join(' L')} L100,28 Z`} fill="url(#hero-spark)" />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="var(--color-primary)"
        strokeOpacity="0.65"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function DashboardSummary({ stats, chartData, isLoading }: DashboardSummaryProps) {
  const balance = stats?.totalBalance ?? 0;
  const income = stats?.monthlyIncome ?? 0;
  const expenses = stats?.monthlyExpenses ?? 0;
  const availableLimit = stats?.totalAvailableLimit ?? 0;
  const delta = stats?.netFlowDelta ?? 0;
  const hasNetHistory = stats?.hasNetHistory ?? false;
  const avgIncome = stats?.avgMonthlyIncome ?? 0;
  const avgExpenses = stats?.avgMonthlyExpenses ?? 0;

  const cumulative = (chartData ?? [])
    .map((point) => point.cumulativeNet)
    .filter((value): value is number => value !== null);
  const flowTotal = income + expenses || 1;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <Card className="relative overflow-hidden p-5 lg:col-span-2">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/12 blur-2xl" />
        <BalanceSparkline points={cumulative} />
        <div className="relative flex h-full flex-col gap-7">
          <div className="flex items-center justify-between">
            <span className="mono-label text-[11px] text-text-muted">Saldo total</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-bg/40 text-primary">
              <Wallet size={17} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <SummaryValue
              value={balance}
              isLoading={isLoading}
              className="text-[2.9rem] leading-none tracking-tight text-text"
            />
            {!isLoading && hasNetHistory && (
              <p className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={cn(
                    'nums flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                    delta >= 0 ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense',
                  )}
                >
                  {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {formatCurrency(Math.abs(delta))}
                </span>
                <span className="text-text-muted">fluxo vs mês anterior</span>
              </p>
            )}
          </div>
          <div className="hairline-top mt-auto flex items-center justify-between pt-4">
            <span className="mono-label text-[10px] text-text-muted">Limite disponível</span>
            <span className="nums text-sm font-medium text-primary-soft">
              {formatCurrency(availableLimit)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col justify-between gap-6 p-5">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px] text-text-muted">Receitas</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-income/10 text-income">
            <TrendingUp size={17} strokeWidth={1.9} />
          </div>
        </div>
        <div>
          <SummaryValue value={income} isLoading={isLoading} className="text-2xl text-income" />
          <p className="nums mt-2 text-xs text-text-muted">
            média mensal {formatCurrency(avgIncome)}
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-income/80"
              style={{ width: `${(income / flowTotal) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col justify-between gap-6 p-5">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px] text-text-muted">Despesas</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-expense/10 text-expense">
            <TrendingDown size={17} strokeWidth={1.9} />
          </div>
        </div>
        <div>
          <SummaryValue value={expenses} isLoading={isLoading} className="text-2xl text-expense" />
          <p className="nums mt-2 text-xs text-text-muted">
            média mensal {formatCurrency(avgExpenses)}
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-expense/80"
              style={{ width: `${(expenses / flowTotal) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
