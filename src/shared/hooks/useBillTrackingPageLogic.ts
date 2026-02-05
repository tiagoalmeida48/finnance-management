import { useState, useMemo } from 'react';
import { format, startOfMonth, addMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from './useTransactions';
import { useCreditCards } from './useCreditCards';

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
                const closingDay = Number(card.closing_day);
                const dueDay = Number(card.due_day);
                const isNextMonthPayment = closingDay >= dueDay;
                const cardTransactions = transactions.filter(t => t.card_id === card.id);

                const billTransactions = cardTransactions.filter(t => {
                    const date = new Date(t.payment_date + 'T12:00:00');
                    const day = date.getDate();
                    let monthShift = isNextMonthPayment ? 1 : 0;
                    if (day > closingDay) monthShift += 1;
                    const statementMonth = addMonths(startOfMonth(date), monthShift);
                    return format(statementMonth, 'yyyy-MM') === monthStr;
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
                    itemType: 'card'
                };
            }).filter(Boolean);

            const allItems = [
                ...fixedExpenses.map(t => ({
                    id: t.id,
                    name: t.description,
                    total: t.amount,
                    isPaid: t.is_paid,
                    itemType: 'fixed'
                })),
                ...cardBills
            ];

            const totalItems = allItems.length;
            const paidItems = allItems.filter(i => i && i.isPaid).length;
            const progress = totalItems > 0 ? (paidItems / totalItems) * 100 : 0;
            const totalAmount = allItems.reduce((sum, item: any) => sum + (Number(item?.total) || 0), 0);

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
