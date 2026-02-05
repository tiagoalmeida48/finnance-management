import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfMonth, addMonths, subMonths, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCreditCardDetails } from './useCreditCards';

export function useCreditCardDetailsLogic() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: card, isLoading } = useCreditCardDetails(id!);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAllTime, setIsAllTime] = useState(true);
    const [isCustom, setIsCustom] = useState(false);
    const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<any>(null);

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

    const handleOpenPayModal = (s: any) => {
        setSelectedStatement(s);
        setPayModalOpen(true);
    };

    const historyData = useMemo(() => {
        if (!card || !card.transactions) return { statements: [], chartData: [], categoryData: [] };

        const closingDay = Number(card.closing_day);
        const dueDay = Number(card.due_day);
        const isNextMonthPayment = closingDay >= dueDay;
        const groups: Record<string, any[]> = {};

        const cardTransactions = card.transactions.filter((t: any) => t.card_id === id);

        const allStatementTransactions = cardTransactions.map((t: any) => {
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

        let filteredTransactions = allStatementTransactions;

        if (!isAllTime) {
            if (isCustom) {
                const rangeStartKey = format(new Date(customStart + 'T12:00:00'), 'yyyy-MM');
                const rangeEndKey = format(new Date(customEnd + 'T12:00:00'), 'yyyy-MM');
                filteredTransactions = allStatementTransactions.filter((t: any) =>
                    t.statementMonthKey >= rangeStartKey && t.statementMonthKey <= rangeEndKey
                );
            } else {
                const selectedKey = format(selectedDate, 'yyyy-MM');
                filteredTransactions = allStatementTransactions.filter((t: any) =>
                    t.statementMonthKey === selectedKey
                );
            }
        }

        filteredTransactions.forEach((t: any) => {
            const key = format(t.statementDate, 'MMM/yyyy', { locale: ptBR });
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });

        const statements = Object.entries(groups)
            .map(([month, trans]) => {
                const total = trans.reduce((sum, t) => {
                    return t.type === 'income' ? sum - Number(t.amount) : sum + Number(t.amount);
                }, 0);

                const unpaidTotal = trans
                    .filter(t => !t.is_paid)
                    .reduce((sum, t) => {
                        return t.type === 'income' ? sum - Number(t.amount) : sum + Number(t.amount);
                    }, 0);

                return {
                    month,
                    total,
                    unpaidTotal,
                    unpaidIds: trans.filter(t => !t.is_paid).map(t => t.id),
                    transactions: trans,
                    date: trans[0].statementDate
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        const chartData = [...statements]
            .reverse()
            .map(s => ({
                name: s.month.split('/')[0],
                total: s.total
            }));

        const categoryMap: Record<string, number> = {};
        filteredTransactions.forEach((t: any) => {
            if (t.type === 'expense') {
                const catName = t.category?.name || 'Sem Categoria';
                categoryMap[catName] = (categoryMap[catName] || 0) + Number(t.amount);
            }
        });

        const categoryData = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { statements, chartData, categoryData };
    }, [card, id, isAllTime, isCustom, selectedDate, customStart, customEnd]);

    return {
        id, navigate, card, isLoading,
        selectedDate, setSelectedDate,
        isAllTime, setIsAllTime,
        isCustom, setIsCustom,
        customStart, setCustomStart,
        customEnd, setCustomEnd,
        payModalOpen, setPayModalOpen,
        selectedStatement, setSelectedStatement,
        handlePrevMonth, handleNextMonth,
        handleOpenPayModal, historyData
    };
}
