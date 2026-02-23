import { useState } from "react";
import {
  useCreditCards,
  useDeleteCreditCard,
} from "@/shared/hooks/api/useCreditCards";
import { CreditCard } from "@/shared/interfaces/credit-card.interface";

export function useCreditCardsPageLogic() {
  const { data: cards, isLoading } = useCreditCards();
  const deleteCard = useDeleteCreditCard();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleEdit = (card: CreditCard) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    setSelectedCard(card);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCard) return;
    try {
      await deleteCard.mutateAsync(selectedCard.id);
      setDeleteModalOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error("Error deleting card:", error);
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
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleAdd,
  };
}
