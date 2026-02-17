import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, subYears, addYears } from 'date-fns';
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
        if (!card) return { statements: [], chartData: [], categoryData: [] };

        const invoices = card.invoices ?? [];
        const cardTransactions = card.transactions ?? [];

        const transactionsByInvoice = new Map<string, StatementTransaction[]>();
        for (const t of cardTransactions) {
            if (!t.invoice_id) continue;
            const existing = transactionsByInvoice.get(t.invoice_id) ?? [];
            existing.push({
                ...t,
                statementDate: new Date(`${(invoices.find(inv => inv.id === t.invoice_id)?.month_key ?? format(new Date(), 'yyyy-MM'))}-01T12:00:00`),
                statementMonthKey: invoices.find(inv => inv.id === t.invoice_id)?.month_key ?? '',
            });
            transactionsByInvoice.set(t.invoice_id, existing);
        }

        let filteredInvoices = invoices;
        if (!isAllTime) {
            const selectedYearKey = format(selectedDate, 'yyyy');
            filteredInvoices = invoices.filter(inv => inv.month_key.startsWith(`${selectedYearKey}-`));
        }

        const statements: CardStatement[] = filteredInvoices

            .map(inv => {
                const statementDate = new Date(`${inv.month_key}-01T12:00:00`);
                const invoiceTransactions = transactionsByInvoice.get(inv.id) ?? [];

                return {
                    month: format(statementDate, 'MMM/yyyy', { locale: ptBR }),
                    monthKey: inv.month_key,
                    total: Number(inv.total_amount),
                    unpaidTotal: Number(inv.total_amount) - Number(inv.paid_amount),
                    unpaidIds: invoiceTransactions.filter(t => !t.is_paid).map(t => t.id),
                    transactions: invoiceTransactions,
                    date: statementDate,
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        const chartData: CardHistoryChartPoint[] = [...statements]
            .reverse()
            .map(s => ({
                name: format(s.date, 'MMM/yy', { locale: ptBR }),
                total: s.total,
            }));

        const categoryMap: Record<string, number> = {};
        for (const statement of statements) {
            for (const t of statement.transactions) {
                if (t.type === 'expense') {
                    const catName = t.category?.name || 'Sem Categoria';
                    categoryMap[catName] = (categoryMap[catName] || 0) + Number(t.amount);
                }
            }
        }

        const categoryData: CardCategoryPoint[] = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { statements, chartData, categoryData };
    }, [card, isAllTime, selectedDate]);

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
