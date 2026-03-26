import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingBag } from 'lucide-react';
import type { StatementTransaction } from '@/shared/interfaces/card-details.interface';
import { Row } from '@/shared/components/layout/Row';
import { Text } from '@/shared/components/ui/Text';
import { messages } from '@/shared/i18n/messages';
import {
  formatCardStatementCurrency,
  getStatementDisplayDateKey,
} from '@/pages/cards/hooks/useCardStatementListLogic';
import { Container } from '@/shared/components/layout/Container';

interface CardStatementTransactionsMobileProps {
  transactions: StatementTransaction[];
  onEditTransaction?: (transaction: StatementTransaction) => void;
  setCategoryIconRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
}

export function CardStatementTransactionsMobile({
  transactions,
  onEditTransaction,
  setCategoryIconRef,
  fallbackCategoryColor,
}: CardStatementTransactionsMobileProps) {
  const statementMessages = messages.cards.statementList;

  return (
    <Container unstyled className="divide-y divide-[var(--overlay-white-03)]">
      {transactions.map((transaction) => (
        <StatementMobileRow
          key={transaction.id}
          transaction={transaction}
          onEditTransaction={onEditTransaction}
          setCategoryIconRef={setCategoryIconRef}
          fallbackCategoryColor={fallbackCategoryColor}
          noCategoryLabel={statementMessages.noCategory}
        />
      ))}
    </Container>
  );
}

interface StatementMobileRowProps {
  transaction: StatementTransaction;
  onEditTransaction?: (transaction: StatementTransaction) => void;
  setCategoryIconRef: (node: HTMLDivElement | null, color: string) => void;
  fallbackCategoryColor: string;
  noCategoryLabel: string;
}

function StatementMobileRow({
  transaction,
  onEditTransaction,
  setCategoryIconRef,
  fallbackCategoryColor,
  noCategoryLabel,
}: StatementMobileRowProps) {
  const displayDate = getStatementDisplayDateKey(transaction);
  const categoryColor = transaction.category?.color || fallbackCategoryColor;

  return (
    <Container
      unstyled
      onClick={() => onEditTransaction?.(transaction)}
      className="cursor-pointer p-2 active:bg-white/5"
    >
      <Row className="justify-between gap-2">
        <Container
          unstyled
          ref={(node) => setCategoryIconRef(node, categoryColor)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        >
          <ShoppingBag size={18} color={categoryColor} />
        </Container>

        <Container unstyled className="min-w-0 flex-grow">
          <Text className="mb-0.5 truncate text-sm font-medium text-[var(--color-text-primary)]">
            {transaction.description}
          </Text>
          <Row className="flex-wrap items-center gap-1">
            <Text as="span" className="text-xs text-[var(--color-text-muted)]">
              {displayDate
                ? format(new Date(`${displayDate}T12:00:00`), 'dd/MM', {
                    locale: ptBR,
                  })
                : '-'}
            </Text>
            <Container unstyled className="h-1 w-1 rounded-full bg-[var(--color-text-muted)]" />
            <Text as="span" className="text-xs text-[var(--color-text-secondary)]">
              {transaction.category?.name || noCategoryLabel}
            </Text>
            {transaction.installment_number && transaction.total_installments ? (
              <>
                <Container unstyled className="h-1 w-1 rounded-full bg-[var(--color-text-muted)]" />
                <Text as="span" className="text-xs font-semibold text-[var(--color-text-muted)]">
                  {transaction.installment_number}/{transaction.total_installments}
                </Text>
              </>
            ) : null}
          </Row>
        </Container>

        <Text
          as="span"
          className={`whitespace-nowrap text-sm font-semibold ${
            transaction.type === 'income'
              ? 'text-[var(--color-success)]'
              : 'text-[var(--color-error)]'
          }`}
        >
          {formatCardStatementCurrency(transaction.amount)}
        </Text>
      </Row>
    </Container>
  );
}
