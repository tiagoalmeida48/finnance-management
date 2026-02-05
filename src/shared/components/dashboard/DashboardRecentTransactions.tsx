import { Card, CardContent, Typography, Stack, Box, Button, Table, TableBody, TableCell, TableContainer, TableRow, Chip } from '@mui/material';
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
        <Card sx={{ mt: 3, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Últimas Transações</Typography>
                    <Button size="small" onClick={() => navigate('/transactions')}>Ver Todas</Button>
                </Stack>

                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell><Typography>Carregando...</Typography></TableCell></TableRow>
                            ) : transactions?.slice(0, 5).map((t) => (
                                <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                    <TableCell sx={{ pl: 0, py: 1.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: t.type === 'income' ? 'rgba(46, 125, 50, 0.1)' : t.type === 'expense' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                                color: t.type === 'income' ? 'success.main' : t.type === 'expense' ? 'error.main' : 'primary.main'
                                            }}>
                                                {t.type === 'income' ? <ArrowUpRight size={16} /> : t.type === 'expense' ? <ArrowDownLeft size={16} /> : <ArrowRightLeft size={16} />}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.description}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')} • {t.category?.name || 'Geral'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 0 }}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700,
                                            color: t.type === 'income' ? 'success.main' : t.type === 'expense' ? 'error.main' : '#FACC15'
                                        }}>
                                            {formatBRL(t.amount)}
                                        </Typography>
                                        <Chip
                                            label={t.is_paid ? 'Pago' : 'Pendente'}
                                            size="small"
                                            sx={{
                                                height: 16,
                                                fontSize: '0.65rem',
                                                bgcolor: t.is_paid ? 'rgba(46, 125, 50, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                                color: t.is_paid ? 'success.main' : 'primary.main',
                                                border: 'none',
                                                mt: 0.5
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
