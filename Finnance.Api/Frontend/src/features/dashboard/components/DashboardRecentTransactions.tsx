import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui';
import { TransactionTypeId } from '@/config/constants';
import { formatCurrency } from '@/shared/utils';
import type { RecentTransaction } from '../types/recentTransaction.types';

interface DashboardRecentTransactionsProps {
  transactions: RecentTransaction[] | undefined;
  isLoading: boolean;
}

function getTypeConfig(type: number) {
  switch (type) {
    case TransactionTypeId.INCOME:
      return { icon: TrendingUp, iconClass: 'bg-income/15 text-income', textClass: 'text-income', prefix: '+' };
    case TransactionTypeId.EXPENSE:
      return { icon: TrendingDown, iconClass: 'bg-expense/15 text-expense', textClass: 'text-expense', prefix: '-' };
    default:
      return { icon: ArrowRightLeft, iconClass: 'bg-transfer/15 text-transfer', textClass: 'text-transfer', prefix: '' };
  }
}

function formatPaymentDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function DashboardRecentTransactions({
  transactions,
  isLoading,
}: DashboardRecentTransactionsProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-4">
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">Transações recentes</h3>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-primary"
          >
            Ver todas
            <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 py-2 ${index < 4 ? 'border-b border-border' : ''}`}
              >
                <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-2" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/5 animate-pulse rounded bg-surface-2" />
                  <div className="h-4 w-2/5 animate-pulse rounded bg-surface-2" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <p className="py-6 text-center text-sm text-text-muted">Nenhuma transação recente.</p>
        ) : (
          <div>
            {transactions.slice(0, 6).map((transaction, index) => {
              const config = getTypeConfig(transaction.transactionType);
              const Icon = config.icon;
              return (
                <div
                  key={transaction.transaction}
                  className={`flex items-center gap-2 py-2 transition-colors hover:bg-surface-2/40 ${index < 5 ? 'border-b border-border' : ''}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconClass}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {transaction.description}
                    </p>
                    <p className="nums text-[11px] text-text-muted">
                      {formatPaymentDate(transaction.paymentDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`nums text-sm font-semibold ${config.textClass}`}>
                      {config.prefix}
                      {formatCurrency(transaction.amount ?? 0)}
                    </p>
                    {!transaction.paid && (
                      <p className="mono-label text-[9px] text-primary">Pendente</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
