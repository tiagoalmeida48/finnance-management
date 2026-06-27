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

export type TransactionViewMode = 'month' | 'general' | 'installments';

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthStart(date: Date): string {
  return isoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function monthEnd(date: Date): string {
  return isoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function createDefaultFilter(): TransactionFilter {
  const now = new Date();
  return {
    account: 0,
    category: 0,
    card: 0,
    paymentMethod: 0,
    transactionType: 0,
    search: '',
    hideCreditCards: false,
    onlyInstallments: false,
    startDate: monthStart(now),
    endDate: monthEnd(now),
    isPaid: null,
    sortAsc: false,
    limit: PAGE_SIZE,
    offset: 0,
  };
}

export function useTransactionsPageLogic() {
  const [filter, setFilter] = useState<TransactionFilter>(createDefaultFilter);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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
  const selectionHasCard = useMemo(
    () => transactions.some((t) => selectedIds.includes(t.transaction) && t.card != null && t.card > 0),
    [transactions, selectedIds],
  );
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

  const viewMode: TransactionViewMode = filter.onlyInstallments
    ? 'installments'
    : filter.startDate
      ? 'month'
      : 'general';

  const monthLabel = `${MONTHS_PT[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;

  const setTypeFilter = (type: number) => {
    updateFilter({ transactionType: filter.transactionType === type ? 0 : type, offset: 0 });
  };

  const setStatusFilter = (isPaid: boolean | null) => {
    updateFilter({ isPaid, offset: 0 });
  };

  const toggleHideCards = () => {
    updateFilter({ hideCreditCards: !filter.hideCreditCards, offset: 0 });
  };

  const setViewMode = (mode: TransactionViewMode) => {
    if (mode === 'month') {
      updateFilter({
        startDate: monthStart(monthCursor),
        endDate: monthEnd(monthCursor),
        onlyInstallments: false,
        offset: 0,
      });
      return;
    }
    if (mode === 'general') {
      updateFilter({ startDate: null, endDate: null, onlyInstallments: false, offset: 0 });
      return;
    }
    updateFilter({ startDate: null, endDate: null, onlyInstallments: true, offset: 0 });
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1);
    setMonthCursor(next);
    if (viewMode === 'month') {
      updateFilter({ startDate: monthStart(next), endDate: monthEnd(next), offset: 0 });
    }
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
    if (selectedIds.length === 0 || selectionHasCard) return;
    mutations.batchPay.mutate(
      { ids: selectedIds, account, paymentDate },
      { onSuccess: clearSelection },
    );
  };

  const batchUnpay = () => {
    if (selectedIds.length === 0 || selectionHasCard) return;
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
    selectionHasCard,
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
    viewMode,
    monthLabel,
    setTypeFilter,
    setStatusFilter,
    toggleHideCards,
    setViewMode,
    prevMonth: () => shiftMonth(-1),
    nextMonth: () => shiftMonth(1),
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
