import { useState, useMemo, ChangeEvent } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Stack,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
    TextField
} from '@mui/material';
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
    Cell
} from 'recharts';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    ChevronRight,
    Target,
    ShoppingBag,
    Coffee,
    Home,
    Car,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#D4AF37', '#91792A', '#E5C14F', '#A6891F', '#5E4D12'];

const CATEGORY_ICONS: Record<string, any> = {
    'Alimentação': <Coffee size={14} />,
    'Transporte': <Car size={14} />,
    'Moradia': <Home size={14} />,
    'Lazer': <Target size={14} />,
    'Compras': <ShoppingBag size={14} />,
    'Outros': <AlertCircle size={14} />
};

export function DashboardPage() {
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAllTime, setIsAllTime] = useState(true);
    const [isCustom, setIsCustom] = useState(false);
    const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const dateFilter = useMemo(() => {
        if (isAllTime) return undefined;
        if (isCustom) return { start: customStart, end: customEnd };
        return selectedDate;
    }, [isAllTime, isCustom, selectedDate, customStart, customEnd]);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats', isAllTime ? 'all' : isCustom ? `custom-${customStart}-${customEnd}` : selectedDate.toISOString()],
        queryFn: () => dashboardService.getStats(dateFilter),
    });

    const { data: chartData, isLoading: chartLoading } = useQuery({
        queryKey: ['dashboard-chart', isAllTime ? 'all' : isCustom ? `custom-${customStart}-${customEnd}` : selectedDate.toISOString()],
        queryFn: () => dashboardService.getChartData(dateFilter),
    });

    const { data: pieData, isLoading: pieLoading } = useQuery({
        queryKey: ['dashboard-pie', isAllTime ? 'all' : isCustom ? `custom-${customStart}-${customEnd}` : selectedDate.toISOString()],
        queryFn: () => dashboardService.getCategoryDistribution(dateFilter),
    });

    const isLoading = statsLoading || chartLoading || pieLoading;

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const balance = (stats?.monthlyIncome || 0) - (stats?.monthlyExpenses || 0);

    const summaryItems = [
        {
            title: isAllTime ? 'Balanço Total' : 'Saldo do Período',
            value: formatCurrency(balance),
            icon: <Wallet size={20} color={balance >= 0 ? '#2E7D32' : '#D32F2F'} />,
            color: balance >= 0 ? '#2E7D32' : '#D32F2F'
        },
        {
            title: isAllTime ? 'Receita Total' : 'Receita Mensal',
            value: formatCurrency(stats?.monthlyIncome || 0),
            icon: <TrendingUp size={20} color="#2E7D32" />,
            color: '#2E7D32'
        },
        {
            title: isAllTime ? 'Despesas Totais' : 'Despesa Mensal',
            value: formatCurrency(stats?.monthlyExpenses || 0),
            icon: <TrendingDown size={20} color="#D32F2F" />,
            color: '#D32F2F'
        },
    ];

    return (
        <Box sx={{ pt: 4, pb: 4 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 4, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isAllTime
                                ? 'Análise consolidada (Todo o período)'
                                : `Análise financeira de ${format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}`
                            }
                        </Typography>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={2}>
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
                                    transition: 'all 0.2s ease'
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
                                    sx={{
                                        width: 140,
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 }
                                    }}
                                />
                                <Typography variant="caption" sx={{ opacity: 0.5 }}>até</Typography>
                                <TextField
                                    size="small"
                                    type="date"
                                    value={customEnd}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEnd(e.target.value)}
                                    sx={{
                                        width: 140,
                                        '& .MuiInputBase-root': { fontSize: '0.8rem', height: 38 }
                                    }}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {summaryItems.map((item, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                            <Card sx={{ bgcolor: theme.palette.background.paper, border: '1px solid #2A2A2A', borderRadius: 1 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Box sx={{
                                            p: 1.25,
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {item.icon}
                                        </Box>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{item.title}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: item.color }}>
                                        {isLoading ? <CircularProgress size={20} /> : item.value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={3}>
                    {/* Main Chart */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper, border: '1px solid #2A2A2A' }}>
                            <CardContent sx={{ height: '100%', p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp size={20} color="#D4AF37" />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Fluxo de Caixa</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2.5}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2E7D32' }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Receita</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D32F2F' }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Despesa</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Box sx={{ width: '100%', height: 350, minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData || []}>
                                            <defs>
                                                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                                tickFormatter={(val: any) => `R$${val}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2A2A2A', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                                formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="receita"
                                                stroke="#2E7D32"
                                                fillOpacity={1}
                                                fill="url(#colorRec)"
                                                strokeWidth={3}
                                                name="Receita"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="despesa"
                                                stroke="#D32F2F"
                                                fillOpacity={1}
                                                fill="url(#colorDesp)"
                                                strokeWidth={3}
                                                name="Despesa"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Categories Chart */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper, border: '1px solid #2A2A2A' }}>
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1 }}>
                                        <TrendingDown size={18} color="#D4AF37" />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Gastos por Categoria</Typography>
                                </Box>

                                <Box sx={{ width: '100%', height: 200, mb: 3, flexShrink: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData || []}
                                                innerRadius={60}
                                                outerRadius={75}
                                                paddingAngle={8}
                                                dataKey="value"
                                                strokeWidth={0}
                                                cornerRadius={4}
                                            >
                                                {(pieData || []).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2A2A2A', borderRadius: '4px' }}
                                                itemStyle={{ color: '#D4AF37', fontSize: '12px' }}
                                                formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>

                                <Box sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    pr: 1,
                                    maxHeight: 250,
                                    '&::-webkit-scrollbar': { width: 4 },
                                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }
                                }}>
                                    <Stack spacing={1.5}>
                                        {(pieData || []).map((item, idx) => (
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" key={idx}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'rgba(255,255,255,0.02)',
                                                        color: COLORS[idx % COLORS.length],
                                                        border: `1px solid ${COLORS[idx % COLORS.length]}22`
                                                    }}>
                                                        {CATEGORY_ICONS[item.name] || <AlertCircle size={14} />}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>{item.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {((item.value / (pieData?.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(0)}%
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    {formatCurrency(item.value)}
                                                </Typography>
                                            </Stack>
                                        ))}
                                        {(!pieData || pieData.length === 0) && (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Nenhuma despesa este mês</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    );
}
