import { Grid, Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Clock } from 'lucide-react';

interface TransactionsSummaryProps {
    summaries: {
        income: number;
        expense: number;
        balance: number;
        pending: number;
    };
    isLoading: boolean;
}

export function TransactionsSummary({ summaries, isLoading }: TransactionsSummaryProps) {
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

    const summaryCards = [
        { title: 'Receitas', value: summaries.income, color: '#2E7D32', icon: <ArrowUpRight size={20} /> },
        { title: 'Despesas', value: summaries.expense, color: '#D32F2F', icon: <ArrowDownLeft size={20} /> },
        { title: 'Saldo', value: summaries.balance, color: summaries.balance >= 0 ? '#2E7D32' : '#D32F2F', icon: <ArrowRightLeft size={20} /> },
        { title: 'Pendente', value: summaries.pending, color: '#E5C158', icon: <Clock size={20} /> },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {summaryCards.map((card, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${card.color}15`, color: card.color, display: 'flex' }}>
                                    {card.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{card.title}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: card.color }}>
                                        {isLoading ? '...' : formatPrice(card.value)}
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
