import { useMemo, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Chip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    TextField
} from '@mui/material';
import {
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    CreditCard as CardIcon,
    TrendingUp,
    PieChart as PieIcon,
    Calendar
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useCreditCardDetails } from '../hooks/useCreditCards';
import { PayBillModal } from '../components/PayBillModal';
import { format, startOfMonth, addMonths, subMonths, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#D4AF37', '#91792A', '#E5C14F', '#A6891F', '#5E4D12'];

export function CreditCardDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: card, isLoading } = useCreditCardDetails(id!);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAllTime, setIsAllTime] = useState(true);
    const [isCustom, setIsCustom] = useState(false);
    const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

    const historyData = useMemo(() => {
        if (!card || !card.transactions) return { statements: [], chartData: [], categoryData: [] };

        const closingDay = Number(card.closing_day);
        const dueDay = Number(card.due_day);
        const isNextMonthPayment = closingDay >= dueDay;
        const groups: Record<string, any[]> = {};

        // 1. Group ALL transactions by statement first
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

        // 2. Filter based on calculated statement month
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

        // 3. Create statement groups from filtered transactions
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

        // 4. Chart Data
        const chartData = [...statements]
            .reverse()
            .map(s => ({
                name: s.month.split('/')[0],
                total: s.total
            }));

        // 5. Category Data
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

    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<any>(null);

    const handleOpenPayModal = (s: any) => {
        setSelectedStatement(s);
        setPayModalOpen(true);
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!card) return <Typography>Cartão não encontrado.</Typography>;

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} sx={{ mb: 4, gap: 2 }}>
                    <Button
                        startIcon={<ChevronLeft />}
                        onClick={() => navigate('/cards')}
                        sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}
                    >
                        Voltar para Cartões
                    </Button>

                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                        <ToggleButtonGroup
                            size="small"
                            value={isAllTime ? 'all' : isCustom ? 'custom' : 'monthly'}
                            exclusive
                            onChange={(_, value) => {
                                if (value !== null) {
                                    setIsAllTime(value === 'all');
                                    setIsCustom(value === 'custom');
                                }
                            }}
                            sx={{ borderColor: '#2A2A2A' }}
                        >
                            <ToggleButton value="monthly" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Mensal</ToggleButton>
                            <ToggleButton value="custom" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Personalizado</ToggleButton>
                            <ToggleButton value="all" sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Geral</ToggleButton>
                        </ToggleButtonGroup>

                        {!isCustom ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    p: 0.5,
                                    borderRadius: 2,
                                    border: '1px solid #2A2A2A',
                                    opacity: isAllTime ? 0.5 : 1,
                                    pointerEvents: isAllTime ? 'none' : 'auto',
                                    transition: 'all 0.2s ease',
                                    width: { xs: '100%', sm: 'auto' },
                                    justifyContent: 'center'
                                }}
                            >
                                <IconButton size="small" onClick={handlePrevMonth} sx={{ color: 'text.secondary' }}>
                                    <ChevronLeft size={18} />
                                </IconButton>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center', textTransform: 'capitalize' }}>
                                    {format(selectedDate, 'MMM yyyy', { locale: ptBR })}
                                </Typography>
                                <IconButton size="small" onClick={handleNextMonth} sx={{ color: 'text.secondary' }}>
                                    <ChevronRight size={18} />
                                </IconButton>
                            </Stack>
                        ) : (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <TextField
                                    size="small"
                                    type="date"
                                    value={customStart}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomStart(e.target.value)}
                                    sx={{ width: 140, '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 } }}
                                />
                                <Typography variant="caption" sx={{ opacity: 0.5 }}>até</Typography>
                                <TextField
                                    size="small"
                                    type="date"
                                    value={customEnd}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEnd(e.target.value)}
                                    sx={{ width: 140, '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 } }}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 6 }}>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: card.color || 'primary.main',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}>
                        <CardIcon size={32} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.name}</Typography>
                        <Typography color="text.secondary">
                            Final {card.id.slice(-4)} • Vencimento dia {card.due_day}
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid #2A2A2A', height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp size={20} color="#D4AF37" />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução de Gastos</Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ height: 300, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historyData.chartData}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickFormatter={(value) => `R$ ${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2A2A2A' }}
                                                itemStyle={{ color: '#D4AF37' }}
                                                formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                stroke="#D4AF37"
                                                fillOpacity={1}
                                                fill="url(#colorTotal)"
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid #2A2A2A', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                                    <PieIcon size={20} color="#91792A" />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Categorias</Typography>
                                </Box>
                                <Box sx={{ height: 300, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={historyData.categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {historyData.categoryData.map((_entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={20} /> Histórico de Faturas
                </Typography>

                <Stack spacing={2}>
                    {historyData.statements.map((s) => (
                        <Accordion
                            key={s.month}
                            sx={{
                                bgcolor: 'background.paper',
                                border: '1px solid #2A2A2A',
                                '&:before': { display: 'none' },
                                borderRadius: '1px !important'
                            }}
                        >
                            <AccordionSummary expandIcon={<ChevronDown />}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{s.month}</Typography>
                                        {s.unpaidTotal > 0 ? (
                                            <Chip
                                                label="Aberta"
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', fontWeight: 600 }}
                                            />
                                        ) : (
                                            <Chip
                                                label="Paga"
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.main', fontWeight: 600 }}
                                            />
                                        )}
                                    </Stack>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Typography sx={{ fontWeight: 700, color: s.unpaidTotal > 0 ? 'text.primary' : 'success.main' }}>
                                            {formatCurrency(s.total)}
                                        </Typography>
                                        {s.unpaidTotal > 0 && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPayModal(s);
                                                }}
                                                sx={{
                                                    py: 0.5,
                                                    fontSize: '0.7rem',
                                                    height: 24,
                                                    bgcolor: 'primary.main',
                                                    color: 'background.paper',
                                                    '&:hover': { bgcolor: 'primary.dark' }
                                                }}
                                            >
                                                Pagar Fatura
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Data</TableCell>
                                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Descrição</TableCell>
                                                <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Categoria</TableCell>
                                                <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Valor</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {s.transactions.map((t: any) => (
                                                <TableRow key={t.id}>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM')}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{t.description}</TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.category?.color }} />
                                                            {t.category?.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        fontWeight: 600,
                                                        color: t.type === 'income' ? 'success.main' : 'error.main'
                                                    }}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    {historyData.statements.length === 0 && (
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid #2A2A2A', p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">Nenhuma fatura encontrada para este período.</Typography>
                        </Card>
                    )}
                </Stack>

                {selectedStatement && (
                    <PayBillModal
                        open={payModalOpen}
                        onClose={() => {
                            setPayModalOpen(false);
                            setSelectedStatement(null);
                        }}
                        cardId={card.id}
                        cardName={card.name}
                        statementMonth={selectedStatement.month}
                        transactionIds={selectedStatement.unpaidIds}
                        totalAmount={selectedStatement.unpaidTotal}
                    />
                )}
            </Container>
        </Box>
    );
}
