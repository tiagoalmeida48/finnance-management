import { useState } from 'react';
import { useCreditCards, useDeleteCreditCard } from '@/shared/hooks/api/useCreditCards';
import { CreditCard } from '@/shared/interfaces/credit-card.interface';

export function useCreditCardsPageLogic() {
  const { data: cards, isLoading } = useCreditCards();
  const deleteCard = useDeleteCreditCard();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCard, setMenuCard] = useState<CreditCard | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, card: CreditCard) => {
    setAnchorEl(event.currentTarget);
    setMenuCard(card);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (menuCard) {
      setSelectedCard(menuCard);
      setModalOpen(true);
      handleCloseMenu();
    }
  };

  const handleDelete = () => {
    if (menuCard) {
      setSelectedCard(menuCard);
      setDeleteModalOpen(true);
      handleCloseMenu();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCard) return;
    try {
      await deleteCard.mutateAsync(selectedCard.id);
      setDeleteModalOpen(false);
      setSelectedCard(null);
    } catch {
      //
    }
  };

  const handleAdd = () => {
    setSelectedCard(null);
    setModalOpen(true);
  };

  return {
    cards,
    isLoading,
    deleteCard,
    modalOpen,
    setModalOpen,
    selectedCard,
    setSelectedCard,
    deleteModalOpen,
    setDeleteModalOpen,
    anchorEl,
    menuCard,
    handleOpenMenu,
    handleCloseMenu,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleAdd,
  };
}
