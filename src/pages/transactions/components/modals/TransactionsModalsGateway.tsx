import type { Transaction } from "@/shared/services/transactions.service";
import { TransactionFormModal } from "@/pages/transactions/components/modals/TransactionFormModal";
import { DeleteTransactionModal } from "@/pages/transactions/components/modals/DeleteTransactionModal";
import { ImportTransactionsModal } from "@/pages/transactions/components/modals/ImportTransactionsModal";
import { BatchChangeDayModal } from "@/pages/transactions/components/modals/BatchChangeDayModal";
import { PaymentConfirmModal } from "@/pages/cards/components/modals/PaymentConfirmModal";
import { DeleteConfirmationModal } from "@/shared/components/composite/DeleteConfirmationModal";
import { messages } from "@/shared/i18n/messages";

interface TransactionsModalsGatewayProps {
  selectedTransaction?: Transaction;
  menuTransaction: Transaction | null;
  selectedIds: string[];
  modalOpen: boolean;
  importModalOpen: boolean;
  paymentModalOpen: boolean;
  changeDayModalOpen: boolean;
  batchDeleteModalOpen: boolean;
  deleteModalOpen: boolean;
  batchChangeDayPending: boolean;
  batchDeletePending: boolean;
  setModalOpen: (value: boolean) => void;
  setImportModalOpen: (value: boolean) => void;
  setPaymentModalOpen: (value: boolean) => void;
  setChangeDayModalOpen: (value: boolean) => void;
  setBatchDeleteModalOpen: (value: boolean) => void;
  setDeleteModalOpen: (value: boolean) => void;
  setSelectedTransaction: (value: Transaction | undefined) => void;
  onConfirmDelete: (type: "single" | "group") => Promise<void>;
  onConfirmPayment: (data: {
    account_id: string;
    payment_date: string;
  }) => Promise<void>;
  onConfirmBatchDelete: () => Promise<void>;
  onConfirmBatchChangeDay: (day: number) => Promise<void>;
}

export function TransactionsModalsGateway({
  selectedTransaction,
  menuTransaction,
  selectedIds,
  modalOpen,
  importModalOpen,
  paymentModalOpen,
  changeDayModalOpen,
  batchDeleteModalOpen,
  deleteModalOpen,
  batchChangeDayPending,
  batchDeletePending,
  setModalOpen,
  setImportModalOpen,
  setPaymentModalOpen,
  setChangeDayModalOpen,
  setBatchDeleteModalOpen,
  setDeleteModalOpen,
  setSelectedTransaction,
  onConfirmDelete,
  onConfirmPayment,
  onConfirmBatchDelete,
  onConfirmBatchChangeDay,
}: TransactionsModalsGatewayProps) {
  const bulkMessages = messages.transactions.bulkActions;

  return (
    <>
      <TransactionFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTransaction(undefined);
        }}
        transaction={selectedTransaction}
      />

      <DeleteTransactionModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTransaction(undefined);
        }}
        onConfirm={onConfirmDelete}
        transaction={menuTransaction}
      />

      <ImportTransactionsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />

      <BatchChangeDayModal
        open={changeDayModalOpen}
        selectedCount={selectedIds.length}
        loading={batchChangeDayPending}
        onClose={() => setChangeDayModalOpen(false)}
        onConfirm={onConfirmBatchChangeDay}
      />

      <DeleteConfirmationModal
        open={batchDeleteModalOpen}
        onClose={() => setBatchDeleteModalOpen(false)}
        onConfirm={() => {
          void onConfirmBatchDelete();
        }}
        title={bulkMessages.deleteSelectedTitle}
        description={bulkMessages.deleteSelectedDescription(selectedIds.length)}
        loading={batchDeletePending}
      />

      <PaymentConfirmModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedTransaction(undefined);
        }}
        onConfirm={onConfirmPayment}
      />
    </>
  );
}
