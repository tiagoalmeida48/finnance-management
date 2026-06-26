import { useMemo, useState } from 'react';
import {
  useTransactionsGroupedList,
  useTransactionsSummary,
  useTransactionMutations,
} from './useTransactions';
import type {
  Transaction,
  TransactionFilter,
  TransactionListItem,
} from '../types/transactions.types';

function flattenItems(items: TransactionListItem[]): Transaction[] {
  return items.flatMap((item) =>
    item.isGroup && item.group
      ? item.group.items
      : item.transaction
        ? [item.transaction]
        : [],
  );
}

const PAGE_SIZE = 50;

function startOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function endOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function createDefaultFilter(): TransactionFilter {
  return {
    account: 0,
    category: 0,
    startDate: startOfCurrentMonth(),
    endDate: endOfCurrentMonth(),
    isPaid: null,
    sortAsc: false,
    limit: PAGE_SIZE,
    offset: 0,
  };
}

export function useTransactionsPageLogic() {
  const [filter, setFilter] = useState<TransactionFilter>(createDefaultFilter);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const listQuery = useTransactionsGroupedList(filter);
  const summaryQuery = useTransactionsSummary(filter);
  const mutations = useTransactionMutations();

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const transactions = useMemo(() => flattenItems(items), [items]);
  const totalLines = listQuery.data?.totalLines ?? 0;
  const hasNextPage = listQuery.data?.hasNextPage ?? false;
  const page = Math.floor(filter.offset / PAGE_SIZE);
  const isEmpty = !listQuery.isLoading && items.length === 0;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateFilter = (patch: Partial<TransactionFilter>) => {
    setSelectedIds([]);
    setFilter((prev) => ({ ...prev, ...patch }));
  };

  const resetFilter = () => {
    setSelectedIds([]);
    setFilter(createDefaultFilter());
  };

  const goToPage = (next: number) => {
    const target = Math.max(0, next);
    setSelectedIds([]);
    setFilter((prev) => ({ ...prev, offset: target * PAGE_SIZE }));
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? transactions.map((item) => item.transaction) : []);
  };

  const clearSelection = () => setSelectedIds([]);

  const togglePaid = (transaction: Transaction) => {
    mutations.togglePaid.mutate(transaction.transaction);
  };

  const duplicate = (transaction: Transaction) => {
    mutations.duplicate.mutate(transaction.transaction);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    mutations.remove.mutate(pendingDelete.transaction, {
      onSuccess: () => {
        setSelectedIds((prev) => prev.filter((id) => id !== pendingDelete.transaction));
        setPendingDelete(null);
      },
    });
  };

  const batchPay = (account: number, paymentDate: string) => {
    if (selectedIds.length === 0) return;
    mutations.batchPay.mutate(
      { ids: selectedIds, account, paymentDate },
      { onSuccess: clearSelection },
    );
  };

  const batchUnpay = () => {
    if (selectedIds.length === 0) return;
    mutations.batchUnpay.mutate(selectedIds, { onSuccess: clearSelection });
  };

  const batchDelete = () => {
    if (selectedIds.length === 0) return;
    mutations.batchDelete.mutate(selectedIds, { onSuccess: clearSelection });
  };

  const batchChangeDay = (day: number) => {
    if (selectedIds.length === 0) return;
    mutations.batchChangeDay.mutate({ ids: selectedIds, day }, { onSuccess: clearSelection });
  };

  return {
    filter,
    items,
    transactions,
    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    isEmpty,
    page,
    pageSize: PAGE_SIZE,
    totalLines,
    hasNextPage,
    expandedGroups,
    toggleGroup,
    formOpen,
    importOpen,
    editing,
    selectedIds,
    pendingDelete,
    openImport: () => setImportOpen(true),
    closeImport: () => setImportOpen(false),
    openForm: () => {
      setEditing(null);
      setFormOpen(true);
    },
    openEdit: (transaction: Transaction) => {
      setEditing(transaction);
      setFormOpen(true);
    },
    closeForm: () => {
      setFormOpen(false);
      setEditing(null);
    },
    updateFilter,
    resetFilter,
    goToPage,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    togglePaid,
    duplicate,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    deleting: mutations.remove.isPending,
    batchPay,
    batchUnpay,
    batchDelete,
    batchChangeDay,
  };
}
