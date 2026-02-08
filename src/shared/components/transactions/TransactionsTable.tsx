import { Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, TableSortLabel, Paper, Collapse, Typography, IconButton, Chip, TextField, InputAdornment, Select, MenuItem, FormControl, Box } from '@mui/material';
import { ChevronDown, Search } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';
import { TransactionRow } from './TransactionRow';
import { TransactionGroup } from '../../hooks/useTransactionsPageLogic';
import { colors } from '@/shared/theme';

interface TransactionsTableProps {
    groupedTransactions: (Transaction | TransactionGroup)[];
    selectedIds: string[];
    handleSelectAll: (checked: boolean) => void;
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    handleSort: (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method') => void;
    sortConfig: { field: string, direction: 'asc' | 'desc' };
    expandedGroups: Record<string, boolean>;
    toggleGroup: (id: string) => void;
    isPendingToggle?: (id: string) => boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    paymentMethodFilter: string;
    setPaymentMethodFilter: (val: string) => void;
    categories?: { id: string, name: string }[];
}

const sortLabelSx = {
    '&.Mui-active': { color: colors.accent },
    '& .MuiTableSortLabel-icon': {
        color: `${colors.accent} !important`,
        fontSize: 12,
    },
};

const inlineSelectSx = {
    height: 28,
    borderRadius: '6px',
    bgcolor: colors.bgSecondary,
    fontSize: '12px',
    color: colors.textSecondary,
    '& fieldset': { border: 'none' },
    '& .MuiSelect-icon': { color: colors.textMuted, fontSize: 16 },
    '& .MuiSelect-select': {
        py: '2px',
        px: '6px',
    },
};

export function TransactionsTable({
    groupedTransactions,
    selectedIds,
    handleSelectAll,
    handleSelectRow,
    handleTogglePaid,
    handleOpenMenu,
    handleSort,
    sortConfig,
    expandedGroups,
    toggleGroup,
    isPendingToggle,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    categories,
}: TransactionsTableProps) {
    const formatBRL = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const isActiveSort = (field: string) => sortConfig.field === field;

    return (
        <TableContainer component={Paper} sx={{
            bgcolor: colors.bgCard,
            backgroundImage: 'none',
            border: `1px solid ${colors.border}`,
            boxShadow: 'none',
        }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{
                        bgcolor: colors.bgSecondary,
                        borderBottom: `1px solid ${colors.border}`,
                    }}>
                        {/* Checkbox */}
                        <TableCell padding="checkbox" sx={{ py: 1.5, pl: 2 }}>
                            <Checkbox
                                size="small"
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    '& .MuiSvgIcon-root': { fontSize: 18 },
                                    color: 'rgba(255,255,255,0.15)',
                                    '&.Mui-checked': { color: colors.accent },
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ width: 48 }} />

