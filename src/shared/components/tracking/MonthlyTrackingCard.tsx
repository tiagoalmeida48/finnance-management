import { Grid, Card, CardContent, Stack, Typography, Box, Chip, LinearProgress, Divider, Tooltip } from '@mui/material';
import { CreditCard, CheckCircle2, Clock3, Wallet } from 'lucide-react';
import { colors } from '@/shared/theme';

interface TrackingItem {
    id: string;
    name: string;
    total: number;
    isPaid: boolean;
    itemType: 'card' | 'fixed';
}

interface MonthlyTrackingData {
    month: Date;
    monthName: string;
    items: TrackingItem[];
    progress: number;
    totalItems: number;
    paidItems: number;
    totalAmount: number;
}

interface MonthlyTrackingCardProps {
    data: MonthlyTrackingData;
}

export function MonthlyTrackingCard({ data }: MonthlyTrackingCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const progress = Math.round(data.progress || 0);
    const isSettled = progress === 100 && data.totalItems > 0;

    return (
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <Card
                sx={{
                    height: '100%',
                    border: `1px solid ${isSettled ? 'rgba(16,185,129,0.35)' : colors.border}`,
                    background: isSettled ? '#12241D' : colors.bgCard,
                    transition: 'all 220ms ease',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: isSettled ? 'rgba(16,185,129,0.45)' : colors.borderHover,
                    },
                }}
            >
                <CardContent sx={{ p: 2.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1.1rem', color: colors.textPrimary }}>
                                {data.monthName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isSettled ? colors.green : colors.accent }}>
                                {formatCurrency(data.totalAmount || 0)}
                            </Typography>
                        </Stack>

                        <Chip
                            label={isSettled ? 'Quitado' : 'Pendente'}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isSettled ? colors.green : colors.yellow,
                                bgcolor: isSettled ? colors.greenBg : colors.yellowBg,
                                border: `1px solid ${isSettled ? 'rgba(16,185,129,0.35)' : 'rgba(245,166,35,0.35)'}`,
                            }}
                        />
                    </Stack>

                    <Box sx={{ mb: 1.75 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                {data.paidItems} de {data.totalItems} pagos
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: isSettled ? colors.green : colors.yellow }}>
                                {progress}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 7,
                                borderRadius: 99,
                                bgcolor: colors.bgSecondary,
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 99,
                                    background: isSettled
                                        ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                                        : 'linear-gradient(90deg, #F5A623 0%, #D4AF37 100%)',
                                },
                            }}
                        />
                    </Box>

                    <Stack spacing={1.1}>
                        {data.totalItems === 0 ? (
                            <Typography
                                variant="body2"
                                sx={{
                                    py: 2,
                                    textAlign: 'center',
                                    color: colors.textMuted,
                                    border: `1px dashed ${colors.border}`,
                                    borderRadius: '10px',
                                }}
                            >
                                Sem obrigacoes neste mes
                            </Typography>
                        ) : (
                            data.items.map((item, iidx: number) => (
                                <Box key={iidx}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.25}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '6px',
                                                border: `1px solid ${colors.border}`,
                                                bgcolor: colors.bgSecondary,
                                                display: 'grid',
                                                placeItems: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {item.itemType === 'card' ? (
                                                    <CreditCard size={11} color={colors.textMuted} />
                                                ) : (
                                                    <Wallet size={11} color={colors.textMuted} />
                                                )}
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                    fontWeight: 500,
                                                    color: item.isPaid ? colors.textSecondary : colors.textPrimary,
                                                    textDecoration: item.isPaid ? 'line-through' : 'none',
                                                }}
                                            >
                                                {item.name}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexShrink: 0 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textSecondary }}>
                                                {formatCurrency(item.total)}
                                            </Typography>
                                            {item.isPaid ? (
                                                <CheckCircle2 size={15} color={colors.green} />
                                            ) : (
                                                <Tooltip title="Pendente">
                                                    <Clock3 size={15} color={colors.yellow} style={{ opacity: 0.8 }} />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </Stack>

                                    {iidx < data.items.length - 1 && (
                                        <Divider sx={{ mt: 1.1, borderColor: colors.border }} />
                                    )}
                                </Box>
                            ))
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}
