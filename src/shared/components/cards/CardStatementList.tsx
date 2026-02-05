import { Stack, Accordion, AccordionSummary, AccordionDetails, Typography, Chip, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Card } from '@mui/material';
import { ChevronDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CardStatementListProps {
    statements: any[];
    handleOpenPayModal: (s: any) => void;
}

export function CardStatementList({ statements, handleOpenPayModal }: CardStatementListProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={20} /> Histórico de Faturas
            </Typography>

            <Stack spacing={2}>
                {statements.map((s) => (
                    <Accordion
                        key={s.month}
                        sx={{
                            bgcolor: 'background.paper',
                            border: '1px solid #2A2A2A',
                            '&:before': { display: 'none' },
                            borderRadius: '1px !important'
                        }}
                    >
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{s.month}</Typography>
                                    {s.unpaidTotal > 0 ? (
                                        <Chip
                                            label="Aberta"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(212, 175, 55, 0.1)', color: 'primary.main', fontWeight: 600 }}
                                        />
                                    ) : (
                                        <Chip
                                            label="Paga"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.main', fontWeight: 600 }}
                                        />
                                    )}
                                </Stack>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Typography sx={{ fontWeight: 700, color: s.unpaidTotal > 0 ? 'text.primary' : 'success.main' }}>
                                        {formatCurrency(s.total)}
                                    </Typography>
                                    {s.unpaidTotal > 0 && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenPayModal(s);
                                            }}
                                            sx={{
                                                py: 0.5,
                                                fontSize: '0.7rem',
                                                height: 24,
                                                bgcolor: 'primary.main',
                                                color: 'background.paper',
                                                '&:hover': { bgcolor: 'primary.dark' }
                                            }}
                                        >
                                            Pagar Fatura
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                            <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Data</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Descrição</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Categoria</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid #2A2A2A' }}>Valor</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {s.transactions.map((t: any) => (
                                            <TableRow key={t.id}>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM')}
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{t.description}</TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.category?.color }} />
                                                        {t.category?.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    fontWeight: 600,
                                                    color: t.type === 'income' ? 'success.main' : 'error.main'
                                                }}>
                                                    {formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                ))}
                {statements.length === 0 && (
                    <Card sx={{ bgcolor: 'background.paper', border: '1px solid #2A2A2A', p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Nenhuma fatura encontrada para este período.</Typography>
                    </Card>
                )}
            </Stack>
        </>
    );
}
