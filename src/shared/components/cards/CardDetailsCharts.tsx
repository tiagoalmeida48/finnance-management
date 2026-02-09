import { Box, Typography, Stack, Card, CardContent } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { colors } from '@/shared/theme';
import type { CardCategoryPoint, CardHistoryChartPoint } from '../../interfaces/card-details.interface';

interface CardDetailsChartsProps {
    chartData: CardHistoryChartPoint[];
    categoryData: CardCategoryPoint[];
}

const CATEGORY_COLORS = [colors.yellow, colors.purple, colors.green, colors.red, colors.blue];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatCompact = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value}`;
};

const formatPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: CardCategoryPoint }>;
}

const CustomPieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;
    const color = item.fill || colors.accent;

    return (
        <Box sx={{
            minWidth: 170,
            bgcolor: 'rgba(20, 20, 30, 0.96)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 14px 34px rgba(0, 0, 0, 0.5)',
            p: '10px 12px',
        }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.6 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                <Typography sx={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 600 }}>
                    {item.name}
                </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: colors.textPrimary }}>
                    {formatCurrency(item.value)}
                </Typography>
                <Box sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)',
                }}>
                    {formatPercent(item.percentage || 0)}
                </Box>
            </Stack>
        </Box>
    );
};

export function CardDetailsCharts({ chartData, categoryData }: CardDetailsChartsProps) {
    const average = chartData.length > 0
        ? chartData.reduce((sum, d) => sum + (d.total || 0), 0) / chartData.length
        : 0;

    const totalCategoryValue = categoryData.reduce((sum, d) => sum + (d.value || 0), 0);

    const chartCategories = categoryData.map((cat, idx) => ({
        ...cat,
        fill: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        percentage: totalCategoryValue > 0 ? (cat.value / totalCategoryValue) * 100 : 0,
    }));

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 4 }}>
            {/* Area Chart - Evolution */}
            <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600 }}>
                            Evolução de Gastos
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.accent }} />
                            <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Total</Typography>
                        </Stack>
                    </Stack>
                    <Box sx={{ height: { xs: 240, md: 320, lg: 360 }, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors.accent} stopOpacity={0.25} />
                                        <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: colors.border }}
                                    tickLine={false}
                                    tick={{ fill: colors.textMuted, fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: colors.textMuted, fontSize: 11 }}
                                    tickFormatter={formatCompact}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                    contentStyle={{
                                        backgroundColor: '#1E1E2A',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                                        padding: '12px 16px',
                                    }}
                                    labelStyle={{ color: colors.textSecondary, fontSize: '12px', marginBottom: 8 }}
                                    formatter={(value: number | string | undefined) => [formatCurrency(Number(value) || 0), 'Total' as const]}
                                />
                                {average > 0 && (
                                    <ReferenceLine
                                        y={average}
                                        stroke={colors.textMuted}
                                        strokeDasharray="5 5"
                                        label={{ value: 'Média', fill: colors.textMuted, fontSize: 10, position: 'right' }}
                                    />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke={colors.accent}
                                    strokeWidth={2.5}
                                    fill="url(#gradientTotal)"
                                    dot={{ fill: colors.accent, r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, stroke: colors.bgPrimary, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Donut Chart - Modernized */}
            <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '16px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, mb: 2 }}>
                        Categorias
                    </Typography>

                    <Box sx={{ height: 210, width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={88}
                                    paddingAngle={4}
                                    cornerRadius={8}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} cursor={false} offset={16} wrapperStyle={{ zIndex: 10 }} />
                            </PieChart>
                        </ResponsiveContainer>

                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: 1,
                            }}
                        >
                            <Stack spacing={0.2} alignItems="center">
                                <Typography sx={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Total
                                </Typography>
                                <Typography sx={{ fontSize: '18px', fontWeight: 700, fontFamily: '"Plus Jakarta Sans"', color: colors.textPrimary }}>
                                    {formatCurrency(totalCategoryValue || 0)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Category List with Progress + Percentage */}
                    <Stack spacing={0} sx={{ mt: 1 }}>
                        {chartCategories.slice(0, 5).map((cat, idx) => {
                            const color = cat.fill;
                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        py: 1.5,
                                        borderBottom: idx < 4 ? `1px solid ${colors.border}` : 'none',
                                        transition: 'padding-left 200ms ease',
                                        '&:hover': { pl: 0.5 },
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '3px',
                                                bgcolor: color
                                            }} />
                                            <Typography sx={{ fontSize: '13.5px', color: colors.textSecondary }}>
                                                {cat.name}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color }}>
                                                {formatPercent(cat.percentage || 0)}
                                            </Typography>
                                            <Box sx={{
                                                width: 60,
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.06)',
                                                overflow: 'hidden',
                                            }}>
                                                <Box sx={{
                                                    width: `${cat.percentage || 0}%`,
                                                    height: '100%',
                                                    bgcolor: color,
                                                    transition: 'width 1s ease',
                                                    transitionDelay: `${idx * 100}ms`,
                                                }} />
                                            </Box>
                                            <Typography sx={{
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                fontFamily: '"Plus Jakarta Sans"',
                                                color: color,
                                                minWidth: 90,
                                                textAlign: 'right',
                                            }}>
                                                {formatCurrency(cat.value)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}



