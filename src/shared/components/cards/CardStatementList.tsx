import { useState } from 'react';
import {
    Stack,
    Typography,
    Chip,
    Button,
    Box,
    Collapse,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableSortLabel,
} from '@mui/material';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { CardStatement, StatementTransaction } from '../../interfaces/card-details.interface';

interface CardStatementListProps {
    cardId: string;
    statements: CardStatement[];
    handleOpenPayModal: (s: CardStatement) => void;
    onEditTransaction?: (transaction: StatementTransaction) => void;
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

type StatementSortField = 'payment_date' | 'description' | 'category' | 'amount';
type StatementSortDirection = 'asc' | 'desc';

export function CardStatementList({ cardId: _cardId, statements, handleOpenPayModal, onEditTransaction }: CardStatementListProps) {
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [statementSortField, setStatementSortField] = useState<StatementSortField>('payment_date');
    const [statementSortDirection, setStatementSortDirection] = useState<StatementSortDirection>('desc');

    const getStatusBadge = (statement: CardStatement) => {
        if (statement.unpaidTotal > 0) {
            return { label: 'Aberta', color: colors.yellow, bgColor: 'rgba(245, 166, 35, 0.1)' };
        }
        return { label: 'Paga', color: colors.green, bgColor: 'rgba(16, 185, 129, 0.1)' };
    };

    const handleStatementSort = (field: StatementSortField) => {
        if (statementSortField === field) {
            setStatementSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            return;
        }
        setStatementSortField(field);
        setStatementSortDirection('asc');
    };

    const getSortableCategoryName = (categoryName?: string | null) =>
        (categoryName && categoryName.trim().length > 0 ? categoryName : 'Sem categoria').toLowerCase();

    const getSortedStatementTransactions = (transactions: CardStatement['transactions']) => {
        const sorted = [...transactions];

        sorted.sort((left, right) => {
            let comparison = 0;

            if (statementSortField === 'payment_date') {
                comparison = left.payment_date.localeCompare(right.payment_date);
            } else if (statementSortField === 'description') {
                comparison = left.description.localeCompare(right.description, 'pt-BR', { sensitivity: 'base' });
            } else if (statementSortField === 'category') {
                comparison = getSortableCategoryName(left.category?.name).localeCompare(
                    getSortableCategoryName(right.category?.name),
                    'pt-BR',
                    { sensitivity: 'base' }
                );
            } else if (statementSortField === 'amount') {
                comparison = left.amount - right.amount;
            }

            if (comparison === 0) {
                comparison = left.id.localeCompare(right.id);
            }

            return statementSortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    };

    const getTableSortLabelSx = (field: StatementSortField) => ({
        color: `${statementSortField === field ? colors.accent : colors.textMuted} !important`,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        '& .MuiTableSortLabel-icon': {
            color: `${statementSortField === field ? colors.accent : colors.textMuted} !important`,
            opacity: statementSortField === field ? 1 : 0.35,
        },
    });

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
                {statements.map((statement) => {
                    const status = getStatusBadge(statement);
                    const isExpanded = expandedMonth === statement.monthKey;
                    const statementTransactions = getSortedStatementTransactions(statement.transactions || []);

                    return (
                        <Box
                            key={statement.monthKey}
                            sx={{
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                transition: 'all 200ms ease',
                                '&:hover': { bgcolor: colors.bgCardHover },
                            }}
                        >
                            <Box
                                onClick={() => setExpandedMonth(isExpanded ? null : statement.monthKey)}
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
                                        {statement.month}
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
                                        {statement.transactions?.length || 0} itens
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: statement.unpaidTotal > 0 ? colors.textPrimary : colors.green }}>
                                        {formatCurrency(statement.total)}
                                    </Typography>
                                    {statement.unpaidTotal > 0 && (
                                        <Button
                                            size="small"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleOpenPayModal(statement);
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

                            <Collapse in={isExpanded}>
                                <Box sx={{ borderTop: `1px solid ${colors.border}`, p: 0 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                <TableCell sx={{ borderBottom: `1px solid ${colors.border}`, py: 1 }}>
                                                    <TableSortLabel
                                                        active={statementSortField === 'payment_date'}
                                                        direction={statementSortField === 'payment_date' ? statementSortDirection : 'asc'}
                                                        onClick={() => handleStatementSort('payment_date')}
                                                        sx={getTableSortLabelSx('payment_date')}
                                                    >
                                                        DATA
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${colors.border}`, py: 1 }}>
                                                    <TableSortLabel
                                                        active={statementSortField === 'description'}
                                                        direction={statementSortField === 'description' ? statementSortDirection : 'asc'}
                                                        onClick={() => handleStatementSort('description')}
                                                        sx={getTableSortLabelSx('description')}
                                                    >
                                                        DESCRIÇÃO
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${colors.border}`, py: 1 }}>
                                                    <TableSortLabel
                                                        active={statementSortField === 'category'}
                                                        direction={statementSortField === 'category' ? statementSortDirection : 'asc'}
                                                        onClick={() => handleStatementSort('category')}
                                                        sx={getTableSortLabelSx('category')}
                                                    >
                                                        CATEGORIA
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: `1px solid ${colors.border}`, py: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <TableSortLabel
                                                            active={statementSortField === 'amount'}
                                                            direction={statementSortField === 'amount' ? statementSortDirection : 'asc'}
                                                            onClick={() => handleStatementSort('amount')}
                                                            sx={getTableSortLabelSx('amount')}
                                                        >
                                                            VALOR
                                                        </TableSortLabel>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {statementTransactions.map((transaction) => (
                                                <TableRow
                                                    key={transaction.id}
                                                    onClick={() => onEditTransaction?.(transaction)}
                                                    sx={{
                                                        cursor: onEditTransaction ? 'pointer' : 'default',
                                                        transition: 'background-color 150ms ease',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                                                    }}
                                                >
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, color: colors.textSecondary, fontSize: '13px', py: 1.5 }}>
                                                        {format(new Date(transaction.payment_date + 'T12:00:00'), 'dd/MM')}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, color: colors.textPrimary, fontSize: '13px', py: 1.5 }}>
                                                        {transaction.description}
                                                        {transaction.installment_number && transaction.total_installments && (
                                                            <Typography component="span" sx={{ ml: 0.8, fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>
                                                                {transaction.installment_number}/{transaction.total_installments}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, py: 1.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: transaction.category?.color || colors.textMuted }} />
                                                            <Typography sx={{ fontSize: '13px', color: colors.textSecondary }}>{transaction.category?.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            borderBottom: `1px solid rgba(255,255,255,0.03)`,
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            py: 1.5,
                                                            color: transaction.type === 'income' ? colors.green : colors.red,
                                                        }}
                                                    >
                                                        {formatCurrency(transaction.amount)}
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
