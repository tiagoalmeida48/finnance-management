import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CollectionState } from '@/shared/components/composite/CollectionState';
import { Heading } from '@/shared/components/ui/Heading';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { Text } from '@/shared/components/ui/Text';
import { useCardStatementListLogic } from '@/pages/cards/hooks/useCardStatementListLogic';
import type {
  CardStatement,
  StatementTransaction,
} from '@/shared/interfaces/card-details.interface';
import { colors } from '@/shared/theme';
import { CardStatementMonthCard } from '../cards/CardStatementMonthCard';
import { Container } from '@/shared/components/layout/Container';

interface CardStatementListProps {
  cardId: string;
  statements: CardStatement[];
  handleOpenPayModal: (statement: CardStatement) => void;
  onEditTransaction?: (transaction: StatementTransaction) => void;
}

export function CardStatementList({
  cardId,
  statements,
  handleOpenPayModal,
  onEditTransaction,
}: CardStatementListProps) {
  const {
    statementMessages,
    isMobile,
    reprocessInvoices,
    handleReprocessClick,
    statementSortField,
    statementSortDirection,
    handleStatementSort,
    statementItems,
    toggleExpandedMonth,
    setCategoryDotRef,
    setCategoryIconRef,
    isEmpty,
  } = useCardStatementListLogic({ cardId, statements });

  return (
    <>
      <Row className="mb-3 items-center justify-between">
        <Row className="items-center gap-2">
          <Container unstyled className="rounded-lg bg-[var(--overlay-primary-12)] p-1">
            <Calendar size={18} color={colors.accent} />
          </Container>
          <Heading level={3} className="text-lg font-bold text-[var(--color-text-primary)]">
            {statementMessages.title}
          </Heading>
        </Row>
        <Button
          type="button"
          startIcon={
            reprocessInvoices.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )
          }
          onClick={handleReprocessClick}
          disabled={reprocessInvoices.isPending}
          size="small"
          variant="text"
        >
          {reprocessInvoices.isPending ? statementMessages.updating : statementMessages.recalculate}
        </Button>
      </Row>

      <Stack className="gap-2">
        <CollectionState
          isLoading={false}
          isEmpty={isEmpty}
          emptyFallback={
            <Container
              unstyled
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center"
            >
              <Text className="text-[var(--color-text-secondary)]">
                {statementMessages.noStatements}
              </Text>
            </Container>
          }
        >
          {statementItems.map((item) => (
            <CardStatementMonthCard
              key={item.statement.monthKey}
              statement={item.statement}
              isExpanded={item.isExpanded}
              onToggleExpand={() => toggleExpandedMonth(item.statement.monthKey)}
              status={item.status}
              isMobile={isMobile}
              statementSortField={statementSortField}
              statementSortDirection={statementSortDirection}
              onSort={handleStatementSort}
              transactions={item.transactions}
              onPay={() => handleOpenPayModal(item.statement)}
              onEditTransaction={onEditTransaction}
              setCategoryDotRef={setCategoryDotRef}
              setCategoryIconRef={setCategoryIconRef}
              fallbackCategoryColor={colors.textMuted}
            />
          ))}
        </CollectionState>
      </Stack>
    </>
  );
}
