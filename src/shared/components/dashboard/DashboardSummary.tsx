import { Grid, Card, CardContent, Stack, Box, Typography, Skeleton, keyframes } from '@mui/material';
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { colors } from '@/shared/theme';

interface DashboardSummaryProps {
    stats: {
        totalBalance: number;
        totalLimit: number;
        monthlyIncome: number;
        monthlyExpenses: number;
    } | undefined;
    isLoading: boolean;
}

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export function DashboardSummary({ stats, isLoading }: DashboardSummaryProps) {
    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(val);

    const cards = [
        {
            title: 'Saldo Total',
            value: stats?.totalBalance || 0,
            icon: Wallet,
            color: colors.accent,
            bgColor: colors.accentGlow,
            borderColor: colors.accent,
        },
        {
            title: 'Limite Disponível',
            value: stats?.totalLimit || 0,
            icon: CreditCard,
            color: colors.purple,
            bgColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: colors.purple,
        },
        {
            title: 'Receita do Período',
            value: stats?.monthlyIncome || 0,
            icon: TrendingUp,
            color: colors.green,
            bgColor: colors.greenBg,
            borderColor: colors.green,
        },
        {
            title: 'Despesa do Período',
            value: stats?.monthlyExpenses || 0,
            icon: TrendingDown,
            color: colors.red,
            bgColor: colors.redBg,
            borderColor: colors.red,
            isNegative: true,
        },
    ];

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                        <Card
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                animation: `${fadeInUp} 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                                animationDelay: `${idx * 80}ms`,
                                opacity: 0,
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: `linear-gradient(90deg, ${card.borderColor}, transparent)`,
                                    opacity: 0,
                                    transition: 'opacity 200ms ease',
                                },
                                '&:hover::after': {
                                    opacity: 1,
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        bgcolor: card.bgColor,
                                        color: card.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon size={20} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                color: colors.textMuted,
                                                fontWeight: 500,
                                                mb: 0.75,
                                            }}
                                        >
                                            {card.title}
                                        </Typography>
                                        {isLoading ? (
                                            <Skeleton
                                                variant="text"
                                                width={120}
                                                height={32}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                                            />
                                        ) : (
                                            <Typography
                                                sx={{
                                                    fontSize: '24px',
                                                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                                                    fontWeight: 700,
                                                    letterSpacing: '-0.03em',
                                                    color: card.isNegative ? colors.red : colors.textPrimary,
                                                }}
                                            >
                                                {formatBRL(card.value)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}


