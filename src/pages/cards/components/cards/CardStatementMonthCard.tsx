import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Row } from '@/shared/components/layout/Row';
import { Text } from '@/shared/components/ui/Text';
import { messages } from '@/shared/i18n/messages';
import type {
  CardStatement,
  StatementTransaction,
} from '@/shared/interfaces/card-details.interface';
import type {
  StatementSortDirection,
  StatementSortField,
  StatementStatusBadge,
} from '@/pages/cards/hooks/useCardStatementListLogic';
import { formatCardStatementCurrency } from '@/pages/cards/hooks/useCardStatementListLogic';
import { CardStatementTransactionsDesktop } from '../lists/CardStatementTransactionsDesktop';
import { CardStatementTransactionsMobile } from '../lists/CardStatementTransactionsMobile';
import { Container } from '@/shared/components/layout/Container';

interface CardStatementMonthCardProps {
  statement: CardStatement;
  isExpanded: boolean;
  onToggleExpand: () => void;
  status: StatementStatusBadge;
  isMobile: boolean;
  statementSortField: StatementSortField;
  statementSortDirection: StatementSortDirection;
  onSort: (field: StatementSortField) => void;
  transactions: StatementTransaction[];
  onPay: () => void;
  onEditTransaction?: (transaction: StatementTransaction) => void;
  setCategoryDotRef: (node: HTMLDivElement | null, color: string) => void;
  setCategoryIconRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

export function CardStatementMonthCard({
  statement,
  isExpanded,
  onToggleExpand,
  status,
  isMobile,
  statementSortField,
  statementSortDirection,
  onSort,
  transactions,
  onPay,
  onEditTransaction,
  setCategoryDotRef,
  setCategoryIconRef,
  fallbackCategoryColor,
}: CardStatementMonthCardProps) {
  const statementMessages = messages.cards.statementList;

  return (
    <Container
      unstyled
      className="group/card relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
    >
      <Button
        type="button"
        variant="text"
        size="small"
        onClick={onToggleExpand}
        className="flex w-full items-center p-4 text-left transition-colors hover:bg-white/5 data-[state=open]:bg-white/5"
      >
        <Container unstyled className="grid w-full items-center gap-3 md:grid-cols-12">
          <Container unstyled className="md:col-span-4">
            <Row className="items-center gap-3">
              <Container
                unstyled
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--color-text-secondary)] transition-transform duration-300 group-hover/card:bg-white/10 group-hover/card:text-white"
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </Container>
              <Text as="span" className="text-[16px] font-heading font-bold capitalize text-white">
                {statement.month}
              </Text>
              <Text
                as="span"
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${status.className}`}
              >
                {status.label}
              </Text>
              {!isMobile ? (
                <Text as="span" className="text-xs text-[var(--color-text-muted)]">
                  {statementMessages.items(statement.transactions?.length || 0)}
                </Text>
              ) : null}
            </Row>
          </Container>

          <Container unstyled className="md:col-span-8">
            <Row className="items-center justify-between gap-3 md:justify-end">
              {isMobile ? (
                <Text as="span" className="text-[13px] font-medium text-[var(--color-text-muted)]">
                  {statementMessages.items(statement.transactions?.length || 0)}
                </Text>
              ) : null}

              <Row className="items-center gap-4">
                <Text
                  as="span"
                  className={`font-heading text-[18px] font-black tracking-tight ${statement.unpaidTotal > 0 ? 'text-white' : 'text-[var(--color-success)] drop-shadow-[0_0_8px_rgba(0,200,83,0.3)]'}`}
                >
                  {formatCardStatementCurrency(statement.total)}
                </Text>
                {statement.unpaidTotal > 0 ? (
                  <Button
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPay();
                    }}
                    className="h-8 rounded-lg bg-[var(--color-primary)] px-4 text-[13px] font-bold text-black shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] transition-all hover:scale-105 hover:bg-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)] active:scale-95"
                  >
                    {statementMessages.pay}
                  </Button>
                ) : null}
              </Row>
            </Row>
          </Container>
        </Container>
      </Button>

      {isExpanded ? (
        <Container unstyled className="border-t border-white/5 bg-white/[0.01] p-0">
          {isMobile ? (
            <CardStatementTransactionsMobile
              transactions={transactions}
              onEditTransaction={onEditTransaction}
              setCategoryIconRef={setCategoryIconRef}
              fallbackCategoryColor={fallbackCategoryColor}
            />
          ) : (
            <CardStatementTransactionsDesktop
              transactions={transactions}
              statementSortField={statementSortField}
              statementSortDirection={statementSortDirection}
              onSort={onSort}
              onEditTransaction={onEditTransaction}
              setCategoryDotRef={setCategoryDotRef}
              fallbackCategoryColor={fallbackCategoryColor}
            />
          )}
        </Container>
      ) : null}
    </Container>
  );
}
