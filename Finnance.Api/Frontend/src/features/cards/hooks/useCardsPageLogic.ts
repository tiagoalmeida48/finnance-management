import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards, useCardsStats, useCreateCard, useDeleteCard, useUpdateCard } from './useCards';
import type { CardFormValues } from '../components/CardFormModal';
import type { CreditCard, CreditCardStats } from '../types/cards.types';

export function useCardsPageLogic() {
  const navigate = useNavigate();
  const cardsQuery = useCards();
  const statsQuery = useCardsStats();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [createBankAccount, setCreateBankAccount] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CreditCard | null>(null);

  const statsByCard = useMemo(() => {
    const map = new Map<number, CreditCardStats>();
    statsQuery.data?.forEach((item) => map.set(item.creditCard, item));
    return map;
  }, [statsQuery.data]);

  const openCreate = useCallback((bankAccount?: number) => {
    setEditing(null);
    setCreateBankAccount(typeof bankAccount === 'number' ? bankAccount : null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((card: CreditCard) => {
    setEditing(card);
    setCreateBankAccount(null);
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
          closingDay: values.closingDay,
          dueDay: values.dueDay,
        },
        { onSuccess: () => setFormOpen(false) },
      );
    },
    [editing, createCard, updateCard],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteCard.mutate(pendingDelete.creditCard, {
      onSuccess: () => setPendingDelete(null),
    });
  }, [pendingDelete, deleteCard]);

  return {
    cards: cardsQuery.data ?? [],
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    refetch: cardsQuery.refetch,
    statsByCard,
    formOpen,
    editing,
    createBankAccount,
    pendingDelete,
    saving: createCard.isPending || updateCard.isPending,
    deleting: deleteCard.isPending,
    openCreate,
    openEdit,
    closeForm,
    handleSubmit,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    openDetail: (card: CreditCard) => navigate(`/cards/${card.creditCard}`),
  };
}
