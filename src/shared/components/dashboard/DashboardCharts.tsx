import { Grid, Card, CardContent, Typography, Box, useTheme, Stack } from '@mui/material';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Area, AreaChart, Cell } from 'recharts';

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

export function DashboardCharts({ chartData, categories }: DashboardChartsProps) {
    const theme = useTheme();

    const COLORS = ['#D4AF37', '#9575CD', '#4CAF50', '#EF5350', '#42A5F5'];

    const tooltipStyle = {
        backgroundColor: '#1C1C1C',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    };

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Fluxo de Caixa</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF5350" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EF5350" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        tickFormatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                        contentStyle={tooltipStyle}
                                        labelStyle={{ color: '#FFF', fontWeight: 600, marginBottom: 8 }}
                                        itemStyle={{ color: '#FFF', padding: '2px 0' }}
                                        formatter={(value: any, name: any) => [formatBRL(value ?? 0), name ?? '']}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ paddingBottom: '20px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="receita"
                                        name="Receitas"
                                        stroke="#4CAF50"
                                        strokeWidth={3}
                                        fill="url(#colorReceita)"
                                        dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2, fill: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="despesa"
                                        name="Despesas"
                                        stroke="#EF5350"
                                        strokeWidth={3}
                                        fill="url(#colorDespesa)"
                                        dot={{ fill: '#EF5350', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#EF5350', strokeWidth: 2, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Categorias</Typography>
                        <Box sx={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categories?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        labelStyle={{ color: '#FFF' }}
                                        itemStyle={{ color: '#FFF' }}
                                        formatter={(value: any, name: any) => [formatBRL(value ?? 0), name ?? '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {categories?.slice(0, 5).map((cat, idx) => (
                                <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length] }} />
                                        <Typography variant="body2" color="text.secondary">{cat.name}</Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatBRL(cat.value)}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}


