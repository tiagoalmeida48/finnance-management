import { Grid, Card, CardContent, Stack, Box, Typography, Skeleton } from '@mui/material';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardSummaryProps {
    stats: {
        totalBalance: number;
        totalLimit: number;
        monthlyIncome: number;
        monthlyExpenses: number;
    } | undefined;
    isLoading: boolean;
}

export function DashboardSummary({ stats, isLoading }: DashboardSummaryProps) {
    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const cards = [
        { title: 'Saldo Total', value: stats?.totalBalance || 0, icon: <Wallet size={22} />, color: '#D4AF37' },
        { title: 'Limite Disponível', value: stats?.totalLimit || 0, icon: <CreditCard size={22} />, color: '#9575CD' },
        { title: 'Receita do Período', value: stats?.monthlyIncome || 0, icon: <ArrowUpRight size={22} />, color: '#4CAF50' },
        { title: 'Despesa do Período', value: stats?.monthlyExpenses || 0, icon: <ArrowDownLeft size={22} />, color: '#EF5350' },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: `${card.color}15`,
                                    color: card.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {card.title}
                                    </Typography>
                                    {isLoading ? (
                                        <Skeleton variant="text" width={120} height={32} />
                                    ) : (
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {formatBRL(card.value)}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

