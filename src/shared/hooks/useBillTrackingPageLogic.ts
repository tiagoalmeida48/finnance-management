import { useState, useMemo } from 'react';
import { addMonths, format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from './useTransactions';
import { useCreditCards } from './useCreditCards';
import { calculateTrackingSummary } from './billTracking.utils';
import { resolveStatementMonth } from '../services/card-statement-cycle.utils';

interface TrackingItem {
    id: string;
    name: string;
    total: number;
    isPaid: boolean;
    itemType: 'card' | 'fixed';
}

type CardTrackingItem = Omit<TrackingItem, 'itemType'> & { itemType: 'card' };

export function useBillTrackingPageLogic() {
    const [currentYear, setCurrentYear] = useState(new Date());

    const { data: transactions, isLoading: loadingTx } = useTransactions({
        start_date: format(addMonths(startOfYear(currentYear), -1), 'yyyy-MM-dd'),
        end_date: format(endOfYear(currentYear), 'yyyy-MM-dd')
    });

    const { data: cards, isLoading: loadingCards } = useCreditCards();

    const months = useMemo(() => {
        return eachMonthOfInterval({
            start: startOfYear(currentYear),
            end: endOfYear(currentYear)
        });
    }, [currentYear]);

    const monthlyData = useMemo(() => {
        if (!transactions || !cards) return [];

        return months.map(month => {
            const monthStr = format(month, 'yyyy-MM');

            const fixedExpenses = transactions.filter(t =>
                t.is_fixed &&
                format(new Date(t.payment_date + 'T12:00:00'), 'yyyy-MM') === monthStr &&
                t.type === 'expense'
            );

            const cardBills = cards.map(card => {
                const statementCycles = card.statement_cycles ?? [];
                const statementPeriodRanges = card.statement_period_ranges ?? [];
                const fallbackCycle = {
                    closing_day: card.current_statement_cycle?.closing_day ?? card.closing_day,
                    due_day: card.current_statement_cycle?.due_day ?? card.due_day,
                };
                const cardTransactions = transactions.filter(t => t.card_id === card.id);

                const billTransactions = cardTransactions.filter(t => {
                    const resolved = resolveStatementMonth(t, statementCycles, fallbackCycle, statementPeriodRanges);
                    return resolved?.statementMonthKey === monthStr;
                });

                if (billTransactions.length === 0) return null;

                const total = billTransactions.reduce((sum, t) => {
                    const amount = Number(t.amount) || 0;
                    return t.type === 'income' ? sum - amount : sum + amount;
                }, 0);

                const isPaid = billTransactions.every(t => t.is_paid);

                return {
                    id: card.id,
                    name: card.name,
                    total,
                    isPaid,
                    itemType: 'card' as const
                };
            }).filter((item): item is CardTrackingItem => item !== null);

            const allItems: TrackingItem[] = [
                ...fixedExpenses.map(t => ({
                    id: t.id,
                    name: t.description,
                    total: t.amount,
                    isPaid: t.is_paid,
                    itemType: 'fixed' as const
                })),
                ...cardBills
            ];

            const { totalItems, paidItems, progress, totalAmount } = calculateTrackingSummary(allItems);

            return {
                month,
                monthName: format(month, 'MMMM', { locale: ptBR }),
                items: allItems,
                progress,
                totalItems,
                paidItems,
                totalAmount
            };
        });
    }, [months, transactions, cards]);

    return {
        currentYear, setCurrentYear,
        loadingTx, loadingCards,
        monthlyData
    };
}
