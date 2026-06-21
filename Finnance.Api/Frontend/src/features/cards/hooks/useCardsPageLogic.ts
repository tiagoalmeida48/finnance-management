import { useCallback, useMemo, useState } from 'react';
import { useCards, useCardsStats, useCreateCard, useDeleteCard, useUpdateCard } from './useCards';
import type { CardFormValues } from '../components/CardFormModal';
import type { CreditCard, CreditCardStats } from '../types/cards.types';

export function useCardsPageLogic() {
  const cardsQuery = useCards();
  const statsQuery = useCardsStats();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [detailCard, setDetailCard] = useState<CreditCard | null>(null);

  const statsByCard = useMemo(() => {
    const map = new Map<number, CreditCardStats>();
    statsQuery.data?.forEach((item) => map.set(item.creditCard, item));
    return map;
  }, [statsQuery.data]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((card: CreditCard) => {
    setEditing(card);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmit = useCallback(
    (values: CardFormValues) => {
      if (editing) {
        updateCard.mutate(
          { creditCard: editing.creditCard, ...values },
          { onSuccess: () => setFormOpen(false) },
        );
        return;
      }
      createCard.mutate(
        {
          bankAccount: values.bankAccount,
          name: values.name,
          color: values.color,
          creditLimit: values.creditLimit,
          notes: values.notes,
        },
        { onSuccess: () => setFormOpen(false) },
      );
    },
    [editing, createCard, updateCard],
  );

  const handleDelete = useCallback(
    (card: CreditCard) => {
      const confirmed = window.confirm(`Excluir o cartão "${card.name}"?`);
      if (confirmed) deleteCard.mutate(card.creditCard);
    },
    [deleteCard],
  );

  return {
    cards: cardsQuery.data ?? [],
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    statsByCard,
    formOpen,
    editing,
    detailCard,
    saving: createCard.isPending || updateCard.isPending,
    openCreate,
    openEdit,
    closeForm,
    handleSubmit,
    handleDelete,
    openDetail: setDetailCard,
    closeDetail: () => setDetailCard(null),
  };
}
