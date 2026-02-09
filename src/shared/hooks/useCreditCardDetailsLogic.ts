import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfMonth, addMonths, subYears, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCreditCardDetails } from './useCreditCards';
import type {
    CardCategoryPoint,
    CardHistoryChartPoint,
    CardStatement,
    StatementTransaction,
} from '../interfaces/card-details.interface';

export function useCreditCardDetailsLogic() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: card, isLoading } = useCreditCardDetails(id);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAllTime, setIsAllTime] = useState(false);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<CardStatement | null>(null);

    const handlePrevYear = () => setSelectedDate(prev => subYears(prev, 1));
    const handleNextYear = () => setSelectedDate(prev => addYears(prev, 1));

    const handleOpenPayModal = (s: CardStatement) => {
        setSelectedStatement(s);
        setPayModalOpen(true);
    };

    const historyData = useMemo(() => {
        if (!card || !card.transactions) return { statements: [], chartData: [], categoryData: [] };

        const closingDay = Number(card.closing_day);
        const dueDay = Number(card.due_day);
        const isNextMonthPayment = closingDay >= dueDay;

        const cardTransactions = card.transactions.filter((t) => t.card_id === id);

        const allStatementTransactions: StatementTransaction[] = cardTransactions.map((t) => {
            const date = new Date(t.payment_date + 'T12:00:00');
            const day = date.getDate();

            let monthShift = isNextMonthPayment ? 1 : 0;
            if (day > closingDay) {
                monthShift += 1;
            }

            const statementMonth = addMonths(startOfMonth(date), monthShift);
            return {
                ...t,
                statementDate: statementMonth,
                statementMonthKey: format(statementMonth, 'yyyy-MM')
            };
        });

        let filteredTransactions: StatementTransaction[] = allStatementTransactions;

        if (!isAllTime) {
            const selectedYearKey = format(selectedDate, 'yyyy');
            filteredTransactions = allStatementTransactions.filter((t) =>
                t.statementMonthKey.startsWith(`${selectedYearKey}-`)
            );
        }

        // Group by real month key (yyyy-MM) to avoid mixing values across years.
        const groups: Record<string, { date: Date; trans: StatementTransaction[] }> = {};

        filteredTransactions.forEach((t) => {
            const key = t.statementMonthKey;
            if (!groups[key]) groups[key] = { date: t.statementDate, trans: [] };
            groups[key].trans.push(t);
        });

        const statements: CardStatement[] = Object.entries(groups)
            .map(([monthKey, group]) => {
                const total = group.trans.reduce((sum, t) => {
                    return t.type === 'income' ? sum - Number(t.amount) : sum + Number(t.amount);
                }, 0);

                const unpaidTotal = group.trans
                    .filter(t => !t.is_paid)
                    .reduce((sum, t) => {
                        return t.type === 'income' ? sum - Number(t.amount) : sum + Number(t.amount);
                    }, 0);

                return {
                    month: format(group.date, 'MMM/yyyy', { locale: ptBR }),
                    monthKey,
                    total,
                    unpaidTotal,
                    unpaidIds: group.trans.filter(t => !t.is_paid).map(t => t.id),
                    transactions: group.trans,
                    date: group.date
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        const chartData: CardHistoryChartPoint[] = [...statements]
            .reverse()
            .map(s => ({
                name: format(s.date, 'MMM/yy', { locale: ptBR }),
                total: s.total
            }));

        const categoryMap: Record<string, number> = {};
        filteredTransactions.forEach((t) => {
            if (t.type === 'expense') {
                const catName = t.category?.name || 'Sem Categoria';
                categoryMap[catName] = (categoryMap[catName] || 0) + Number(t.amount);
            }
        });

        const categoryData: CardCategoryPoint[] = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { statements, chartData, categoryData };
    }, [card, id, isAllTime, selectedDate]);

    return {
        id, navigate, card, isLoading,
        selectedDate, setSelectedDate,
        isAllTime, setIsAllTime,
        payModalOpen, setPayModalOpen,
        selectedStatement, setSelectedStatement,
        handlePrevYear, handleNextYear,
        handleOpenPayModal, historyData
    };
}
