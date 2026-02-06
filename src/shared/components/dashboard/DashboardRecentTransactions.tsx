import { Card, CardContent, Typography, Stack, Box, Button, Table, TableBody, TableCell, TableContainer, TableRow, Chip, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import { Transaction } from '../../interfaces';

interface DashboardRecentTransactionsProps {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
}

export function DashboardRecentTransactions({ transactions, isLoading }: DashboardRecentTransactionsProps) {
    const navigate = useNavigate();

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <Card>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">Últimas Transações</Typography>
                    <Button size="small" onClick={() => navigate('/transactions')}>Ver Todas</Button>
                </Stack>

                <TableContainer>
                    <Table>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ pl: 0, py: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Skeleton variant="rounded" width={40} height={40} />
                                                <Box>
                                                    <Skeleton variant="text" width={150} />
                                                    <Skeleton variant="text" width={100} />
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right" sx={{ pr: 0 }}>
                                            <Skeleton variant="text" width={80} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : transactions?.slice(0, 6).map((t) => (
                                <TableRow key={t.id} sx={{
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                    '&:last-child td': { borderBottom: 0 }
                                }}>
                                    <TableCell sx={{ pl: 0, py: 2 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                bgcolor: t.type === 'income' ? 'rgba(76, 175, 80, 0.12)' : t.type === 'expense' ? 'rgba(239, 83, 80, 0.12)' : 'rgba(212, 175, 55, 0.12)',
                                                color: t.type === 'income' ? '#4CAF50' : t.type === 'expense' ? '#EF5350' : '#D4AF37',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {t.type === 'income' ? <ArrowUpRight size={18} /> : t.type === 'expense' ? <ArrowDownLeft size={18} /> : <ArrowRightLeft size={18} />}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.description}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')} • {t.category?.name || 'Sem categoria'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 0 }}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700,
                                            color: t.type === 'income' ? '#4CAF50' : t.type === 'expense' ? '#EF5350' : '#D4AF37'
                                        }}>
                                            {t.type === 'expense' ? '-' : '+'}{formatBRL(t.amount)}
                                        </Typography>
                                        <Chip
                                            label={t.is_paid ? 'Pago' : 'Pendente'}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                mt: 0.5,
                                                bgcolor: t.is_paid ? 'rgba(76, 175, 80, 0.12)' : 'rgba(212, 175, 55, 0.12)',
                                                color: t.is_paid ? '#4CAF50' : '#D4AF37',
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}

