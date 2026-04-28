import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Container } from '@/shared/components/layout/Container';
import { Row } from '@/shared/components/layout/Row';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/layout/Table';
import { Text } from '@/shared/components/ui/Text';
import type { StatementTransaction } from '@/shared/interfaces/card-details.interface';
import { messages } from '@/shared/i18n/messages';
import type {
  StatementSortDirection,
  StatementSortField,
} from '@/pages/cards/hooks/useCardStatementListLogic';
import {
  formatCardStatementCurrency,
  getStatementDisplayDateKey,
} from '@/pages/cards/hooks/useCardStatementListLogic';

interface CardStatementTransactionsDesktopProps {
  transactions: StatementTransaction[];
  statementSortField: StatementSortField;
  statementSortDirection: StatementSortDirection;
  onSort: (field: StatementSortField) => void;
  onEditTransaction?: (transaction: StatementTransaction) => void;
  onDeleteTransaction?: (transaction: StatementTransaction) => void;
  setCategoryDotRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

const sortableHeaderClass = 'inline-flex items-center gap-1 font-bold tracking-[0.03em]';

export function CardStatementTransactionsDesktop({
  transactions,
  statementSortField,
  statementSortDirection,
  onSort,
  onEditTransaction,
  onDeleteTransaction,
  setCategoryDotRef,
  fallbackCategoryColor,
}: CardStatementTransactionsDesktopProps) {
  const statementMessages = messages.cards.statementList;

  return (
    <Table>
      <TableHead>
        <TableRow className="bg-gradient-to-r from-[var(--overlay-white-03)] to-transparent">
          <SortHeaderCell
            active={statementSortField === 'payment_date'}
            direction={statementSortDirection}
            onClick={() => onSort('payment_date')}
            label={statementMessages.dateColumn}
          />
          <SortHeaderCell
            active={statementSortField === 'description'}
            direction={statementSortDirection}
            onClick={() => onSort('description')}
            label={statementMessages.descriptionColumn}
          />
          <SortHeaderCell
            active={statementSortField === 'category'}
            direction={statementSortDirection}
            onClick={() => onSort('category')}
            label={statementMessages.categoryColumn}
          />
          <SortHeaderCell
            active={statementSortField === 'amount'}
            direction={statementSortDirection}
            onClick={() => onSort('amount')}
            label={statementMessages.amountColumn}
            align="right"
          />
          <TableHeaderCell className="w-8" />
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => (
          <StatementDesktopRow
            key={transaction.id}
            transaction={transaction}
            onEditTransaction={onEditTransaction}
            onDeleteTransaction={onDeleteTransaction}
            setCategoryDotRef={setCategoryDotRef}
            fallbackCategoryColor={fallbackCategoryColor}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface StatementDesktopRowProps {
  transaction: StatementTransaction;
  onEditTransaction?: (transaction: StatementTransaction) => void;
  onDeleteTransaction?: (transaction: StatementTransaction) => void;
  setCategoryDotRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

function StatementDesktopRow({
  transaction,
  onEditTransaction,
  onDeleteTransaction,
  setCategoryDotRef,
  fallbackCategoryColor,
}: StatementDesktopRowProps) {
  const statementMessages = messages.cards.statementList;
  const displayDate = getStatementDisplayDateKey(transaction);
  const categoryColor = transaction.category?.color || fallbackCategoryColor;

  return (
    <TableRow className="group/row border-b border-[var(--color-border)] transition-colors hover:bg-white/[0.03]">
      <TableCell onClick={() => onEditTransaction?.(transaction)} className="cursor-pointer text-[var(--color-text-muted)] text-[13px] tabular-nums">
        {displayDate ? format(new Date(`${displayDate}T12:00:00`), 'dd/MM') : '-'}
      </TableCell>
      <TableCell onClick={() => onEditTransaction?.(transaction)} className="cursor-pointer">
        <span className="text-[13.5px] font-medium text-[var(--color-text-primary)]">
          {transaction.description}
        </span>
        {transaction.installment_number && transaction.total_installments ? (
          <Text as="span" className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
            {transaction.installment_number}/{transaction.total_installments}
          </Text>
        ) : null}
      </TableCell>
      <TableCell onClick={() => onEditTransaction?.(transaction)} className="cursor-pointer">
        <Row className="items-center gap-1.5">
          <Container
            unstyled
            ref={(node) => setCategoryDotRef(node, categoryColor)}
            className="h-2 w-2 shrink-0 rounded-sm"
          />
          <Text as="span" className="text-[13px] text-[var(--color-text-secondary)]">
            {transaction.category?.name || statementMessages.noCategory}
          </Text>
        </Row>
      </TableCell>
      <TableCell
        onClick={() => onEditTransaction?.(transaction)}
        className={`cursor-pointer text-right text-[13.5px] font-bold tabular-nums ${transaction.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
      >
        {formatCardStatementCurrency(transaction.amount)}
      </TableCell>
      <TableCell className="w-8 text-center">
        {onDeleteTransaction && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteTransaction(transaction); }}
            className="rounded-md p-1 text-[var(--color-text-muted)] opacity-0 transition-all group-hover/row:opacity-100 hover:bg-[var(--overlay-error-10)] hover:text-[var(--color-error)]"
            title="Deletar transação"
          >
            <Trash2 size={14} />
          </button>
        )}
      </TableCell>
    </TableRow>
  );
}

interface SortHeaderCellProps {
  active: boolean;
  direction: StatementSortDirection;
  onClick: () => void;
  label: string;
  align?: 'left' | 'right';
}

function SortHeaderCell({ active, direction, onClick, label, align }: SortHeaderCellProps) {
  return (
    <TableHeaderCell className={align === 'right' ? 'text-right' : undefined}>
      <Button
        type="button"
        variant="text"
        size="small"
        onClick={onClick}
        className={`${sortableHeaderClass} ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
      >
        {label}
        <Text as="span" className={active ? 'opacity-100' : 'opacity-35'}>
          {direction === 'asc' ? '↑' : '↓'}
        </Text>
      </Button>
    </TableHeaderCell>
  );
}
