import { useMemo } from 'react';
import type { MouseEvent } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';
import type { CreditCard } from '@/shared/interfaces/credit-card.interface';
import { messages } from '@/shared/i18n/messages';

interface UseCreditCardCardLogicParams {
  card: CreditCard;
  navigate: NavigateFunction;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (card: CreditCard) => void;
}

import { formatCurrency } from '@/shared/utils/currency';

export function useCreditCardCardLogic({
  card,
  navigate,
  onEditCard,
  onDeleteCard,
}: UseCreditCardCardLogicParams) {
  const cardMessages = messages.cards.cardItem;
  const cardColor = card.color || 'var(--color-primary)';
  const dueDay = card.current_statement_cycle?.due_day;
  const closingDay = card.current_statement_cycle?.closing_day;

  const usagePercent =
    card.credit_limit > 0 ? Math.min(((card.usage || 0) / card.credit_limit) * 100, 100) : 0;

  const progressColor =
    usagePercent >= 80
      ? 'var(--color-error)'
      : usagePercent >= 50
        ? 'var(--color-warning)'
        : cardColor;

  const cardRootRef = useApplyElementStyles<HTMLDivElement>({
    'border-left': `3px solid ${cardColor}`,
    '--card-color': cardColor,
    '--progress-color': progressColor,
  });

  const usageBarRef = useApplyElementStyles<HTMLDivElement>({
    width: `${usagePercent}%`,
  });

  const summaryItems = useMemo(
    () => [
      {
        key: 'available',
        label: cardMessages.available,
        value: formatCurrency(card.available_limit || 0),
        valueClass: 'text-[var(--color-success)]',
      },
      {
        key: 'invoice',
        label: cardMessages.currentInvoice,
        value: formatCurrency(card.current_invoice || 0),
        valueClass: 'text-[var(--color-error)]',
      },
    ],
    [
      card.available_limit,
      card.current_invoice,
      cardMessages.available,
      cardMessages.currentInvoice,
    ],
  );

  const handleOpenDetails = (event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/cards/${card.id}`);
  };

  const handleEdit = (event: MouseEvent) => {
    event.stopPropagation();
    onEditCard(card);
  };

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();
    onDeleteCard(card);
  };

  return {
    cardMessages,
    cardColor,
    dueDay,
    closingDay,
    usagePercent,
    usagePercentLabel: `${usagePercent.toFixed(1)}%`,
    usageLabel: formatCurrency(card.usage || 0),
    creditLimitLabel: formatCurrency(card.credit_limit),
    cardRootRef,
    usageBarRef,
    summaryItems,
    handleOpenDetails,
    handleEdit,
    handleDelete,
  };
}
