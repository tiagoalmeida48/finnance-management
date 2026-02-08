import { Grid, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { colors } from '@/shared/theme';

interface DashboardChartsProps {
    chartData: any[] | undefined;
    categories: any[] | undefined;
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(val);

const formatCompact = (val: number) => {
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
    return `R$ ${val}`;
};

const formatPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

export function DashboardCharts({ chartData, categories }: DashboardChartsProps) {
    const CATEGORY_COLORS = [colors.yellow, colors.purple, colors.green, colors.red, colors.blue];

    const totalCategoryValue = categories?.reduce((sum, cat) => sum + cat.value, 0) || 1;

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const item = payload[0].payload;
        const color = item.fill;
        const percentage = totalCategoryValue > 0 ? (Number(item.value || 0) / totalCategoryValue) * 100 : 0;

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
                        {formatBRL(item.value)}
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
                        {formatPercent(percentage)}
                    </Box>
                </Stack>
            </Box>
        );
    };

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Cash Flow Chart */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography sx={{ fontSize: '16px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600 }}>
                                Fluxo de Caixa
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.green }} />
                                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Receitas</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.red }} />
                                    <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>Despesas</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Box sx={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                                        formatter={(value: any, name: any) => [formatBRL(value ?? 0), name]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="receita"
                                        name="Receitas"
                                        stroke={colors.green}
                                        strokeWidth={2.5}
                                        dot={{ fill: colors.green, r: 3, strokeWidth: 0 }}
                                        activeDot={{ r: 5, stroke: colors.bgPrimary, strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="despesa"
                                        name="Despesas"
                                        stroke={colors.red}
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={{ fill: colors.red, r: 3, strokeWidth: 0 }}
                                        activeDot={{ r: 5, stroke: colors.bgPrimary, strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Categories Donut Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, mb: 2 }}>
                            Categorias
                        </Typography>
                        <Box sx={{ height: 180, width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        cornerRadius={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categories?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} cursor={false} offset={16} wrapperStyle={{ zIndex: 10 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>

                        {/* Category List with Progress Bars */}
                        <Stack spacing={0} sx={{ mt: 1 }}>
                            {categories?.slice(0, 5).map((cat, idx) => {
                                const percentage = (cat.value / totalCategoryValue) * 100;
                                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
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
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{
                                                    width: 60,
                                                    height: 4,
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(255,255,255,0.06)',
                                                    overflow: 'hidden',
                                                }}>
                                                    <Box sx={{
                                                        width: `${percentage}%`,
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
                                                    minWidth: 80,
                                                    textAlign: 'right',
                                                }}>
                                                    {formatBRL(cat.value)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
