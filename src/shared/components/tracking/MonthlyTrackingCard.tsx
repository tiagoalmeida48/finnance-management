import { Grid, Card, CardContent, Stack, Typography, Box, Chip, LinearProgress, Divider, Tooltip } from '@mui/material';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';

interface MonthlyTrackingCardProps {
    data: any;
}

export function MonthlyTrackingCard({ data }: MonthlyTrackingCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: data.progress === 100 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255,255,255,0.05)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
            }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="baseline">
                            <Typography sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1.1rem' }}>
                                {data.monthName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: data.progress === 100 ? 'success.main' : 'primary.main' }}>
                                {formatCurrency(data.totalAmount)}
                            </Typography>
                        </Stack>
                        {data.totalItems > 0 && data.progress === 100 && (
                            <Chip
                                label="Quitado"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                        )}
                    </Stack>

                    <Box sx={{ mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {data.paidItems} de {data.totalItems} pagos
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: data.progress === 100 ? 'success.main' : 'primary.main' }}>
                                {Math.round(data.progress)}%
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={data.progress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: data.progress === 100 ? 'success.main' : 'primary.main'
                                }
                            }}
                        />
                    </Box>

                    <Stack spacing={1.5}>
                        {data.totalItems === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
                                Sem obrigações este mês
                            </Typography>
                        ) : (
                            data.items.map((item: any, iidx: number) => (
                                <Box key={iidx}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: '65%' }}>
                                            {item.itemType === 'card' ? (
                                                <CreditCard size={14} style={{ opacity: 0.5 }} />
                                            ) : (
                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
                                            )}
                                            <Typography variant="body2" noWrap sx={{
                                                fontWeight: 500,
                                                color: item.isPaid ? 'text.secondary' : 'text.primary',
                                                textDecoration: item.isPaid ? 'line-through' : 'none'
                                            }}>
                                                {item.name}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(item.total)}
                                            </Typography>
                                            {item.isPaid ? (
                                                <CheckCircle2 size={16} color="#2E7D32" />
                                            ) : (
                                                <Tooltip title="Pendente">
                                                    <Clock size={16} color="#D4AF37" style={{ opacity: 0.6 }} />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </Stack>
                                    {iidx < data.items.length - 1 && (
                                        <Divider sx={{ mt: 1, borderColor: 'rgba(255,255,255,0.03)' }} />
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