                        {/* DATA */}
                        <TableCell sx={{ py: 1.5 }}>
                            <TableSortLabel
                                active={isActiveSort('payment_date')}
                                direction={sortConfig.direction}
                                onClick={() => handleSort('payment_date')}
                                sx={sortLabelSx}
                            >
                                <Typography sx={{
                                    fontSize: '11px',
                                    fontFamily: '"DM Sans"',
                                    fontWeight: 600,
                                    color: isActiveSort('payment_date') ? colors.accent : colors.textMuted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}>
                                    Data
                                </Typography>
                            </TableSortLabel>
                        </TableCell>

                        {/* DESCRIÇÃO + Search inline */}
                        <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TableSortLabel
                                    active={isActiveSort('description')}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('description')}
                                    sx={sortLabelSx}
                                >
                                    <Typography sx={{
                                        fontSize: '11px',
                                        fontFamily: '"DM Sans"',
                                        fontWeight: 600,
                                        color: isActiveSort('description') ? colors.accent : colors.textMuted,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>
                                        Descrição
                                    </Typography>
                                </TableSortLabel>
                                <TextField
                                    size="small"
                                    placeholder="Filtrar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search size={12} color={colors.textMuted} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        maxWidth: 160,
                                        '& .MuiOutlinedInput-root': {
                                            height: 28,
                                            borderRadius: '6px',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                                            '&.Mui-focused fieldset': {
                                                borderColor: colors.accent,
                                                borderWidth: '1px',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: '11px',
                                            py: '3px',
                                            '&::placeholder': { color: colors.textMuted, opacity: 1 },
                                        },
                                    }}
                                />
                            </Box>
                        </TableCell>

                        {/* CATEGORIA + Select inline */}
                        <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TableSortLabel
                                    active={isActiveSort('category_id')}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('category_id')}
                                    sx={sortLabelSx}
                                >
                                    <Typography sx={{
                                        fontSize: '11px',
                                        fontFamily: '"DM Sans"',
                                        fontWeight: 600,
                                        color: isActiveSort('category_id') ? colors.accent : colors.textMuted,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>
                                        Categoria
                                    </Typography>
                                </TableSortLabel>
                                <FormControl size="small">
                                    <Select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        sx={{
                                            ...inlineSelectSx,
                                            color: categoryFilter !== 'all' ? colors.accent : colors.textMuted,
                                        }}
                                    >
                                        <MenuItem value="all">Todas</MenuItem>
                                        {categories?.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        </TableCell>

                        {/* PAGAMENTO + Select inline */}
                        <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TableSortLabel
                                    active={isActiveSort('payment_method')}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('payment_method')}
                                    sx={sortLabelSx}
                                >
                                    <Typography sx={{
                                        fontSize: '11px',
                                        fontFamily: '"DM Sans"',
                                        fontWeight: 600,
                                        color: isActiveSort('payment_method') ? colors.accent : colors.textMuted,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>
                                        Pagamento
                                    </Typography>
                                </TableSortLabel>
                                <FormControl size="small">
                                    <Select
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        sx={{
                                            ...inlineSelectSx,
                                            color: paymentMethodFilter !== 'all' ? colors.accent : colors.textMuted,
                                        }}
                                    >
                                        <MenuItem value="all">Todos</MenuItem>
                                        <MenuItem value="credit">Cartão de Crédito</MenuItem>
                                        <MenuItem value="debit">Débito</MenuItem>
                                        <MenuItem value="pix">PIX</MenuItem>
                                        <MenuItem value="money">Dinheiro</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </TableCell>

                        {/* VALOR */}
                        <TableCell align="right" sx={{ py: 1.5 }}>
                            <TableSortLabel
                                active={isActiveSort('amount')}
                                direction={sortConfig.direction}
                                onClick={() => handleSort('amount')}
                                sx={sortLabelSx}
                            >
                                <Typography sx={{
                                    fontSize: '11px',
                                    fontFamily: '"DM Sans"',
                                    fontWeight: 600,
                                    color: isActiveSort('amount') ? colors.accent : colors.textMuted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}>
                                    Valor
                                </Typography>
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ width: 48 }} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groupedTransactions.map((item) => {
                        if ('isGroup' in item && item.isGroup) {
                            const group = item as TransactionGroup;
                            const isExpanded = expandedGroups[group.id];
                            return (
                                <Fragment key={group.id}>
                                    <TableRow sx={{
                                        bgcolor: colors.bgSecondary,
                                        borderLeft: `3px solid ${colors.purple}`,
                                        '&:hover': { bgcolor: colors.bgCardHover },
                                    }}>
                                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                                            <Checkbox
                                                size="small"
                                                checked={group.items.every(it => selectedIds.includes(it.id))}
                                                onChange={(e) => group.items.forEach(it => {
                                                    if (e.target.checked && !selectedIds.includes(it.id)) handleSelectRow(it.id);
                                                    if (!e.target.checked && selectedIds.includes(it.id)) handleSelectRow(it.id);
                                                })}
                                                sx={{
                                                    width: 18,
                                                    height: 18,
                                                    '& .MuiSvgIcon-root': { fontSize: 18 },
                                                    color: 'rgba(255,255,255,0.15)',
                                                    '&.Mui-checked': { color: colors.accent },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ p: 0 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleGroup(group.id)}
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '6px',
                                                    color: colors.textMuted,
                                                    transition: 'all 150ms ease',
                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                                                }}
                                            >
                                                <ChevronDown size={14} />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={group.type === 'installment' ? 'Parcelado' : 'Recorrente'}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    bgcolor: group.type === 'installment' ? colors.purpleBg : 'rgba(59, 130, 246, 0.1)',
                                                    color: group.type === 'installment' ? colors.purple : '#3B82F6',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: colors.textPrimary,
                                            }}>
                                                {group.mainTransaction.description}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                                {group.items.length} itens
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label="Sem categoria"
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    bgcolor: 'rgba(255,255,255,0.03)',
                                                    color: colors.textMuted,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={group.isAllPaid ? 'Pago' : 'Pendente'}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '11px',
                                                    borderRadius: '4px',
                                                    bgcolor: group.isAllPaid ? colors.greenBg : colors.yellowBg,
                                                    color: group.isAllPaid ? colors.green : colors.yellow,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{
                                                fontSize: '14px',
                                                fontFamily: '"Plus Jakarta Sans"',
                                                fontWeight: 600,
                                                color: group.isAllPaid ? colors.green : colors.accent,
                                            }}>
                                                {formatBRL(group.totalAmount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ p: 0 }} colSpan={8}>
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <Table size="small">
                                                    <TableBody>
                                                        {group.items.map(t => (
                                                            <TransactionRow
                                                                key={t.id}
                                                                transaction={t}
                                                                isChild
                                                                selectedIds={selectedIds}
                                                                handleSelectRow={handleSelectRow}
                                                                handleTogglePaid={handleTogglePaid}
                                                                handleOpenMenu={handleOpenMenu}
                                                                isPendingToggle={isPendingToggle?.(t.id)}
                                                            />
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            );
                        }
                        return (
                            <TransactionRow
                                key={(item as Transaction).id}
                                transaction={item as Transaction}
                                selectedIds={selectedIds}
                                handleSelectRow={handleSelectRow}
                                handleTogglePaid={handleTogglePaid}
                                handleOpenMenu={handleOpenMenu}
                                isPendingToggle={isPendingToggle?.((item as Transaction).id)}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
