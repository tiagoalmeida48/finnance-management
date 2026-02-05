import { Grid, Card, CardContent, Stack, Box, Typography } from '@mui/material';
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
        { title: 'Saldo Total', value: stats?.totalBalance || 0, icon: <Wallet size={20} />, color: '#D4AF37' },
        { title: 'Limite Disponível', value: stats?.totalLimit || 0, icon: <CreditCard size={20} />, color: '#B8860B' },
        { title: 'Receita no Período', value: stats?.monthlyIncome || 0, icon: <ArrowUpRight size={20} />, color: '#2E7D32' },
        { title: 'Despesa no Período', value: stats?.monthlyExpenses || 0, icon: <ArrowDownLeft size={20} />, color: '#D32F2F' },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${card.color}15`, color: card.color, display: 'flex' }}>
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{card.title}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: idx === 0 || idx === 1 ? 'text.primary' : card.color }}>
                                        {isLoading ? '...' : formatBRL(card.value)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
