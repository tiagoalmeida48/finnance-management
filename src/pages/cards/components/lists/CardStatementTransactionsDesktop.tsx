import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Container } from "@/shared/components/layout/Container";
import { Row } from "@/shared/components/layout/Row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/components/layout/Table";
import { Text } from "@/shared/components/ui/Text";
import type { StatementTransaction } from "@/shared/interfaces/card-details.interface";
import { messages } from "@/shared/i18n/messages";
import type {
  StatementSortDirection,
  StatementSortField,
} from "@/pages/cards/hooks/useCardStatementListLogic";
import {
  formatCardStatementCurrency,
  getStatementDisplayDateKey,
} from "@/pages/cards/hooks/useCardStatementListLogic";

interface CardStatementTransactionsDesktopProps {
  transactions: StatementTransaction[];
  statementSortField: StatementSortField;
  statementSortDirection: StatementSortDirection;
  onSort: (field: StatementSortField) => void;
  onEditTransaction?: (transaction: StatementTransaction) => void;
  setCategoryDotRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

const sortableHeaderClass =
  "inline-flex items-center gap-1 font-bold tracking-[0.03em]";

export function CardStatementTransactionsDesktop({
  transactions,
  statementSortField,
  statementSortDirection,
  onSort,
  onEditTransaction,
  setCategoryDotRef,
  fallbackCategoryColor,
}: CardStatementTransactionsDesktopProps) {
  const statementMessages = messages.cards.statementList;

  return (
    <Table>
      <TableHead>
        <TableRow className="bg-[var(--overlay-white-02)]">
          <SortHeaderCell
            active={statementSortField === "payment_date"}
            direction={statementSortDirection}
            onClick={() => onSort("payment_date")}
            label={statementMessages.dateColumn}
          />
          <SortHeaderCell
            active={statementSortField === "description"}
            direction={statementSortDirection}
            onClick={() => onSort("description")}
            label={statementMessages.descriptionColumn}
          />
          <SortHeaderCell
            active={statementSortField === "category"}
            direction={statementSortDirection}
            onClick={() => onSort("category")}
            label={statementMessages.categoryColumn}
          />
          <SortHeaderCell
            active={statementSortField === "amount"}
            direction={statementSortDirection}
            onClick={() => onSort("amount")}
            label={statementMessages.amountColumn}
            align="right"
          />
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => (
          <StatementDesktopRow
            key={transaction.id}
            transaction={transaction}
            onEditTransaction={onEditTransaction}
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
  setCategoryDotRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

function StatementDesktopRow({
  transaction,
  onEditTransaction,
  setCategoryDotRef,
  fallbackCategoryColor,
}: StatementDesktopRowProps) {
  const statementMessages = messages.cards.statementList;
  const displayDate = getStatementDisplayDateKey(transaction);
  const categoryColor = transaction.category?.color || fallbackCategoryColor;

  return (
    <TableRow
      onClick={() => onEditTransaction?.(transaction)}
      className="cursor-pointer transition-colors hover:bg-white/5"
    >
      <TableCell>
        {displayDate
          ? format(new Date(`${displayDate}T12:00:00`), "dd/MM")
          : "-"}
      </TableCell>
      <TableCell className="text-[var(--color-text-primary)]">
        {transaction.description}
        {transaction.installment_number && transaction.total_installments ? (
          <Text
            as="span"
            className="ml-1 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            {transaction.installment_number}/{transaction.total_installments}
          </Text>
        ) : null}
      </TableCell>
      <TableCell>
        <Row className="items-center gap-1">
          <Container
            unstyled
            ref={(node) => setCategoryDotRef(node, categoryColor)}
            className="h-2 w-2 rounded-sm"
          />
          <Text
            as="span"
            className="text-sm text-[var(--color-text-secondary)]"
          >
            {transaction.category?.name || statementMessages.noCategory}
          </Text>
        </Row>
      </TableCell>
      <TableCell
        className={`text-right font-semibold ${transaction.type === "income" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
      >
        {formatCardStatementCurrency(transaction.amount)}
      </TableCell>
    </TableRow>
  );
}

interface SortHeaderCellProps {
  active: boolean;
  direction: StatementSortDirection;
  onClick: () => void;
  label: string;
  align?: "left" | "right";
}

function SortHeaderCell({
  active,
  direction,
  onClick,
  label,
  align,
}: SortHeaderCellProps) {
  return (
    <TableHeaderCell className={align === "right" ? "text-right" : undefined}>
      <Button
        type="button"
        variant="text"
        size="small"
        onClick={onClick}
        className={`${sortableHeaderClass} ${active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
      >
        {label}
        <Text as="span" className={active ? "opacity-100" : "opacity-35"}>
          {direction === "asc" ? "↑" : "↓"}
        </Text>
      </Button>
    </TableHeaderCell>
  );
}
