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
    useTheme,
    useMediaQuery,
    Grid,
    Divider
} from '@mui/material';
import { Calendar, ChevronDown, ChevronRight, ShoppingBag, RefreshCw } from 'lucide-react';
import { useReprocessInvoices } from '../../hooks/useCreditCards';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [statementSortField, setStatementSortField] = useState<StatementSortField>('payment_date');
    const [statementSortDirection, setStatementSortDirection] = useState<StatementSortDirection>('desc');
    const reprocessInvoices = useReprocessInvoices(_cardId);

    const handleReprocess = () => {
        // Reprocess from a safe past date (e.g., 2 years ago or just current view context)
        // ideally getting the earliest cycle start date would be better, but a fixed reasonable date works for now
        // or just let the backend handle "all time" if date is old enough.
        // The service uses 45 days lookback from the date provided.
        // Let's use the first statement's date if available, or a default.
        const oldestStatement = statements[statements.length - 1];
        let fromDate = new Date().toISOString().split('T')[0]; // Default to today

        if (oldestStatement) {
            // statement.month is "janeiro", "fevereiro", need to parse or use monthKey if available?
            // statement object has monthKey "yyyy-MM"
            fromDate = `${oldestStatement.monthKey}-01`;
        } else {
            // Fallback to beginning of current year
            fromDate = `${new Date().getFullYear()}-01-01`;
        }

        reprocessInvoices.mutate(fromDate);
    };




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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: `${colors.accent}20` }}>
                        <Calendar size={18} color={colors.accent} />
                    </Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary }}>
                        Histórico de Faturas
                    </Typography>
                </Stack>
                <Button
                    startIcon={reprocessInvoices.isPending ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    onClick={handleReprocess}
                    disabled={reprocessInvoices.isPending}
                    size="small"
                    sx={{
                        color: colors.textSecondary,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: colors.textPrimary },
                    }}
                >
                    {reprocessInvoices.isPending ? 'Atualizando...' : 'Recalcular'}
                </Button>
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
                                    p: 2,
                                    cursor: 'pointer',
                                }}
                            >
                                <Grid container spacing={2} alignItems="center">
                                    {/* Mês e Ícone Expandir */}
                                    <Grid size={{ xs: 12, md: 4 }}>
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
                                            {!isMobile && (
                                                <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                                    {statement.transactions?.length || 0} itens
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Grid>

                                    {/* Valor Total e Botão Pagar */}
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            justifyContent={isMobile ? 'space-between' : 'flex-end'}
                                            sx={{ width: '100%' }}
                                        >
                                            {isMobile && (
                                                <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                                    {statement.transactions?.length || 0} itens
                                                </Typography>
                                            )}

                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Typography sx={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, color: statement.unpaidTotal > 0 ? colors.textPrimary : colors.green }}>
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
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Collapse in={isExpanded}>
                                <Box sx={{ borderTop: `1px solid ${colors.border}`, p: 0 }}>
                                    {!isMobile ? (
                                        // DESKTOP TABLE VIEW
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
                                    ) : (
                                        // MOBILE LIST VIEW
                                        <Stack spacing={0} divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />}>
                                            {statementTransactions.map((transaction) => (
                                                <Box
                                                    key={transaction.id}
                                                    onClick={() => onEditTransaction?.(transaction)}
                                                    sx={{
                                                        p: 2,
                                                        cursor: onEditTransaction ? 'pointer' : 'default',
                                                        '&:active': { bgcolor: 'rgba(255,255,255,0.04)' }
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                                                        {/* Icon Box */}
                                                        <Box
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: '8px',
                                                                bgcolor: `${transaction.category?.color || colors.textMuted}15`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <ShoppingBag size={18} color={transaction.category?.color || colors.textMuted} />
                                                        </Box>

                                                        {/* Main Info */}
                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Typography sx={{ color: colors.textPrimary, fontSize: '13px', fontWeight: 500, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {transaction.description}
                                                            </Typography>
                                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                                <Typography sx={{ color: colors.textMuted, fontSize: '11px' }}>
                                                                    {format(new Date(transaction.payment_date + 'T12:00:00'), 'dd/MM', { locale: ptBR })}
                                                                </Typography>
                                                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: colors.textMuted }} />
                                                                <Typography sx={{ color: colors.textSecondary, fontSize: '11px' }}>
                                                                    {transaction.category?.name}
                                                                </Typography>

                                                                {transaction.installment_number && transaction.total_installments && (
                                                                    <>
                                                                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: colors.textMuted }} />
                                                                        <Typography sx={{ fontSize: '11px', color: colors.textMuted, fontWeight: 600 }}>
                                                                            {transaction.installment_number}/{transaction.total_installments}
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </Box>

                                                        {/* Amount */}
                                                        <Typography
                                                            sx={{
                                                                fontSize: '13px',
                                                                fontWeight: 600,
                                                                color: transaction.type === 'income' ? colors.green : colors.red,
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {formatCurrency(transaction.amount)}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
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
            </Stack >
        </>
    );
}
