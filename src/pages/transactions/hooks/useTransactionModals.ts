import { useState } from 'react';
import type { Transaction } from '@/shared/interfaces';

export function useTransactionModals() {
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [changeDayModalOpen, setChangeDayModalOpen] = useState(false);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setModalOpen(true);
  };

  const handleImport = () => {
    setImportModalOpen(true);
  };

  const handleOpenBatchPayModal = (hasSelection: boolean) => {
    if (!hasSelection) return;
    setSelectedTransaction(undefined);
    setPaymentModalOpen(true);
  };

  const handleOpenBatchChangeDayModal = (hasSelection: boolean) => {
    if (!hasSelection) return;
    setChangeDayModalOpen(true);
  };

  const handleOpenBatchDeleteModal = (hasSelection: boolean) => {
    if (!hasSelection) return;
    setBatchDeleteModalOpen(true);
  };

  return {
    modalOpen,
    setModalOpen,
    importModalOpen,
    setImportModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    changeDayModalOpen,
    setChangeDayModalOpen,
    batchDeleteModalOpen,
    setBatchDeleteModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    selectedTransaction,
    setSelectedTransaction,
    handleAdd,
    handleImport,
    handleOpenBatchPayModal,
    handleOpenBatchChangeDayModal,
    handleOpenBatchDeleteModal,
  };
}
