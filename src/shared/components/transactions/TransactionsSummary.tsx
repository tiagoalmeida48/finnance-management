import { Grid, Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown, ArrowRightLeft, Clock } from 'lucide-react';
import { colors } from '@/shared/theme';

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
    const formatBRL = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const summaryCards = [
        {
            title: 'Receitas',
            value: summaries.income,
            icon: TrendingUp,
            color: colors.green,
            bgColor: colors.greenBg,
        },
        {
            title: 'Despesas',
            value: summaries.expense,
            icon: TrendingDown,
            color: colors.red,
            bgColor: colors.redBg,
        },
        {
            title: 'Saldo',
            value: summaries.balance,
            icon: ArrowRightLeft,
            color: summaries.balance >= 0 ? colors.purple : colors.red,
            bgColor: summaries.balance >= 0 ? colors.purpleBg : colors.redBg,
        },
        {
            title: 'Pendente',
            value: summaries.pending,
            icon: Clock,
            color: colors.yellow,
            bgColor: colors.yellowBg,
        },
    ];

    return (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {summaryCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
                        <Card sx={{
                            bgcolor: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '14px',
                            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'default',
                            '&:hover': {
                                bgcolor: colors.bgCardHover,
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            },
                        }}>
                            <CardContent sx={{ p: '18px 20px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '8px',
                                        bgcolor: card.bgColor,
                                        color: card.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={18} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{
                                            fontSize: '12px',
                                            fontFamily: '"DM Sans"',
                                            fontWeight: 500,
                                            color: colors.textMuted,
                                            mb: 0.5,
                                        }}>
                                            {card.title}
                                        </Typography>
                                        {isLoading ? (
                                            <Skeleton
                                                variant="text"
                                                width="80%"
                                                height={28}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                                            />
                                        ) : (
                                            <Typography sx={{
                                                fontSize: '20px',
                                                fontFamily: '"Plus Jakarta Sans"',
                                                fontWeight: 700,
                                                color: card.color,
                                                letterSpacing: '-0.02em',
                                                lineHeight: 1.2,
                                            }}>
                                                {formatBRL(card.value)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}

