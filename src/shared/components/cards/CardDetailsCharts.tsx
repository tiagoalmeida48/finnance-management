import { Grid, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface CardDetailsChartsProps {
    chartData: any[];
    categoryData: any[];
}

const COLORS = ['#D4AF37', '#91792A', '#E5C14F', '#A6891F', '#5E4D12'];

export function CardDetailsCharts({ chartData, categoryData }: CardDetailsChartsProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
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
                                <AreaChart data={chartData}>
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
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
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
    );
}
