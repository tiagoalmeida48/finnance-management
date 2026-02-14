import { MouseEvent, useMemo, useState } from 'react';
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
    Popover,
    Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { Calendar, CalendarRange, ChevronDown, ChevronRight } from 'lucide-react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CardStatement } from '../../interfaces/card-details.interface';
import type { CreditCardStatementPeriodRange } from '../../interfaces';
import { useCardStatementPeriodRanges, useCreateCardStatementPeriodRange, useDeleteCardStatementPeriodRange } from '../../hooks/useCreditCards';

interface CardStatementListProps {
    cardId: string;
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

const toDateAtNoon = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0);

const toDateKey = (value: Date) => format(toDateAtNoon(value), 'yyyy-MM-dd');

const toDateFromKey = (value: string) => new Date(`${value}T12:00:00`);

const isSameDate = (left: Date, right: Date) => toDateKey(left) === toDateKey(right);

const isDateInRange = (target: Date, rangeStart: Date, rangeEnd: Date) => {
    const targetKey = toDateKey(target);
    const startKey = toDateKey(rangeStart);
    const endKey = toDateKey(rangeEnd);
    return targetKey >= startKey && targetKey <= endKey;
};

const getRangeMonthKey = (range: CreditCardStatementPeriodRange) =>
    range.statement_month_key || range.period_end.slice(0, 7);

const getStatementRangeLabel = (periodRange: CreditCardStatementPeriodRange) =>
    `${format(toDateFromKey(periodRange.period_start), 'dd/MM')} - ${format(toDateFromKey(periodRange.period_end), 'dd/MM')}`;

type StatementSortField = 'payment_date' | 'description' | 'category' | 'amount';
type StatementSortDirection = 'asc' | 'desc';

