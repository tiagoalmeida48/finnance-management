import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
    useTransactions,
    useDeleteTransaction,
    useTogglePaymentStatus,
    useBatchDeleteTransactions,
    useBatchPayTransactions,
    useBatchUnpayTransactions,
    useDeleteTransactionGroup,
    useFirstTransactionDate
} from './useTransactions';
import { useAccounts } from './useAccounts';
import { useCategories } from './useCategories';
import { Transaction } from '../services/transactions.service';

export interface TransactionGroup {
    id: string;
    isGroup: boolean;
    type: 'installment' | 'recurring';
    mainTransaction: Transaction;
    items: Transaction[];
    totalAmount: number;
    paidAmount: number;
    isAllPaid: boolean;
}

export function useTransactionsPageLogic() {
    const [modalOpen, setModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const [showAllTime, setShowAllTime] = useState(false);
    const [hideCreditCards, setHideCreditCards] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method'; direction: 'asc' | 'desc' }>({
        field: 'payment_date',
        direction: 'desc'
    });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

    const { data: transactions, isLoading: transactionsLoading } = useTransactions({
        start_date: showAllTime ? undefined : format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        end_date: showAllTime ? undefined : format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
        is_paid: showPendingOnly ? false : undefined
    });

    const { data: accounts, isLoading: accountsLoading } = useAccounts();
    const { data: firstTransactionDate } = useFirstTransactionDate();
    const { data: categories } = useCategories();

    const deleteTransaction = useDeleteTransaction();
    const batchDeleteTransactions = useBatchDeleteTransactions();
    const batchPayTransactions = useBatchPayTransactions();
    const batchUnpayTransactions = useBatchUnpayTransactions();
    const deleteTransactionGroup = useDeleteTransactionGroup();
    const togglePaymentStatus = useTogglePaymentStatus();

    const isLoading = transactionsLoading || accountsLoading;

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
        setAnchorEl(event.currentTarget);
        setMenuTransaction(transaction);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        setSelectedTransaction(menuTransaction || undefined);
        setModalOpen(true);
        handleCloseMenu();
    };

    const handleDelete = () => {
        if (!menuTransaction) return;
        setDeleteModalOpen(true);
        handleCloseMenu();
    };

    const handleConfirmDelete = async (type: 'single' | 'group') => {
        if (!menuTransaction) return;
        try {
            if (type === 'group') {
                const groupId = menuTransaction.installment_group_id || menuTransaction.recurring_group_id;
                const groupType = menuTransaction.installment_group_id ? 'installment' : 'recurring';
                if (groupId) {
                    await deleteTransactionGroup.mutateAsync({ groupId, type: groupType });
                }
            } else {
                await deleteTransaction.mutateAsync(menuTransaction.id);
            }
            setSelectedIds(prev => prev.filter(id => id !== menuTransaction.id));
            setDeleteModalOpen(false);
            setMenuTransaction(null);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const handleTogglePaid = (transaction: Transaction) => {
        if (!transaction.is_paid) {
            setSelectedTransaction(transaction);
            setPaymentModalOpen(true);
        } else {
            togglePaymentStatus.mutate({
                id: transaction.id,
                currentStatus: true
            });
        }
    };

    const handleConfirmPayment = async (data: { account_id: string; payment_date: string }) => {
        try {
            if (selectedIds.length > 0) {
                await batchPayTransactions.mutateAsync({
                    ids: selectedIds,
                    accountId: data.account_id,
                    paymentDate: data.payment_date
                });
                setSelectedIds([]);
            } else if (selectedTransaction) {
                await batchPayTransactions.mutateAsync({
                    ids: [selectedTransaction.id],
                    accountId: data.account_id,
                    paymentDate: data.payment_date
                });
            }
            setPaymentModalOpen(false);
            setSelectedTransaction(undefined);
        } catch (error) {
            console.error('Error in batch payment:', error);
        }
    };

    const handleBatchUnpay = async () => {
        try {
            if (selectedIds.length > 0) {
                await batchUnpayTransactions.mutateAsync(selectedIds);
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error in batch unpay:', error);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length > 0 && window.confirm(`Deseja excluir as ${selectedIds.length} transações selecionadas?`)) {
            try {
                await batchDeleteTransactions.mutateAsync(selectedIds);
                setSelectedIds([]);
            } catch (error) {
                console.error('Error in batch delete:', error);
            }
        }
    };

    const handleAdd = () => {
        setSelectedTransaction(undefined);
        setModalOpen(true);
    };

    const handleImport = () => {
        setImportModalOpen(true);
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && transactions) {
            const filtered = transactions.filter(t => !typeFilter || t.type === typeFilter);
            setSelectedIds(filtered.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
        setShowAllTime(false);
        setSelectedIds([]);
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
        setShowAllTime(false);
        setSelectedIds([]);
    };

    const handleSort = (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method') => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const { filteredTransactions, summaries } = useMemo(() => {
        if (!transactions) return { filteredTransactions: [], summaries: { income: 0, expense: 0, balance: 0, pending: 0 } };

        const filtered = transactions.filter(t => {
            if (typeFilter && t.type !== typeFilter) return false;
            if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;
            if (paymentMethodFilter !== 'all' && t.payment_method !== paymentMethodFilter) return false;
            if (hideCreditCards && t.card_id) return false;
            return true;
        });

        const initialBalanceSum = accounts?.reduce((acc, a) => acc + (a.initial_balance || 0), 0) || 0;
        const isFirstMonth = firstTransactionDate &&
            format(startOfMonth(new Date(firstTransactionDate + 'T12:00:00')), 'yyyy-MM') ===
            format(startOfMonth(currentMonth), 'yyyy-MM');

        const shouldIncludeInitialBalance = showAllTime || isFirstMonth;
        const baseIncome = shouldIncludeInitialBalance ? initialBalanceSum : 0;

        const stats = filtered.reduce((acc, t) => {
            const amount = t.amount;
            if (t.type === 'income') {
                acc.income += amount;
            } else if (t.type === 'expense') {
                if (!t.card_id) acc.expense += amount;
            } else if (t.type === 'transfer') {
                acc.expense += amount;
            }
            if (!t.is_paid) acc.pending += amount;
            return acc;
        }, { income: baseIncome, expense: 0, balance: 0, pending: 0 });

        const summaries = { ...stats, balance: stats.income - stats.expense };

        filtered.sort((a, b) => {
            const field = sortConfig.field;
            let valA: any = a[field as keyof Transaction];
            let valB: any = b[field as keyof Transaction];
            if (field === 'category_id') {
                valA = a.category?.name || '';
                valB = b.category?.name || '';
            }
            if (field === 'is_paid') {
                valA = a.is_paid ? 1 : 0;
                valB = b.is_paid ? 1 : 0;
            }
            if (field === 'payment_method') {
                valA = a.payment_method || (a.card_id ? 'credit' : 'account');
                valB = b.payment_method || (b.card_id ? 'credit' : 'account');
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return { filteredTransactions: filtered, summaries };
    }, [transactions, typeFilter, searchQuery, categoryFilter, paymentMethodFilter, sortConfig, hideCreditCards, accounts, firstTransactionDate, currentMonth, showAllTime]);

    const groupedTransactions = useMemo(() => {
        const groups: (Transaction | TransactionGroup)[] = [];
        const groupMap: Record<string, TransactionGroup> = {};

        filteredTransactions.forEach(t => {
            const groupId = t.installment_group_id || t.recurring_group_id;
            const groupType = t.installment_group_id ? 'installment' : 'recurring';

            if (groupId) {
                if (!groupMap[groupId]) {
                    groupMap[groupId] = {
                        id: groupId,
                        isGroup: true,
                        type: groupType,
                        mainTransaction: t,
                        items: [],
                        totalAmount: 0,
                        paidAmount: 0,
                        isAllPaid: true
                    };
                    groups.push(groupMap[groupId]);
                }
                const group = groupMap[groupId];
                group.items.push(t);
                group.totalAmount += t.amount;
                if (t.is_paid) group.paidAmount += t.amount;
                if (!t.is_paid) group.isAllPaid = false;

                group.items.sort((a, b) => {
                    if (groupType === 'installment') return (a.installment_number || 0) - (b.installment_number || 0);
                    return new Date(a.payment_date + 'T12:00:00').getTime() - new Date(b.payment_date + 'T12:00:00').getTime();
                });
                group.mainTransaction = group.items[0];
            } else {
                groups.push(t);
            }
        });

        return groups;
    }, [filteredTransactions]);

    return {
        modalOpen, setModalOpen,
        importModalOpen, setImportModalOpen,
        paymentModalOpen, setPaymentModalOpen,
        selectedTransaction, setSelectedTransaction,
        deleteModalOpen, setDeleteModalOpen,
        typeFilter, setTypeFilter,
        currentMonth, setCurrentMonth,
        showPendingOnly, setShowPendingOnly,
        showAllTime, setShowAllTime,
        hideCreditCards, setHideCreditCards,
        expandedGroups, setExpandedGroups,
        searchQuery, setSearchQuery,
        categoryFilter, setCategoryFilter,
        paymentMethodFilter, setPaymentMethodFilter,
        sortConfig, setSortConfig,
        selectedIds, setSelectedIds,
        anchorEl, setAnchorEl,
        menuTransaction, setMenuTransaction,
        transactions, isLoading,
        categories, accounts,
        handleOpenMenu, handleCloseMenu,
        handleEdit, handleDelete, handleConfirmDelete,
        handleTogglePaid, handleConfirmPayment, handleBatchUnpay, handleBatchDelete,
        handleAdd, handleImport, toggleGroup, handleSelectRow, handleSelectAll,
        handlePrevMonth, handleNextMonth, handleSort,
        filteredTransactions, summaries, groupedTransactions,
        togglePaymentStatus // exposes isPending etc if needed
    };
}
