<<<<<<< HEAD
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
  useTransactionsPaginated,
  useTransactionsSummaries,
=======
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
  useTransactions,
>>>>>>> finnance-management/main
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
<<<<<<< HEAD
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
=======
import {
  getFilteredTransactionsAndSummaries,
  getGroupedTransactions,
  type TransactionSortConfig,
  type TransactionSortField,
} from '@/shared/utils/transactionsPage.utils';
import {
  clearContextMenuState,
  extractGroupOrTransactionIds,
  mergeUniqueIds,
  removeIds,
} from '@/shared/utils/transactionsPage.helpers';

export function useTransactionsPageLogic() {
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [changeDayModalOpen, setChangeDayModalOpen] = useState(false);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAllTime, setShowAllTime] = useState(false);
  const [hideCreditCards, setHideCreditCards] = useState(false);
  const [showOnlyCardPurchases, setShowOnlyCardPurchases] = useState(false);
  const [showInstallmentsOnly, setShowInstallmentsOnly] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<TransactionSortConfig>({
    field: 'payment_date',
    direction: 'desc',
  });
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsRowsPerPage, setTransactionsRowsPerPage] = useState(100);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);
>>>>>>> finnance-management/main

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

<<<<<<< HEAD
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
=======
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({
    start_date: shouldUseAllTimeRange
      ? undefined
      : format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    end_date: shouldUseAllTimeRange ? undefined : format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    is_paid: undefined,
  });
>>>>>>> finnance-management/main

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

<<<<<<< HEAD
  const transactions = useMemo(() => paginatedResult?.data ?? [], [paginatedResult]);
  const totalCount = paginatedResult?.count ?? 0;
=======
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setAnchorEl(event.currentTarget);
    setMenuTransaction(transaction);
  };
>>>>>>> finnance-management/main

  const defaultSummaries = { income: 0, expense: 0, balance: 0, pending: 0 };

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
<<<<<<< HEAD
      await duplicateTransaction.mutateAsync(selection.menuTransaction.id);
=======
      await duplicateTransaction.mutateAsync(menuTransaction.id);
    } catch {
      // erro tratado pelo onError global do QueryClient
>>>>>>> finnance-management/main
    } finally {
      selection.handleCloseMenu();
    }
  };

  const handleInsertInstallmentBetween = async () => {
    if (!selection.menuTransaction?.installment_group_id) return;
    try {
<<<<<<< HEAD
      await insertInstallmentBetween.mutateAsync(selection.menuTransaction.id);
=======
      await insertInstallmentBetween.mutateAsync(menuTransaction.id);
    } catch {
      // erro tratado pelo onError global do QueryClient
>>>>>>> finnance-management/main
    } finally {
      selection.handleCloseMenu();
    }
  };

  const handleConfirmDelete = async (type: 'single' | 'group') => {
<<<<<<< HEAD
    if (!selection.menuTransaction) return;
    try {
      if (type === 'group') {
        const groupId =
          selection.menuTransaction.installment_group_id ||
          selection.menuTransaction.recurring_group_id;
        const groupType = selection.menuTransaction.installment_group_id
          ? 'installment'
          : 'recurring';
=======
    if (!menuTransaction) return;
    try {
      if (type === 'group') {
        const groupId = menuTransaction.installment_group_id || menuTransaction.recurring_group_id;
        const groupType = menuTransaction.installment_group_id ? 'installment' : 'recurring';
>>>>>>> finnance-management/main
        if (groupId) {
          await deleteTransactionGroup.mutateAsync({ groupId, type: groupType });
        }
        selection.setSelectedIds([]);
      } else {
<<<<<<< HEAD
        await deleteTransaction.mutateAsync(selection.menuTransaction.id);
        selection.setSelectedIds((prev) =>
          prev.filter((id) => id !== selection.menuTransaction?.id),
        );
      }
      modals.setDeleteModalOpen(false);
      selection.setMenuTransaction(null);
    } catch { return; }
=======
        await deleteTransaction.mutateAsync(menuTransaction.id);
        setSelectedIds((prev) => prev.filter((id) => id !== menuTransaction.id));
      }
      setDeleteModalOpen(false);
      setMenuTransaction(null);
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
>>>>>>> finnance-management/main
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
<<<<<<< HEAD
      modals.setPaymentModalOpen(false);
      modals.setSelectedTransaction(undefined);
    } catch { return; }
=======
      setPaymentModalOpen(false);
      setSelectedTransaction(undefined);
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
>>>>>>> finnance-management/main
  };

  const handleBatchUnpay = async () => {
    try {
      if (selection.selectedIds.length > 0) {
        await batchUnpayTransactions.mutateAsync(selection.selectedIds);
        selection.setSelectedIds([]);
      }
<<<<<<< HEAD
    } catch { return; }
=======
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
  };

  const handleOpenBatchDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setBatchDeleteModalOpen(true);
