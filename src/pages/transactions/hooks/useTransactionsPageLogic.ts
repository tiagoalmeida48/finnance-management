import { useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
  useTransactionsPaginated,
  useTransactionsSummaries,
  useDeleteTransaction,
  useTogglePaymentStatus,
  useBatchDeleteTransactions,
  useBatchPayTransactions,
  useBatchUnpayTransactions,
  useDeleteTransactionGroup,
  useBatchChangeTransactionDay,
  useDuplicateTransaction,
  useInsertInstallmentBetween,
} from '@/shared/hooks/api/useTransactions';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import { useCategories } from '@/shared/hooks/api/useCategories';
import { useCreditCards } from '@/shared/hooks/api/useCreditCards';
import { Transaction } from '@/shared/services/transactions.service';
import { getGroupedTransactions } from '@/shared/utils/transactionsPage.utils';
import { useTransactionModals } from './useTransactionModals';
import { useTransactionFilters } from './useTransactionFilters';
import { useTransactionSelection } from './useTransactionSelection';
import type {
  TransactionsPaginatedParams,
  TransactionsSummaryParams,
} from '@/shared/constants/queryKeys';

export function useTransactionsPageLogic() {
  const modals = useTransactionModals();
  const filters = useTransactionFilters();
  const selection = useTransactionSelection();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsRowsPerPage, setTransactionsRowsPerPage] = useState(100);

  // Build server-side query params from filter state
  const summaryParams = useMemo<TransactionsSummaryParams>(() => {
    const dateRange = filters.shouldUseAllTimeRange
      ? { start_date: undefined, end_date: undefined }
      : {
          start_date: format(startOfMonth(filters.currentMonth), 'yyyy-MM-dd'),
          end_date: format(endOfMonth(filters.currentMonth), 'yyyy-MM-dd'),
        };
    return {
      ...dateRange,
      type: filters.typeFilter ?? undefined,
      is_paid: filters.showPendingOnly ? false : undefined,
      account_id: filters.accountFilter !== 'all' ? filters.accountFilter : undefined,
      card_id: filters.cardFilter !== 'all' ? filters.cardFilter : undefined,
      category_id: filters.categoryFilter !== 'all' ? filters.categoryFilter : undefined,
      payment_method:
        filters.paymentMethodFilter !== 'all' ? filters.paymentMethodFilter : undefined,
      search: filters.searchQuery.trim() || undefined,
      hide_credit_cards: filters.hideCreditCards || undefined,
      only_credit_cards: filters.showOnlyCardPurchases || undefined,
      only_installments: filters.showInstallmentsOnly || undefined,
    };
  }, [
    filters.shouldUseAllTimeRange,
    filters.currentMonth,
    filters.typeFilter,
    filters.showPendingOnly,
    filters.accountFilter,
    filters.cardFilter,
    filters.categoryFilter,
    filters.paymentMethodFilter,
    filters.searchQuery,
    filters.hideCreditCards,
    filters.showOnlyCardPurchases,
    filters.showInstallmentsOnly,
  ]);

  const paginatedParams = useMemo<TransactionsPaginatedParams>(() => {
    const effectiveLimit = transactionsRowsPerPage === -1 ? 10000 : transactionsRowsPerPage;
    return {
      ...summaryParams,
      sort_field: filters.sortConfig.field,
      sort_direction: filters.sortConfig.direction,
      limit: effectiveLimit,
      offset: transactionsPage * effectiveLimit,
    };
  }, [summaryParams, filters.sortConfig, transactionsPage, transactionsRowsPerPage]);

  // Reset to page 0 when filters change (not when page/sort changes)
  const filterKey = useMemo(() => JSON.stringify(summaryParams), [summaryParams]);
  const prevFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      setTransactionsPage(0);
    }
  }, [filterKey]);

  const { data: paginatedResult, isLoading: transactionsLoading } =
    useTransactionsPaginated(paginatedParams);
  const { data: summaries } = useTransactionsSummaries(summaryParams);

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories } = useCategories();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();

  const deleteTransaction = useDeleteTransaction();
  const batchDeleteTransactions = useBatchDeleteTransactions();
  const batchPayTransactions = useBatchPayTransactions();
  const batchUnpayTransactions = useBatchUnpayTransactions();
  const batchChangeTransactionDay = useBatchChangeTransactionDay();
  const deleteTransactionGroup = useDeleteTransactionGroup();
  const duplicateTransaction = useDuplicateTransaction();
  const insertInstallmentBetween = useInsertInstallmentBetween();
  const togglePaymentStatus = useTogglePaymentStatus();

  const isLoading = transactionsLoading || accountsLoading || cardsLoading;

  const transactions = paginatedResult?.data ?? [];
  const totalCount = paginatedResult?.count ?? 0;

  const defaultSummaries = { income: 0, expense: 0, balance: 0, pending: 0 };

  // Group current page visually (installments/recurring groups within the page)
  const groupedTransactions = useMemo(
    () => getGroupedTransactions(transactions, filters.sortConfig),
    [transactions, filters.sortConfig],
  );

  const handleEdit = () => {
    modals.setSelectedTransaction(selection.menuTransaction || undefined);
    modals.setModalOpen(true);
    selection.handleCloseMenu();
  };

  const handleDelete = () => {
    if (!selection.menuTransaction) return;
    modals.setDeleteModalOpen(true);
    selection.handleCloseMenu();
  };

  const handleDuplicate = async () => {
    if (!selection.menuTransaction) return;
    try {
      await duplicateTransaction.mutateAsync(selection.menuTransaction.id);
    } finally {
      selection.handleCloseMenu();
    }
  };

  const handleInsertInstallmentBetween = async () => {
    if (!selection.menuTransaction?.installment_group_id) return;
    try {
      await insertInstallmentBetween.mutateAsync(selection.menuTransaction.id);
    } finally {
      selection.handleCloseMenu();
    }
  };

  const handleConfirmDelete = async (type: 'single' | 'group') => {
    if (!selection.menuTransaction) return;
    try {
      if (type === 'group') {
        const groupId =
          selection.menuTransaction.installment_group_id ||
          selection.menuTransaction.recurring_group_id;
        const groupType = selection.menuTransaction.installment_group_id
          ? 'installment'
          : 'recurring';
        if (groupId) {
          await deleteTransactionGroup.mutateAsync({ groupId, type: groupType });
        }
        selection.setSelectedIds([]);
      } else {
        await deleteTransaction.mutateAsync(selection.menuTransaction.id);
        selection.setSelectedIds((prev) =>
          prev.filter((id) => id !== selection.menuTransaction?.id),
        );
      }
      modals.setDeleteModalOpen(false);
      selection.setMenuTransaction(null);
    } catch {
      //
    }
  };

  const handleTogglePaid = (transaction: Transaction) => {
    if (!transaction.is_paid) {
      modals.setSelectedTransaction(transaction);
      modals.setPaymentModalOpen(true);
    } else {
      togglePaymentStatus.mutate({ id: transaction.id, currentStatus: true });
    }
  };

  const handleConfirmPayment = async (data: { account_id: string; payment_date: string }) => {
    try {
      if (modals.selectedTransaction) {
        await batchPayTransactions.mutateAsync({
          ids: [modals.selectedTransaction.id],
          accountId: data.account_id,
          paymentDate: data.payment_date,
        });
      } else if (selection.selectedIds.length > 0) {
        await batchPayTransactions.mutateAsync({
          ids: selection.selectedIds,
          accountId: data.account_id,
          paymentDate: data.payment_date,
        });
        selection.setSelectedIds([]);
      }
      modals.setPaymentModalOpen(false);
      modals.setSelectedTransaction(undefined);
    } catch {
      //
    }
  };

  const handleBatchUnpay = async () => {
    try {
      if (selection.selectedIds.length > 0) {
        await batchUnpayTransactions.mutateAsync(selection.selectedIds);
        selection.setSelectedIds([]);
      }
    } catch {
      //
    }
  };

  const handleBatchDelete = async () => {
    if (selection.selectedIds.length === 0) return;
    try {
      await batchDeleteTransactions.mutateAsync(selection.selectedIds);
      selection.setSelectedIds([]);
      modals.setBatchDeleteModalOpen(false);
    } catch {
      //
    }
  };

  const handleBatchChangeDay = async (day: number) => {
    if (selection.selectedIds.length === 0) return;
    try {
      await batchChangeTransactionDay.mutateAsync({ ids: selection.selectedIds, day });
      selection.setSelectedIds([]);
      modals.setChangeDayModalOpen(false);
    } catch {
      //
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handlePrevMonth = () => {
    filters.setCurrentMonth((prev) => subMonths(prev, 1));
    filters.setShowAllTime(false);
    selection.clearMenuState();
    selection.setSelectedIds([]);
  };

  const handleNextMonth = () => {
    filters.setCurrentMonth((prev) => addMonths(prev, 1));
    filters.setShowAllTime(false);
    selection.clearMenuState();
    selection.setSelectedIds([]);
  };

  const handleTransactionsPageChange = (page: number) => setTransactionsPage(page);

  const handleTransactionsRowsPerPageChange = (rowsPerPage: number) => {
    setTransactionsRowsPerPage(rowsPerPage);
    setTransactionsPage(0);
  };

  const handleSelectAll = (checked: boolean) => {
    selection.handleSelectAll(checked, groupedTransactions);
  };

  return {
    ...modals,
    ...filters,
    ...selection,
    expandedGroups,
    setExpandedGroups,
    transactionsPage,
    setTransactionsPage: handleTransactionsPageChange,
    transactionsRowsPerPage,
    setTransactionsRowsPerPage: handleTransactionsRowsPerPageChange,
    transactions,
    totalCount,
    isLoading,
    categories,
    accounts,
    cards,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleDuplicate,
    handleInsertInstallmentBetween,
    handleTogglePaid,
    handleConfirmPayment,
    handleBatchUnpay,
    handleBatchDelete,
    handleBatchChangeDay,
    handleOpenBatchPayModal: () => modals.handleOpenBatchPayModal(selection.selectedIds.length > 0),
    handleOpenBatchChangeDayModal: () =>
      modals.handleOpenBatchChangeDayModal(selection.selectedIds.length > 0),
    handleOpenBatchDeleteModal: () =>
      modals.handleOpenBatchDeleteModal(selection.selectedIds.length > 0),
    toggleGroup,
    handleSelectAll,
    handlePrevMonth,
    handleNextMonth,
    summaries: summaries ?? defaultSummaries,
    groupedTransactions,
    paginatedGroupedTransactions: groupedTransactions,
    duplicateTransaction,
    insertInstallmentBetween,
    togglePaymentStatus,
    batchChangeTransactionDay,
    batchDeleteTransactions,
  };
}