export function CardStatementList({ cardId, statements, handleOpenPayModal }: CardStatementListProps) {
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [selectedStatementForRange, setSelectedStatementForRange] = useState<CardStatement | null>(null);
    const [rangeAnchorEl, setRangeAnchorEl] = useState<HTMLElement | null>(null);
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [rangeError, setRangeError] = useState<string | null>(null);
    const [statementSortField, setStatementSortField] = useState<StatementSortField>('payment_date');
    const [statementSortDirection, setStatementSortDirection] = useState<StatementSortDirection>('desc');

    const { data: statementPeriodRanges = [] } = useCardStatementPeriodRanges(cardId);
    const createStatementPeriodRange = useCreateCardStatementPeriodRange(cardId);
    const deleteStatementPeriodRange = useDeleteCardStatementPeriodRange(cardId);

    const isRangePopoverOpen = Boolean(rangeAnchorEl && selectedStatementForRange);

    const rangesByMonthKey = useMemo(() => {
        const orderedRanges = [...statementPeriodRanges]
            .sort((a, b) => b.created_at.localeCompare(a.created_at));

        const mappedRanges: Record<string, CreditCardStatementPeriodRange> = {};

        orderedRanges.forEach((periodRange) => {
            const statementMonthKey = getRangeMonthKey(periodRange);
            if (!mappedRanges[statementMonthKey]) {
                mappedRanges[statementMonthKey] = periodRange;
            }
        });

        return mappedRanges;
    }, [statementPeriodRanges]);

    const getStatusBadge = (statement: CardStatement) => {
        if (statement.unpaidTotal > 0) {
            return { label: 'Aberta', color: colors.yellow, bgColor: 'rgba(245, 166, 35, 0.1)' };
        }
        return { label: 'Paga', color: colors.green, bgColor: 'rgba(16, 185, 129, 0.1)' };
    };

    const handleOpenRangePopover = (event: MouseEvent<HTMLElement>, statement: CardStatement) => {
        event.stopPropagation();

        const existingRange = rangesByMonthKey[statement.monthKey];
        const defaultStart = existingRange ? toDateFromKey(existingRange.period_start) : startOfMonth(statement.date);
        const defaultEnd = existingRange ? toDateFromKey(existingRange.period_end) : endOfMonth(statement.date);

        setSelectedStatementForRange(statement);
        setRangeStart(toDateAtNoon(defaultStart));
        setRangeEnd(toDateAtNoon(defaultEnd));
        setRangeError(null);
        setRangeAnchorEl(event.currentTarget);
    };

    const handleCloseRangePopover = () => {
        if (createStatementPeriodRange.isPending) return;
        setRangeAnchorEl(null);
        setSelectedStatementForRange(null);
        setRangeError(null);
    };

    const handleSelectRangeDay = (selectedDay: Date | null) => {
        if (!selectedDay) return;
        const normalizedDay = toDateAtNoon(selectedDay);

        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(normalizedDay);
            setRangeEnd(null);
            setRangeError(null);
            return;
        }

        if (normalizedDay.getTime() < rangeStart.getTime()) {
            setRangeEnd(rangeStart);
            setRangeStart(normalizedDay);
        } else {
            setRangeEnd(normalizedDay);
        }

        setRangeError(null);
    };

    const handleSaveRange = async () => {
        if (!selectedStatementForRange || !rangeStart || !rangeEnd) {
            setRangeError('Selecione o intervalo completo no calendario.');
            return;
        }

        const startKey = toDateKey(rangeStart);
        const endKey = toDateKey(rangeEnd);

        if (startKey > endKey) {
            setRangeError('A data inicial nao pode ser maior que a data final.');
            return;
        }

        setRangeError(null);

        try {
            await createStatementPeriodRange.mutateAsync({
                period_start: startKey,
                period_end: endKey,
                statement_month_key: selectedStatementForRange.monthKey,
                statement_name: selectedStatementForRange.month,
                notes: `Range definido pela tela Historico de Faturas para ${selectedStatementForRange.month}.`,
            });

            handleCloseRangePopover();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel salvar o range da fatura.';
            setRangeError(message);
        }
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

    const RangeDay = (props: PickersDayProps) => {
        const day = toDateAtNoon(props.day);

        const isRangeStart = !!rangeStart && isSameDate(day, rangeStart);
        const isRangeEnd = !!rangeEnd && isSameDate(day, rangeEnd);
        const isInSelectedRange = !!rangeStart && !!rangeEnd && isDateInRange(day, rangeStart, rangeEnd);

        return (
            <PickersDay
                {...props}
                day={props.day}
                sx={{
                    color: colors.textSecondary,
                    fontSize: '13px',
                    ...(isInSelectedRange && !isRangeStart && !isRangeEnd && {
                        bgcolor: 'rgba(201, 168, 76, 0.2)',
                        color: colors.textPrimary,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: 'rgba(201, 168, 76, 0.28)' },
                    }),
                    ...((isRangeStart || isRangeEnd) && {
                        bgcolor: colors.accent,
                        color: '#0A0A0F',
                        borderRadius: '999px',
                        '&:hover': { bgcolor: '#D4B85C' },
                    }),
                }}
            />
        );
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
                {statements.map((statement) => {
                    const status = getStatusBadge(statement);
                    const isExpanded = expandedMonth === statement.monthKey;
                    const statementPeriodRange = rangesByMonthKey[statement.monthKey] ?? null;
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
                                    <Button
                                        size="small"
                                        onClick={(event) => handleOpenRangePopover(event, statement)}
                                        sx={{
                                            minWidth: 0,
                                            px: 1.2,
                                            py: 0.4,
                                            borderRadius: '8px',
                                            color: colors.textSecondary,
                                            border: `1px solid ${colors.border}`,
                                            textTransform: 'none',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            '&:hover': { borderColor: 'rgba(255,255,255,0.22)', bgcolor: 'rgba(255,255,255,0.04)' },
                                        }}
                                        startIcon={<CalendarRange size={12} />}
                                    >
                                        {statementPeriodRange ? 'Editar Range' : 'Definir Range'}
                                    </Button>
                                    {statementPeriodRange && (
                                        <Chip
                                            size="small"
                                            label={getStatementRangeLabel(statementPeriodRange)}
                                            onDelete={(event) => {
                                                event.stopPropagation();
                                                deleteStatementPeriodRange.mutate(statementPeriodRange.id);
                                            }}
                                            disabled={deleteStatementPeriodRange.isPending}
                                            sx={{
                                                height: 22,
                                                fontSize: '11px',
                                                bgcolor: 'rgba(201, 168, 76, 0.14)',
                                                color: colors.accent,
                                                '& .MuiChip-deleteIcon': {
                                                    color: colors.accent,
                                                    fontSize: '14px',
                                                    '&:hover': { color: colors.red },
                                                },
                                            }}
                                        />
                                    )}
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
                                                <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
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

            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
                localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
            >
                <Popover
                    open={isRangePopoverOpen}
                    anchorEl={rangeAnchorEl}
                    onClose={handleCloseRangePopover}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{
                        sx: {
                            width: 360,
                            borderRadius: '16px',
                            border: `1px solid ${colors.border}`,
                            bgcolor: colors.bgCard,
                            backgroundImage: 'linear-gradient(145deg, rgba(201,168,76,0.12), rgba(20,20,30,0.96))',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <Box sx={{ p: 1.5 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: colors.textPrimary }}>
                            Range da Fatura
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: colors.textMuted, mb: 1 }}>
                            {selectedStatementForRange?.month ?? '-'}
                        </Typography>

                        <DateCalendar
                            value={rangeEnd ?? rangeStart ?? selectedStatementForRange?.date ?? null}
                            onChange={handleSelectRangeDay}
                            slots={{ day: RangeDay }}
                            sx={{
                                width: '100%',
                                '& .MuiPickersCalendarHeader-label': { color: colors.textPrimary, fontWeight: 700 },
                                '& .MuiDayCalendar-weekDayLabel': { color: colors.textMuted, fontSize: '11px' },
                                '& .MuiPickersArrowSwitcher-button': { color: colors.textSecondary },
                            }}
                        />

                        <Box sx={{ mt: 0.5, mb: 0.5 }}>
                            <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>
                                {rangeStart && rangeEnd
                                    ? `Selecionado: ${format(rangeStart, 'dd/MM/yyyy')} até ${format(rangeEnd, 'dd/MM/yyyy')}`
                                    : 'Selecione início e fim no calendário.'}
                            </Typography>
                        </Box>

                        {rangeError && (
                            <Typography sx={{ fontSize: '12px', color: colors.red, mb: 1 }}>
                                {rangeError}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ borderColor: colors.border }} />
                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1.25 }}>
                        <Button
                            onClick={handleCloseRangePopover}
                            disabled={createStatementPeriodRange.isPending}
                            sx={{
                                color: colors.textSecondary,
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                            }}
                        >
                            Fechar
                        </Button>
                        <Button
                            onClick={handleSaveRange}
                            disabled={createStatementPeriodRange.isPending}
                            sx={{
                                bgcolor: colors.accent,
                                color: '#0A0A0F',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '10px',
                                px: 2.25,
                                '&:hover': { bgcolor: '#D4B85C' },
                            }}
                        >
                            {createStatementPeriodRange.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </Stack>
                </Popover>
            </LocalizationProvider>
        </>
    );
}
