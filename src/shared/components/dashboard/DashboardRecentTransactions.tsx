import { Card, CardContent, Typography, Stack, Box, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { Transaction } from '../../interfaces';
import { colors } from '@/shared/theme';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
}

export function DashboardRecentTransactions({ transactions, isLoading }: DashboardRecentTransactionsProps) {
    const navigate = useNavigate();

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(val);

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'income':
                return {
                    icon: TrendingUp,
                    color: colors.green,
                    bgColor: colors.greenBg,
                    prefix: '+'
                };
            case 'expense':
                return {
                    icon: TrendingDown,
                    color: colors.red,
                    bgColor: colors.redBg,
                    prefix: '-'
                };
            default:
                return {
                    icon: ArrowRightLeft,
                    color: colors.accent,
                    bgColor: colors.accentGlow,
                    prefix: ''
                };
        }
    };

    return (
        <Card>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '16px', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600 }}>
                        Últimas Transações
                    </Typography>
                    <Button
                        size="small"
                        endIcon={<ArrowRight size={14} />}
                        onClick={() => navigate('/transactions')}
                        sx={{
                            color: colors.textSecondary,
                            fontSize: '12px',
                            '&:hover': { color: colors.accent, bgcolor: 'transparent' }
                        }}
                    >
                        Ver Todas
                    </Button>
                </Stack>

                <Stack spacing={0}>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    py: 1.5,
                                    borderBottom: i < 4 ? `1px solid ${colors.border}` : 'none'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Skeleton
                                        variant="rounded"
                                        width={36}
                                        height={36}
                                        sx={{ borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                        <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    </Box>
                                    <Skeleton variant="text" width={80} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                </Stack>
                            </Box>
                        ))
                    ) : transactions?.slice(0, 6).map((t, idx) => {
                        const config = getTypeConfig(t.type);
                        const Icon = config.icon;
                        return (
                            <Box
                                key={t.id}
                                sx={{
                                    py: 1.5,
                                    borderBottom: idx < 5 ? `1px solid ${colors.border}` : 'none',
                                    transition: 'all 200ms ease',
                                    '&:hover': {
                                        pl: 0.5,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                    },
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '10px',
                                        bgcolor: config.bgColor,
                                        color: config.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={18} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{
                                            fontSize: '13.5px',
                                            fontWeight: 500,
                                            color: colors.textPrimary,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {t.description}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                            {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')}
                                            {t.category?.name && ` • ${t.category.name}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Typography sx={{
                                            fontSize: '14px',
                                            fontFamily: '"Plus Jakarta Sans"',
                                            fontWeight: 600,
                                            color: config.color,
                                        }}>
                                            {config.prefix}{formatBRL(t.amount)}
                                        </Typography>
                                        {!t.is_paid && (
                                            <Typography sx={{
                                                fontSize: '10px',
                                                color: colors.yellow,
                                                fontWeight: 500,
                                            }}>
                                                Pendente
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
}


