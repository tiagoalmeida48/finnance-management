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
import { resolveStatementMonth } from '../utils/statementCycle.utils';
import type { TrackingItem, TrackingItemType } from '../types/tracking.types';
import {
  useCardCycles,
  useTrackingCards,
  useTrackingTransactions,
} from './useTracking';
import type { TrackingTransaction } from '../services/trackingService';

const FALLBACK_CYCLE = { closingDay: 1, dueDay: 10 };

export function useTrackingPageLogic() {
  const [currentYear, setCurrentYear] = useState(new Date());

  const startDate = format(addMonths(startOfYear(currentYear), -1), 'yyyy-MM-dd');
  const endDate = format(endOfYear(currentYear), 'yyyy-MM-dd');

  const { data: transactions, isLoading: loadingTx } = useTrackingTransactions(startDate, endDate);
  const { data: cards, isLoading: loadingCards } = useTrackingCards();
  const { cyclesByCard, isLoading: loadingCycles } = useCardCycles(cards);

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
    if (!transactions || !cards) return [];

    return months.map((month) => {
      const monthStr = format(month, 'yyyy-MM');
      const fixedItems = buildFixedItems(transactions, monthStr);
      const cardItems = cards
        .map((card) => {
          const cycles = cyclesByCard.get(card.creditCard) ?? [];
          const cardTransactions = transactions.filter((t) => t.card === card.creditCard);
          const billTransactions = cardTransactions.filter((t) => {
            const resolved = resolveStatementMonth(t, cycles, FALLBACK_CYCLE);
            return resolved?.statementMonthKey === monthStr;
          });

          if (billTransactions.length === 0) return null;

          const total = billTransactions.reduce((sum, t) => {
            const amount = Number(t.amount) || 0;
            return t.transactionType === TransactionTypeId.INCOME ? sum - amount : sum + amount;
          }, 0);

          return {
            id: card.creditCard,
            name: card.name,
            total,
            isPaid: billTransactions.every((t) => t.paid),
            itemType: 'card' as TrackingItemType,
          };
        })
        .filter((item): item is TrackingItem => item !== null);

      const items: TrackingItem[] = [...fixedItems, ...cardItems];
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
  }, [months, transactions, cards, cyclesByCard]);

  return {
    currentYear,
    goToPreviousYear,
    goToNextYear,
    isLoading: loadingTx || loadingCards || loadingCycles,
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
    }));
}
