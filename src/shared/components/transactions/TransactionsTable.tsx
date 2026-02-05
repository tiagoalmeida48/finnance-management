import { Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, TableSortLabel, Paper, Collapse, Typography, IconButton } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction } from '../../services/transactions.service';
import { TransactionRow } from './TransactionRow';
import { TransactionGroup } from '../../hooks/useTransactionsPageLogic';

interface TransactionsTableProps {
    groupedTransactions: (Transaction | TransactionGroup)[];
    selectedIds: string[];
    handleSelectAll: (checked: boolean) => void;
    handleSelectRow: (id: string) => void;
    handleTogglePaid: (t: Transaction) => void;
    handleOpenMenu: (e: React.MouseEvent<HTMLElement>, t: Transaction) => void;
    handleSort: (field: any) => void;
    sortConfig: { field: string, direction: 'asc' | 'desc' };
    expandedGroups: Record<string, boolean>;
    toggleGroup: (id: string) => void;
    isPendingToggle?: (id: string) => boolean;
}

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
    isPendingToggle
}: TransactionsTableProps) {
    const renderPrice = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

    return (
        <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox size="small" onChange={(e) => handleSelectAll(e.target.checked)} />
                        </TableCell>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell>
                            <TableSortLabel active={sortConfig.field === 'payment_date'} direction={sortConfig.direction} onClick={() => handleSort('payment_date')}>
                                Data
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Pagamento</TableCell>
                        <TableCell align="right">
                            <TableSortLabel active={sortConfig.field === 'amount'} direction={sortConfig.direction} onClick={() => handleSort('amount')}>
                                Valor
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
                                    <TableRow sx={{ bgcolor: 'rgba(212, 175, 55, 0.03)', borderLeft: '3px solid #D4AF37' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                checked={group.items.every(it => selectedIds.includes(it.id))}
                                                onChange={(e) => group.items.forEach(it => {
                                                    if (e.target.checked && !selectedIds.includes(it.id)) handleSelectRow(it.id);
                                                    if (!e.target.checked && selectedIds.includes(it.id)) handleSelectRow(it.id);
                                                })}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ p: 0 }}>
                                            <IconButton size="small" onClick={() => toggleGroup(group.id)}>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                            {group.type === 'installment' ? 'Parcelado' : 'Recorrente'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{group.mainTransaction.description}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {group.items.length} itens • {group.isAllPaid ? 'Pago' : 'Pendente'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: group.isAllPaid ? 'success.main' : 'primary.main' }}>
                                                {renderPrice(group.totalAmount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
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
                                    </Collapse>
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
