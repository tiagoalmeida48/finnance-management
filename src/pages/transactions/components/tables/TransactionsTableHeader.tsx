import type { Transaction } from '@/shared/services/transactions.service';
import { messages } from '@/shared/i18n/messages';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/button';
import { TableHead, TableHeaderCell, TableRow } from '@/shared/components/layout/Table';
import { Circle, CheckCircle2, MinusCircle } from 'lucide-react';

interface TransactionsTableHeaderProps {
    selectAllChecked: boolean;
    selectAllIndeterminate: boolean;
    handleSelectAll: (checked: boolean) => void;
    handleSort: (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method' | 'installment_progress') => void;
    sortConfig: { field: string; direction: 'asc' | 'desc' };
}

function SortButton({
    active,
    direction,
    label,
    onClick,
}: {
    active: boolean;
    direction: 'asc' | 'desc';
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={onClick}
            className={`inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/5 ${active ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
        >
            {label}
            <Text as="span" className={`text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>{direction === 'asc' ? '↑' : '↓'}</Text>
        </Button>
    );
}

export function TransactionsTableHeader({
    selectAllChecked,
    selectAllIndeterminate,
    handleSelectAll,
    handleSort,
    sortConfig,
}: TransactionsTableHeaderProps) {
    const isActiveSort = (field: string) => sortConfig.field === field;

    return (
        <TableHead>
            <TableRow className="border-b border-white/5 bg-transparent">
                <TableHeaderCell className="w-10 border-b-0 px-2 py-2 text-left">
                    <button
                        type="button"
                        onClick={() => handleSelectAll(!selectAllChecked)}
                        className={`flex h-5 w-5 items-center justify-center rounded transition-all ${selectAllChecked || selectAllIndeterminate
                                ? 'text-[var(--color-warning)] hover:brightness-75 hover:bg-[var(--color-warning)]/10'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                            }`}
                    >
                        {selectAllChecked ? (
                            <CheckCircle2 size={16} />
                        ) : selectAllIndeterminate ? (
                            <MinusCircle size={16} />
                        ) : (
                            <Circle size={16} />
                        )}
                    </button>
                </TableHeaderCell>
                <TableHeaderCell className="w-10 border-b-0 p-0" />
                <TableHeaderCell className="border-b-0 px-2 py-2 text-left">
                    <SortButton
                        active={isActiveSort('payment_date')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('payment_date')}
                        label={messages.transactions.tableHeader.date}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="border-b-0 px-2 py-2 text-left">
                    <SortButton
                        active={isActiveSort('description')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('description')}
                        label={messages.transactions.tableHeader.description}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="border-b-0 px-2 py-2 text-left">
                    <SortButton
                        active={isActiveSort('category_id')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('category_id')}
                        label={messages.transactions.tableHeader.category}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="border-b-0 px-2 py-2 text-left">
                    <SortButton
                        active={isActiveSort('payment_method')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('payment_method')}
                        label={messages.transactions.tableHeader.payment}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="border-b-0 px-2 py-2 text-left">
                    <SortButton
                        active={isActiveSort('installment_progress')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('installment_progress')}
                        label={messages.transactions.tableHeader.progress}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="border-b-0 px-2 py-2 text-right">
                    <SortButton
                        active={isActiveSort('amount')}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('amount')}
                        label={messages.transactions.tableHeader.amount}
                    />
                </TableHeaderCell>
                <TableHeaderCell className="w-10 border-b-0 p-0" />
            </TableRow>
        </TableHead>
    );
}