>>>>>>> finnance-management/main
  };

  const handleBatchDelete = async () => {
    if (selection.selectedIds.length === 0) return;
    try {
<<<<<<< HEAD
      await batchDeleteTransactions.mutateAsync(selection.selectedIds);
      selection.setSelectedIds([]);
      modals.setBatchDeleteModalOpen(false);
    } catch { return; }
=======
      await batchDeleteTransactions.mutateAsync(selectedIds);
      setSelectedIds([]);
      setBatchDeleteModalOpen(false);
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
  };

  const handleOpenBatchChangeDayModal = () => {
    if (selectedIds.length === 0) return;
    setChangeDayModalOpen(true);
>>>>>>> finnance-management/main
  };

  const handleBatchChangeDay = async (day: number) => {
    if (selection.selectedIds.length === 0) return;
    try {
<<<<<<< HEAD
      await batchChangeTransactionDay.mutateAsync({ ids: selection.selectedIds, day });
      selection.setSelectedIds([]);
      modals.setChangeDayModalOpen(false);
    } catch { return; }
=======
      await batchChangeTransactionDay.mutateAsync({ ids: selectedIds, day });
      setSelectedIds([]);
      setChangeDayModalOpen(false);
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
  };

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setModalOpen(true);
  };

  const handleImport = () => {
    setImportModalOpen(true);
>>>>>>> finnance-management/main
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

<<<<<<< HEAD
=======
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => removeIds(prev, currentPageTransactionIds));
      return;
    }

    setSelectedIds((prev) => mergeUniqueIds(prev, currentPageTransactionIds));
  };

  const handleOpenBatchPayModal = () => {
    if (selectedIds.length === 0) return;
    setSelectedTransaction(undefined);
    setPaymentModalOpen(true);
  };

>>>>>>> finnance-management/main
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

<<<<<<< HEAD
  const handleTransactionsPageChange = (page: number) => setTransactionsPage(page);
=======
  const handleSort = (field: TransactionSortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const { filteredTransactions, summaries } = useMemo(() => {
    if (!transactions)
      return {
        filteredTransactions: [],
        summaries: { income: 0, expense: 0, balance: 0, pending: 0 },
      };
    return getFilteredTransactionsAndSummaries({
      transactions,
      showPendingOnly,
      typeFilter,
      searchQuery,
      categoryFilter,
      paymentMethodFilter,
      accountFilter,
      cardFilter,
      hideCreditCards,
      showOnlyCardPurchases,
      showInstallmentsOnly,
      sortConfig,
    });
  }, [
    transactions,
    showPendingOnly,
    typeFilter,
    searchQuery,
    categoryFilter,
    paymentMethodFilter,
    accountFilter,
    cardFilter,
    sortConfig,
    hideCreditCards,
    showOnlyCardPurchases,
    showInstallmentsOnly,
  ]);

  const groupedTransactions = useMemo(() => {
    return getGroupedTransactions(filteredTransactions, sortConfig);
  }, [filteredTransactions, sortConfig]);

  const showingAllTransactions = transactionsRowsPerPage === -1;
  const maxTransactionsPage = showingAllTransactions
    ? 0
    : Math.max(0, Math.ceil(groupedTransactions.length / transactionsRowsPerPage) - 1);
  const safeTransactionsPage = Math.min(transactionsPage, maxTransactionsPage);

  const paginatedGroupedTransactions = useMemo(() => {
    if (showingAllTransactions) {
      return groupedTransactions;
    }
    const startIndex = safeTransactionsPage * transactionsRowsPerPage;
    return groupedTransactions.slice(startIndex, startIndex + transactionsRowsPerPage);
  }, [groupedTransactions, safeTransactionsPage, showingAllTransactions, transactionsRowsPerPage]);

  const currentPageTransactionIds = extractGroupOrTransactionIds(paginatedGroupedTransactions);

  const handleTransactionsPageChange = (page: number) => {
    setTransactionsPage(page);
  };
>>>>>>> finnance-management/main

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
