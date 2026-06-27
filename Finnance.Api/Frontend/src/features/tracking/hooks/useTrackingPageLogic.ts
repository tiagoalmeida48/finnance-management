import { useMemo, useState } from 'react';
import {
  addMonths,
  eachMonthOfInterval,
  endOfYear,
  format,
  startOfYear,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionTypeId } from '@/config/constants';
import { calculateTrackingSummary } from '../utils/billTracking.utils';
import type { TrackingItem, TrackingItemType } from '../types/tracking.types';
import { useTrackingTransactions } from './useTracking';
import type { TrackingTransaction } from '../services/trackingService';

export function useTrackingPageLogic() {
  const [currentYear, setCurrentYear] = useState(new Date());

  const startDate = format(startOfYear(currentYear), 'yyyy-MM-dd');
  const endDate = format(endOfYear(currentYear), 'yyyy-MM-dd');

  const { data: transactions, isLoading } = useTrackingTransactions(startDate, endDate);

  const months = useMemo(
    () =>
      eachMonthOfInterval({
        start: startOfYear(currentYear),
        end: endOfYear(currentYear),
      }),
    [currentYear],
  );

  const goToPreviousYear = () => setCurrentYear((prev) => addMonths(prev, -12));
  const goToNextYear = () => setCurrentYear((prev) => addMonths(prev, 12));

  const monthlyData = useMemo(() => {
    if (!transactions) return [];

    return months.map((month) => {
      const monthStr = format(month, 'yyyy-MM');
      const items = buildFixedItems(transactions, monthStr);
      const summary = calculateTrackingSummary(items);

      return {
        month,
        monthName: format(month, 'MMMM', { locale: ptBR }),
        items,
        progress: summary.progress,
        totalItems: summary.totalItems,
        paidItems: summary.paidItems,
        totalAmount: summary.totalAmount,
      };
    });
  }, [months, transactions]);

  return {
    currentYear,
    goToPreviousYear,
    goToNextYear,
    isLoading,
    monthlyData,
  };
}

function buildFixedItems(
  transactions: TrackingTransaction[],
  monthStr: string,
): TrackingItem[] {
  return transactions
    .filter(
      (t) =>
        t.fixed &&
        t.paymentDate !== null &&
        format(new Date(`${t.paymentDate.slice(0, 10)}T12:00:00`), 'yyyy-MM') === monthStr &&
        t.transactionType === TransactionTypeId.EXPENSE,
    )
    .map((t) => ({
      id: t.transaction,
      name: t.description,
      total: Number(t.amount) || 0,
      isPaid: t.paid,
      itemType: 'fixed' as TrackingItemType,
      account: t.account ?? null,
    }));
}
