import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { useReprocessInvoices } from '@/shared/hooks/api/useCreditCards';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type {
  CardStatement,
  StatementTransaction,
} from '@/shared/interfaces/card-details.interface';
import { messages } from '@/shared/i18n/messages';

export type StatementSortField = 'payment_date' | 'description' | 'category' | 'amount';
export type StatementSortDirection = 'asc' | 'desc';

export interface StatementStatusBadge {
  label: string;
  className: string;
}

export const getStatementDisplayDateKey = (transaction: StatementTransaction) =>
  transaction.purchase_date || transaction.payment_date;

import { formatCurrency } from '@/shared/utils/currency';

export const formatCardStatementCurrency = (value: number) => formatCurrency(value);

interface UseCardStatementListLogicParams {
  cardId: string;
  statements: CardStatement[];
}

const getSortableCategoryName = (categoryName: string | null | undefined) =>
  (categoryName && categoryName.trim().length > 0
    ? categoryName
    : messages.cards.statementList.noCategory
  ).toLowerCase();

export function useCardStatementListLogic({ cardId, statements }: UseCardStatementListLogicParams) {
  const statementMessages = messages.cards.statementList;
  const isMobile = useMediaQuery('(max-width: 899px)');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [statementSortField, setStatementSortField] = useState<StatementSortField>('payment_date');
  const [statementSortDirection, setStatementSortDirection] =
    useState<StatementSortDirection>('desc');
  const reprocessInvoices = useReprocessInvoices(cardId);

  const setCategoryDotRef = useCallback((node: HTMLDivElement | null, color: string) => {
    if (!node) return;
    node.style.setProperty('background-color', color);
  }, []);

  const setCategoryIconRef = useCallback((node: HTMLDivElement | null, color: string) => {
    if (!node) return;
    node.style.setProperty('background-color', `${color}15`);
  }, []);

  const handleReprocess = useCallback(() => {
    reprocessInvoices.mutate('1900-01-01');
  }, [reprocessInvoices]);

  const handleReprocessClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleReprocess();
    },
    [handleReprocess],
  );

  const getStatusBadge = useCallback(
    (statement: CardStatement): StatementStatusBadge => {
      if (statement.unpaidTotal > 0) {
        return {
          label: statementMessages.statusOpen,
          className:
            'bg-[var(--color-warning)]/10 text-[var(--color-warning)] ring-1 ring-inset ring-[var(--color-warning)]/20 shadow-[0_0_12px_rgba(255,166,0,0.15)]',
        };
      }
      return {
        label: statementMessages.statusPaid,
        className:
          'bg-[var(--color-success)]/10 text-[var(--color-success)] ring-1 ring-inset ring-[var(--color-success)]/20 shadow-[0_0_12px_rgba(0,200,83,0.15)]',
      };
    },
    [statementMessages.statusOpen, statementMessages.statusPaid],
  );

  const handleStatementSort = useCallback(
    (field: StatementSortField) => {
      if (statementSortField === field) {
        setStatementSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setStatementSortField(field);
      setStatementSortDirection('asc');
    },
    [statementSortField],
  );

  const getSortedStatementTransactions = useCallback(
    (transactions: CardStatement['transactions']) => {
      const sorted = [...transactions];

      sorted.sort((left, right) => {
        let comparison = 0;

        if (statementSortField === 'payment_date') {
          const leftDateKey = getStatementDisplayDateKey(left) || '';
          const rightDateKey = getStatementDisplayDateKey(right) || '';
          comparison = leftDateKey.localeCompare(rightDateKey);
        } else if (statementSortField === 'description') {
          comparison = left.description.localeCompare(right.description, 'pt-BR', {
            sensitivity: 'base',
          });
        } else if (statementSortField === 'category') {
          comparison = getSortableCategoryName(left.category?.name).localeCompare(
            getSortableCategoryName(right.category?.name),
            'pt-BR',
            { sensitivity: 'base' },
          );
        } else {
          comparison = left.amount - right.amount;
        }

        if (comparison === 0) {
          comparison = left.id.localeCompare(right.id);
        }

        return statementSortDirection === 'asc' ? comparison : -comparison;
      });

      return sorted;
    },
    [statementSortDirection, statementSortField],
  );

  const toggleExpandedMonth = useCallback((monthKey: string) => {
    setExpandedMonth((prev) => (prev === monthKey ? null : monthKey));
  }, []);

  const statementItems = useMemo(
    () =>
      statements.map((statement) => ({
        statement,
        isExpanded: expandedMonth === statement.monthKey,
        status: getStatusBadge(statement),
        transactions: getSortedStatementTransactions(statement.transactions || []),
      })),
    [expandedMonth, getSortedStatementTransactions, getStatusBadge, statements],
  );

  return {
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
    isEmpty: statements.length === 0,
  };
}
