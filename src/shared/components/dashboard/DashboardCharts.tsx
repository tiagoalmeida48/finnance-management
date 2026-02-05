import { Grid, Card, CardContent, Typography, Box, useTheme, Stack } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardChartsProps {
    chartData: any[] | undefined;
    categories: any[] | undefined;
}

export function DashboardCharts({ chartData, categories }: DashboardChartsProps) {
    const theme = useTheme();

    const COLORS = ['#D4AF37', '#B8860B', '#FACC15', '#E5C158', '#9A7D0A'];

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Fluxo de Caixa</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
                                        tickFormatter={(val) => `R$ ${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            border: '1px solid #2A2A2A',
                                            borderRadius: '8px',
                                            color: '#FFF'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ paddingBottom: '20px' }}
                                    />
                                    <Bar
                                        dataKey="receita"
                                        name="Receitas"
                                        fill="#2E7D32"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                    <Bar
                                        dataKey="despesa"
                                        name="Despesas"
                                        fill="#D32F2F"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Distribuição por Categoria</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categories?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            border: '1px solid #2A2A2A',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ mt: -2, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Total em Despesas</Typography>
                            </Box>
                        </Box>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {categories?.slice(0, 5).map((cat, idx) => (
                                <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length] }} />
                                        <Typography variant="caption" color="text.secondary">{cat.name}</Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.value)}
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
