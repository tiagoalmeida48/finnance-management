import { useMemo, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    LinearProgress,
    Chip,
    IconButton,
    CircularProgress,
    Tooltip,
    Divider
} from '@mui/material';
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { format, startOfMonth, addMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useCreditCards } from '../../cards/hooks/useCreditCards';

export function BillTrackingPage() {
    const [currentYear, setCurrentYear] = useState(new Date());

    // Fetch transactions for the current year + 1 month buffer (previous December)
    // This is crucial because purchases in late December may belong to the January bill
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

            // 1. Fixed Expenses for this month
            // We consider the payment month
            const fixedExpenses = transactions.filter(t =>
                t.is_fixed &&
                format(new Date(t.payment_date + 'T12:00:00'), 'yyyy-MM') === monthStr &&
                t.type === 'expense'
            );

            // 2. Credit Card Bills
            // A purchase belongs to a bill based on the card's closing day
            const cardBills = cards.map(card => {
                const closingDay = Number(card.closing_day);
                const dueDay = Number(card.due_day);
                const isNextMonthPayment = closingDay >= dueDay;

                const cardTransactions = transactions.filter(t => t.card_id === card.id);

                // Group transactions by the bill they belong to
                // Logic same as CreditCardDetailsPage
                const billTransactions = cardTransactions.filter(t => {
                    const date = new Date(t.payment_date + 'T12:00:00');
                    const day = date.getDate();

                    // Calculate which bill this transaction belongs to (identified by payment month)
                    // If purchase is after closing, it goes to the NEXT bill
                    // If the card closes and pays in different months (closing >= due), we add an extra month shift
                    let monthShift = isNextMonthPayment ? 1 : 0;
                    if (day > closingDay) {
                        monthShift += 1;
                    }

                    const statementMonth = addMonths(startOfMonth(date), monthShift);
                    return format(statementMonth, 'yyyy-MM') === monthStr;
                });

                if (billTransactions.length === 0) return null;

                const total = billTransactions.reduce((sum, t) => {
                    const amount = Number(t.amount) || 0;
                    // Usually credit card total is just expenses, 
                    // but we handle income (refunds/adjustments) as subtractions
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

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (loadingTx || loadingCards) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', display: 'flex' }}>
                                <CalendarCheck size={24} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>Tracking de Contas</Typography>
                        </Stack>
                        <Typography color="text.secondary">Acompanhamento mensal de despesas fixas e faturas.</Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <IconButton onClick={() => setCurrentYear(prev => addMonths(prev, -12))}>
                            <ChevronLeft size={20} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 700, minWidth: 60, textAlign: 'center' }}>
                            {format(currentYear, 'yyyy')}
                        </Typography>
                        <IconButton onClick={() => setCurrentYear(prev => addMonths(prev, 12))}>
                            <ChevronRight size={20} />
                        </IconButton>
                    </Stack>
                </Stack>

                <Grid container spacing={3}>
                    {monthlyData.map((data, idx) => (
                        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card sx={{
                                height: '100%',
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: data.progress === 100 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255,255,255,0.05)',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="baseline">
                                            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1.1rem' }}>
                                                {data.monthName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: data.progress === 100 ? 'success.main' : 'primary.main' }}>
                                                {formatCurrency(data.totalAmount)}
                                            </Typography>
                                        </Stack>
                                        {data.totalItems > 0 && data.progress === 100 && (
                                            <Chip
                                                label="Quitado"
                                                size="small"
                                                color="success"
                                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                                            />
                                        )}
                                    </Stack>

                                    <Box sx={{ mb: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {data.paidItems} de {data.totalItems} pagos
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: data.progress === 100 ? 'success.main' : 'primary.main' }}>
                                                {Math.round(data.progress)}%
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={data.progress}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: data.progress === 100 ? 'success.main' : 'primary.main'
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Stack spacing={1.5}>
                                        {data.totalItems === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
                                                Sem obrigações este mês
                                            </Typography>
                                        ) : (
                                            data.items.map((item: any, iidx: number) => (
                                                <Box key={iidx}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: '65%' }}>
                                                            {item.itemType === 'card' ? (
                                                                <CreditCard size={14} style={{ opacity: 0.5 }} />
                                                            ) : (
                                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
                                                            )}
                                                            <Typography variant="body2" noWrap sx={{
                                                                fontWeight: 500,
                                                                color: item.isPaid ? 'text.secondary' : 'text.primary',
                                                                textDecoration: item.isPaid ? 'line-through' : 'none'
                                                            }}>
                                                                {item.name}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                {formatCurrency(item.total)}
                                                            </Typography>
                                                            {item.isPaid ? (
                                                                <CheckCircle2 size={16} color="#2E7D32" />
                                                            ) : (
                                                                <Tooltip title="Pendente">
                                                                    <Clock size={16} color="#D4AF37" style={{ opacity: 0.6 }} />
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                    {iidx < data.items.length - 1 && (
                                                        <Divider sx={{ mt: 1, borderColor: 'rgba(255,255,255,0.03)' }} />
                                                    )}
                                                </Box>
                                            ))
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
