import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
    useTransactions,
    useDeleteTransaction,
    useTogglePaymentStatus,
    useBatchDeleteTransactions,
    useBatchPayTransactions,
    useBatchUnpayTransactions,
    useDeleteTransactionGroup
} from './useTransactions';
import { useAccounts } from './useAccounts';
import { useCategories } from './useCategories';
import { useCreditCards } from './useCreditCards';
import { Transaction } from '../services/transactions.service';
import {
    getFilteredTransactionsAndSummaries,
    getGroupedTransactions,
    type TransactionGroup,
    type TransactionSortConfig,
    type TransactionSortField,
} from './transactionsPage.utils';

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
        direction: 'desc'
    });
    const [transactionsPage, setTransactionsPage] = useState(0);
    const [transactionsRowsPerPage, setTransactionsRowsPerPage] = useState(100);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

    const shouldUseAllTimeRange = showAllTime || showInstallmentsOnly;

    const { data: transactions, isLoading: transactionsLoading } = useTransactions({
        start_date: shouldUseAllTimeRange ? undefined : format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        end_date: shouldUseAllTimeRange ? undefined : format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
        is_paid: undefined
    });

    const { data: accounts, isLoading: accountsLoading } = useAccounts();
    const { data: categories } = useCategories();
    const { data: cards, isLoading: cardsLoading } = useCreditCards();

    const deleteTransaction = useDeleteTransaction();
    const batchDeleteTransactions = useBatchDeleteTransactions();
    const batchPayTransactions = useBatchPayTransactions();
    const batchUnpayTransactions = useBatchUnpayTransactions();
    const deleteTransactionGroup = useDeleteTransactionGroup();
    const togglePaymentStatus = useTogglePaymentStatus();

    const isLoading = transactionsLoading || accountsLoading || cardsLoading;

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
        setAnchorEl(event.currentTarget);
        setMenuTransaction(transaction);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSetShowAllTime = (value: boolean) => {
        setShowAllTime(value);
        if (!value) {
            setShowInstallmentsOnly(false);
        }
        setAnchorEl(null);
        setMenuTransaction(null);
    };

    const handleSetHideCreditCards = (value: boolean) => {
        setHideCreditCards(value);
        if (value) {
            setShowOnlyCardPurchases(false);
        }
    };

    const handleSetShowOnlyCardPurchases = (value: boolean) => {
        setShowOnlyCardPurchases(value);
        if (value) {
            setHideCreditCards(false);
        }
    };

    const handleSetShowInstallmentsOnly = (value: boolean) => {
        setShowInstallmentsOnly(value);
        if (value) {
            setShowAllTime(true);
        }
        setAnchorEl(null);
        setMenuTransaction(null);
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
                setSelectedIds([]);
            } else {
                await deleteTransaction.mutateAsync(menuTransaction.id);
                setSelectedIds(prev => prev.filter(id => id !== menuTransaction.id));
            }
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
            if (selectedTransaction) {
                await batchPayTransactions.mutateAsync({
                    ids: [selectedTransaction.id],
                    accountId: data.account_id,
                    paymentDate: data.payment_date
                });
            } else if (selectedIds.length > 0) {
                await batchPayTransactions.mutateAsync({
                    ids: selectedIds,
                    accountId: data.account_id,
                    paymentDate: data.payment_date
                });
                setSelectedIds([]);
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
        if (!checked) {
            setSelectedIds(prev => prev.filter(id => !currentPageTransactionIds.includes(id)));
            return;
        }

        setSelectedIds(prev => {
            const merged = new Set([...prev, ...currentPageTransactionIds]);
            return Array.from(merged);
        });
    };

    const handleOpenBatchPayModal = () => {
        if (selectedIds.length === 0) return;
        setSelectedTransaction(undefined);
        setPaymentModalOpen(true);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
        setShowAllTime(false);
        setAnchorEl(null);
        setMenuTransaction(null);
        setSelectedIds([]);
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
        setShowAllTime(false);
        setAnchorEl(null);
        setMenuTransaction(null);
        setSelectedIds([]);
    };

    const handleSort = (field: TransactionSortField) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const { filteredTransactions, summaries } = useMemo(() => {
        if (!transactions) return { filteredTransactions: [], summaries: { income: 0, expense: 0, balance: 0, pending: 0 } };
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
    }, [transactions, showPendingOnly, typeFilter, searchQuery, categoryFilter, paymentMethodFilter, accountFilter, cardFilter, sortConfig, hideCreditCards, showOnlyCardPurchases, showInstallmentsOnly]);

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

    const currentPageTransactionIds = paginatedGroupedTransactions.flatMap((item: Transaction | TransactionGroup) =>
        'isGroup' in item && item.isGroup
            ? item.items.map((transaction) => transaction.id)
            : [item.id]
    );

    const handleTransactionsPageChange = (page: number) => {
        setTransactionsPage(page);
    };

    const handleTransactionsRowsPerPageChange = (rowsPerPage: number) => {
        setTransactionsRowsPerPage(rowsPerPage);
        setTransactionsPage(0);
    };

    return {
        modalOpen, setModalOpen,
        importModalOpen, setImportModalOpen,
        paymentModalOpen, setPaymentModalOpen,
        selectedTransaction, setSelectedTransaction,
        deleteModalOpen, setDeleteModalOpen,
        typeFilter, setTypeFilter,
        currentMonth, setCurrentMonth,
        showPendingOnly, setShowPendingOnly,
        showAllTime, setShowAllTime: handleSetShowAllTime,
        showInstallmentsOnly, setShowInstallmentsOnly: handleSetShowInstallmentsOnly,
        hideCreditCards, setHideCreditCards: handleSetHideCreditCards,
        showOnlyCardPurchases, setShowOnlyCardPurchases: handleSetShowOnlyCardPurchases,
        expandedGroups, setExpandedGroups,
        searchQuery, setSearchQuery,
        categoryFilter, setCategoryFilter,
        paymentMethodFilter, setPaymentMethodFilter,
        accountFilter, setAccountFilter,
        cardFilter, setCardFilter,
        sortConfig, setSortConfig,
        transactionsPage: safeTransactionsPage, setTransactionsPage: handleTransactionsPageChange,
        transactionsRowsPerPage, setTransactionsRowsPerPage: handleTransactionsRowsPerPageChange,
        selectedIds, setSelectedIds,
        anchorEl, setAnchorEl,
        menuTransaction, setMenuTransaction,
        transactions, isLoading,
        categories, accounts, cards,
        handleOpenMenu, handleCloseMenu,
        handleEdit, handleDelete, handleConfirmDelete,
        handleTogglePaid, handleConfirmPayment, handleBatchUnpay, handleBatchDelete,
        handleOpenBatchPayModal,
        handleAdd, handleImport, toggleGroup, handleSelectRow, handleSelectAll,
        handlePrevMonth, handleNextMonth, handleSort,
        filteredTransactions, summaries, groupedTransactions, paginatedGroupedTransactions,
        togglePaymentStatus // exposes isPending etc if needed
    };
}
