import { Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Checkbox, Paper, Typography, IconButton, Chip, TablePagination, Box, LinearProgress, Stack, Collapse } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';
import { TransactionRow } from './TransactionRow';
import type { TransactionGroup } from '../../hooks/transactionsPage.utils';
import { colors } from '@/shared/theme';
import { TransactionsTableHeader } from './TransactionsTableHeader';

interface TransactionsTableProps {
    groupedTransactions: (Transaction | TransactionGroup)[];
    totalItems: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    selectedIds: string[];
    handleSelectAll: (checked: boolean) => void;
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    handleSort: (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method' | 'installment_progress') => void;
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
    accountFilter: string;
    setAccountFilter: (val: string) => void;
    cardFilter: string;
    setCardFilter: (val: string) => void;
    categories?: { id: string, name: string }[];
    accounts?: { id: string, name: string }[];
    cards?: { id: string, name: string }[];
}

export function TransactionsTable({
    groupedTransactions,
    totalItems,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
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
    accountFilter,
    setAccountFilter,
    cardFilter,
    setCardFilter,
    categories,
    accounts,
    cards,
}: TransactionsTableProps) {
    const formatBRL = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const visibleTransactionIds = groupedTransactions.flatMap((item) =>
        'isGroup' in item && item.isGroup
            ? item.items.map((transaction) => transaction.id)
            : [item.id]
    );

    const selectedVisibleCount = visibleTransactionIds.filter((id) => selectedIds.includes(id)).length;
    const selectAllChecked = visibleTransactionIds.length > 0 && selectedVisibleCount === visibleTransactionIds.length;
    const selectAllIndeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleTransactionIds.length;


    return (
        <TableContainer component={Paper} sx={{
            bgcolor: colors.bgCard,
            backgroundImage: 'none',
            border: `1px solid ${colors.border}`,
            boxShadow: 'none',
            minHeight: 360,
        }}>
            <Table size="small" sx={{ bgcolor: colors.bgCard }}>
                <TransactionsTableHeader
                    selectAllChecked={selectAllChecked}
                    selectAllIndeterminate={selectAllIndeterminate}
                    handleSelectAll={handleSelectAll}
                    handleSort={handleSort}
                    sortConfig={sortConfig}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    paymentMethodFilter={paymentMethodFilter}
                    setPaymentMethodFilter={setPaymentMethodFilter}
                    accountFilter={accountFilter}
                    setAccountFilter={setAccountFilter}
                    cardFilter={cardFilter}
                    setCardFilter={setCardFilter}
                    categories={categories}
                    accounts={accounts}
                    cards={cards}
                />
                <TableBody>
                    {groupedTransactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 6, color: colors.textMuted, bgcolor: colors.bgCard }}>
                                Nenhuma transação encontrada para os filtros atuais.
                            </TableCell>
                        </TableRow>
                    )}
                    {groupedTransactions.map((item) => {
                        if ('isGroup' in item && item.isGroup) {
                            const group = item as TransactionGroup;
                            const isExpanded = Boolean(expandedGroups[group.id]);
                            return (
                                <Fragment key={group.id}>
                                    <TableRow sx={{
                                        bgcolor: colors.bgSecondary,
                                        minHeight: 56,
                                        borderLeft: `3px solid ${colors.purple}`,
                                        '& > .MuiTableCell-root': {
                                            py: 1.75,
                                            borderBottom: `1px solid ${colors.border}`,
                                        },
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
                                        <TableCell sx={{ width: 48, p: 0 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleGroup(group.id)}
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '6px',
                                                    color: colors.textMuted,
                                                    transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                                                }}
                                            >
                                                <ChevronDown size={14} />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ width: 100 }}>
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
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: colors.textPrimary,
                                                }}>
                                                    {group.mainTransaction.description}
                                                </Typography>
                                                <Chip
                                                    label={`${group.totalItemsCount} ${group.totalItemsCount === 1 ? 'parcela' : 'parcelas'}`}
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        borderRadius: '4px',
                                                        bgcolor: 'rgba(255,255,255,0.06)',
                                                        color: colors.textSecondary,
                                                    }}
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {group.categoryName ? (
                                                <Chip
                                                    label={group.categoryName}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        bgcolor: group.categoryColor ? `${group.categoryColor}15` : 'rgba(255,255,255,0.05)',
                                                        color: group.categoryColor || colors.textSecondary,
                                                    }}
                                                />
                                            ) : (
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
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                color: colors.textPrimary,
                                                lineHeight: '22px',
                                            }}>
                                                {group.mainTransaction.payment_method === 'money' && 'Dinheiro:'}
                                                {group.mainTransaction.payment_method === 'debit' && 'Débito: '}
                                                {group.mainTransaction.payment_method === 'credit' && 'Crédito: '}
                                                {group.mainTransaction.payment_method === 'pix' && 'PIX: '}
                                                {!group.mainTransaction.payment_method && (group.mainTransaction.card_id ? 'Cartão: ' : 'Conta: ')}
                                                {(group.mainTransaction.credit_card?.name || group.mainTransaction.bank_account?.name) && (
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontSize: '13px',
                                                            color: group.mainTransaction.credit_card?.color || colors.textMuted,
                                                        }}
                                                    >
                                                        {group.mainTransaction.credit_card?.name || group.mainTransaction.bank_account?.name}
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 220 }}>
                                                <Box sx={{ minWidth: 150, maxWidth: 240, width: '100%' }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={group.paidItemsPercent}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 99,
                                                            bgcolor: 'rgba(255,255,255,0.08)',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 99,
                                                                bgcolor: colors.accent,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Typography sx={{ fontSize: '11px', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                                                    {group.paidItemsCount}/{group.totalItemsCount} ({group.paidItemsPercent}%)
                                                </Typography>
                                            </Stack>
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
                                    <TableRow sx={{ p: 0, '& > .MuiTableCell-root': { p: 0, borderBottom: 'none' } }}>
                                        <TableCell colSpan={9} sx={{ p: 0 }}>
                                            <Collapse in={isExpanded} timeout={250} unmountOnExit>
                                                <Table size="small" sx={{ bgcolor: colors.bgCard }}>
                                                    <TableBody>
                                                        {group.items.map((t) => (
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
            <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={(_, newPage) => onPageChange(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
                rowsPerPageOptions={[50, 100, 200, 300, { label: 'Tudo', value: -1 }]}
                labelRowsPerPage="Itens por página"
                labelDisplayedRows={({ count, page: currentPage }) => {
                    const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(count / rowsPerPage));
                    const safeCurrentPage = Math.min(currentPage + 1, totalPages);
                    return `Página ${safeCurrentPage} de ${totalPages}`;
                }}
                sx={{
                    borderTop: `1px solid ${colors.border}`,
                    bgcolor: colors.bgCard,
                    color: colors.textSecondary,
                    '& .MuiTablePagination-selectIcon': { color: colors.textMuted },
                    '& .MuiTablePagination-toolbar': { minHeight: 52 },
                    '& .MuiIconButton-root': {
                        color: colors.textSecondary,
                        '&.Mui-disabled': { color: 'rgba(255,255,255,0.24)' },
                    },
                }}
            />
        </TableContainer>
    );
}
