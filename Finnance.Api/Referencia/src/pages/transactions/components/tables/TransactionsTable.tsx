import { Fragment } from 'react';
import { IconButton } from '@/shared/components/ui/icon-button';
import { ChevronDown, Circle, CheckCircle2, MinusCircle } from 'lucide-react';
import { Transaction } from '@/shared/services/transactions.service';
import { TransactionRow } from './TransactionRow';
import type { TransactionGroup } from '@/shared/utils/transactionsPage.utils';
import { colors } from '@/shared/theme';
import { TransactionsTableHeader } from './TransactionsTableHeader';
import { TransactionMobileCard } from '../cards/TransactionMobileCard';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { messages } from '@/shared/i18n/messages';
import { PaginationBar } from './PaginationBar';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Table, TableBody, TableCell, TableRow } from '@/shared/components/layout/Table';

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
  handleSort: (
    field:
      | keyof Transaction
      | 'amount'
      | 'payment_date'
      | 'is_paid'
      | 'payment_method'
      | 'installment_progress',
  ) => void;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
  expandedGroups: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  isPendingToggle?: (id: string) => boolean;
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
}: TransactionsTableProps) {
  const formatBRL = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const visibleTransactionIds = groupedTransactions.flatMap((item) =>
    'isGroup' in item && item.isGroup ? item.items.map((transaction) => transaction.id) : [item.id],
  );

  const selectedVisibleCount = visibleTransactionIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const selectAllChecked =
    visibleTransactionIds.length > 0 && selectedVisibleCount === visibleTransactionIds.length;
  const selectAllIndeterminate =
    selectedVisibleCount > 0 && selectedVisibleCount < visibleTransactionIds.length;

  const isMobile = useMediaQuery('(max-width: 900px)');
  const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const setCategoryChipRef = (node: HTMLSpanElement | null, color?: string) => {
    if (!node) return;
    node.style.setProperty('background-color', color ? `${color}15` : 'var(--overlay-white-05)');
    node.style.setProperty('color', color || colors.textSecondary);
  };
  const setGroupProgressRef = (node: HTMLDivElement | null, percentage: number) => {
    if (!node) return;
    node.style.setProperty('width', `${percentage}%`);
  };

  if (isMobile) {
    return (
      <Container unstyled>
        <Container unstyled className="mt-2 flex flex-col gap-2">
          {groupedTransactions.length === 0 && (
            <Text className="py-6 text-center text-sm text-[var(--color-text-muted)]">
              {messages.transactions.table.emptyStateMobile}
            </Text>
          )}
          {groupedTransactions.map((item, idx) => (
            <TransactionMobileCard
              key={'id' in item ? item.id : idx}
              item={item}
              selectedIds={selectedIds}
              handleSelectRow={handleSelectRow}
              handleTogglePaid={handleTogglePaid}
              handleOpenMenu={handleOpenMenu}
              isPendingToggle={isPendingToggle}
            />
          ))}
        </Container>
        <PaginationBar
          totalItems={totalItems}
          page={safePage}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Container>
    );
  }

  return (
    <Container
      unstyled
      className="min-h-[360px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]"
    >
      <Table className="w-full border-separate border-spacing-0">
        <TransactionsTableHeader
          selectAllChecked={selectAllChecked}
          selectAllIndeterminate={selectAllIndeterminate}
          handleSelectAll={handleSelectAll}
          handleSort={handleSort}
          sortConfig={sortConfig}
        />
        <TableBody>
          {groupedTransactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-6 text-center text-sm text-[var(--color-text-muted)]"
              >
                {messages.transactions.table.emptyStateDesktop}
              </TableCell>
            </TableRow>
          )}
          {groupedTransactions.map((item) => {
            if ('isGroup' in item && item.isGroup) {
              const group = item as TransactionGroup;
              const isExpanded = Boolean(expandedGroups[group.id]);
              return (
                <Fragment key={group.id}>
                  <TableRow className="min-h-14 border-b border-white/5 border-l-[3px] border-l-[var(--color-primary)] bg-[var(--color-primary)]/5 transition-colors duration-200 hover:bg-[var(--color-primary)]/10">
                    <TableCell className="border-b-0 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          const isAllSelected = group.items.every((it) =>
                            selectedIds.includes(it.id),
                          );
                          group.items.forEach((it) => {
                            if (!isAllSelected && !selectedIds.includes(it.id))
                              handleSelectRow(it.id);
                            if (isAllSelected && selectedIds.includes(it.id))
                              handleSelectRow(it.id);
                          });
                        }}
                        className={`flex h-5 w-5 items-center justify-center rounded transition-all ${
                          group.items.some((it) => selectedIds.includes(it.id))
                            ? 'text-[var(--color-warning)] hover:brightness-75 hover:bg-[var(--color-warning)]/10'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                        }`}
                      >
                        {group.items.every((it) => selectedIds.includes(it.id)) ? (
                          <CheckCircle2 size={16} />
                        ) : group.items.some((it) => selectedIds.includes(it.id)) ? (
                          <MinusCircle size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="w-12 border-b-0 px-1 py-2">
                      <IconButton
                        size="small"
                        onClick={() => toggleGroup(group.id)}
                        className={`h-7 w-7 rounded-md text-[var(--color-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <ChevronDown size={14} />
                      </IconButton>
                    </TableCell>
                    <TableCell className="w-[100px] border-b-0 px-2 py-2">
                      <Text
                        as="span"
                        className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          group.type === 'installment'
                            ? 'bg-[var(--color-purpleBg)] text-[var(--color-secondary)]'
                            : 'bg-[var(--color-blue)]/10 text-[var(--color-blue)]'
                        }`}
                      >
                        {group.type === 'installment'
                          ? messages.transactions.table.groupInstallmentLabel
                          : messages.transactions.table.groupRecurringLabel}
                      </Text>
                    </TableCell>
                    <TableCell className="border-b-0 px-2 py-2">
                      <Container unstyled className="flex items-center gap-2">
                        <Text className="text-[13px] font-semibold text-white">
                          {group.mainTransaction.description}
                        </Text>
                        <Text
                          as="span"
                          className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/70"
                        >
                          {messages.transactions.table.groupItemsCount(group.totalItemsCount)}
                        </Text>
                      </Container>
                    </TableCell>
                    <TableCell className="border-b-0 px-2 py-2">
                      {group.categoryName ? (
                        <Text
                          as="span"
                          ref={(node) => setCategoryChipRef(node, group.categoryColor)}
                          className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        >
                          {group.categoryName}
                        </Text>
                      ) : (
                        <Text
                          as="span"
                          className="inline-flex items-center justify-center rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]"
                        >
                          {messages.transactions.row.noCategory}
                        </Text>
                      )}
                    </TableCell>
                    <TableCell className="border-b-0 px-2 py-2">
                      <Text className="text-[12px] font-medium leading-[20px] text-white">
                        {group.mainTransaction.credit_card?.name ||
                          group.mainTransaction.bank_account?.name ||
                          '-'}
                      </Text>
                    </TableCell>
                    <TableCell className="border-b-0 px-2 py-2">
                      <Container unstyled className="flex min-w-[220px] items-center gap-2">
                        <Container
                          unstyled
                          className="h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10"
                        >
                          <Container
                            unstyled
                            ref={(node) => setGroupProgressRef(node, group.paidItemsPercent)}
                            className="h-full rounded-full bg-[var(--color-accent)]"
                          />
                        </Container>
                        <Text className="whitespace-nowrap text-[11px] text-[var(--color-text-secondary)]">
                          {messages.transactions.table.groupProgress(
                            group.paidItemsCount,
                            group.totalItemsCount,
                            group.paidItemsPercent,
                          )}
                        </Text>
                      </Container>
                    </TableCell>
                    <TableCell
                      className={`min-w-[100px] border-b-0 px-2 py-2 text-right text-[13px] font-bold tracking-tight ${group.isAllPaid ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]'}`}
                    >
                      {formatBRL(group.totalAmount)}
                    </TableCell>
                    <TableCell className="w-12 border-b-0 p-0" />
                  </TableRow>
                  {isExpanded &&
                    group.items.map((t) => (
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

      <PaginationBar
        totalItems={totalItems}
        page={safePage}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Container>
  );
}
