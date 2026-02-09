import { useState } from 'react';
import { Stack, Typography, Chip, Button, Box, Collapse, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import type { CardStatement } from '../../interfaces/card-details.interface';

interface CardStatementListProps {
    statements: CardStatement[];
    handleOpenPayModal: (s: CardStatement) => void;
}

const colors = {
    bgCard: '#14141E',
    bgCardHover: '#1A1A28',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F0F0F5',
    textSecondary: '#8B8B9E',
    textMuted: '#5A5A6E',
    accent: '#C9A84C',
    green: '#10B981',
    yellow: '#F5A623',
    red: '#EF4444',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CardStatementList({ statements, handleOpenPayModal }: CardStatementListProps) {
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    const getStatusBadge = (statement: CardStatement) => {
        if (statement.unpaidTotal > 0) {
            return { label: 'Aberta', color: colors.yellow, bgColor: 'rgba(245, 166, 35, 0.1)' };
        }
        return { label: 'Paga', color: colors.green, bgColor: 'rgba(16, 185, 129, 0.1)' };
    };

    return (
        <>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: `${colors.accent}20` }}>
                    <Calendar size={18} color={colors.accent} />
                </Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary }}>
                    Histórico de Faturas
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                {statements.map((s) => {
                    const status = getStatusBadge(s);
                    const isExpanded = expandedMonth === s.month;

                    return (
                        <Box
                            key={s.month}
                            sx={{
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                transition: 'all 200ms ease',
                                '&:hover': { bgcolor: colors.bgCardHover },
                            }}
                        >
                            {/* Statement Header */}
                            <Box
                                onClick={() => setExpandedMonth(isExpanded ? null : s.month)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    cursor: 'pointer',
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {isExpanded ? <ChevronDown size={16} color={colors.textMuted} /> : <ChevronRight size={16} color={colors.textMuted} />}
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, textTransform: 'capitalize' }}>
                                        {s.month}
                                    </Typography>
                                    <Chip
                                        label={status.label}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            bgcolor: status.bgColor,
                                            color: status.color,
                                        }}
                                    />
                                    <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                        {s.transactions?.length || 0} itens
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: s.unpaidTotal > 0 ? colors.textPrimary : colors.green }}>
                                        {formatCurrency(s.total)}
                                    </Typography>
                                    {s.unpaidTotal > 0 && (
                                        <Button
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenPayModal(s);
                                            }}
                                            sx={{
                                                bgcolor: colors.accent,
                                                color: '#0A0A0F',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                px: 1.5,
                                                py: 0.5,
                                                '&:hover': { bgcolor: '#D4B85C' },
                                            }}
                                        >
                                            Pagar
                                        </Button>
                                    )}
                                </Stack>
                            </Box>

                            {/* Expanded Details */}
                            <Collapse in={isExpanded}>
                                <Box sx={{ borderTop: `1px solid ${colors.border}`, p: 0 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                <TableCell sx={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, py: 1 }}>DATA</TableCell>
                                                <TableCell sx={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, py: 1 }}>DESCRIÇÃO</TableCell>
                                                <TableCell sx={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, py: 1 }}>CATEGORIA</TableCell>
                                                <TableCell align="right" sx={{ color: colors.textMuted, fontSize: '11px', fontWeight: 600, borderBottom: `1px solid ${colors.border}`, py: 1 }}>VALOR</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {s.transactions?.map((t) => (
                                                <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>
                                                        {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM')}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, color: colors.textPrimary, fontSize: '13px', py: 1.5 }}>
                                                        {t.description}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, py: 1.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: t.category?.color || colors.textMuted }} />
                                                            <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>{t.category?.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{
                                                        borderBottom: `1px solid rgba(255,255,255,0.03)`,
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        py: 1.5,
                                                        color: t.type === 'income' ? colors.green : colors.red,
                                                    }}>
                                                        {formatCurrency(t.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Collapse>
                        </Box>
                    );
                })}

                {statements.length === 0 && (
                    <Box sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: colors.textSecondary }}>Nenhuma fatura encontrada para este período.</Typography>
                    </Box>
                )}
            </Stack>
        </>
    );
}
