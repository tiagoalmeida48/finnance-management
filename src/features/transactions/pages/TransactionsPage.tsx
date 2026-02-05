import { useState, useMemo, Fragment } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Collapse,
    Checkbox,
    Paper,
    Fade,
    Grid,
    TextField,
    InputAdornment,
    TableSortLabel,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel
} from '@mui/material';
import {
    Plus,
    MoreVertical,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Upload,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Search,
} from 'lucide-react';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { PaymentConfirmModal } from '../components/PaymentConfirmModal';
import { ImportTransactionsModal } from '../components/ImportTransactionsModal';
import { DeleteTransactionModal } from '../components/DeleteTransactionModal';
import {
    useTransactions,
    useDeleteTransaction,
    useTogglePaymentStatus,
    useBatchDeleteTransactions,
    useBatchPayTransactions,
    useBatchUnpayTransactions,
    useDeleteTransactionGroup,
    useFirstTransactionDate
} from '../hooks/useTransactions';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { Transaction } from '../services/transactions.service';

interface TransactionGroup {
    id: string;
    isGroup: boolean;
    type: 'installment' | 'recurring';
    mainTransaction: Transaction;
    items: Transaction[];
    totalAmount: number;
    paidAmount: number;
    isAllPaid: boolean;
}

export function TransactionsPage() {
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

    // Filter & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method'; direction: 'asc' | 'desc' }>({
        field: 'payment_date',
        direction: 'desc'
    });

    // Multi-selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuTransaction, setMenuTransaction] = useState<Transaction | null>(null);

    const { data: transactions, isLoading: transactionsLoading } = useTransactions({
        start_date: showAllTime ? undefined : format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        end_date: showAllTime ? undefined : format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
        is_paid: showPendingOnly ? false : undefined
    });
    const { data: accounts, isLoading: accountsLoading } = useAccounts();
    const { data: firstTransactionDate } = useFirstTransactionDate();
    const isLoading = transactionsLoading || accountsLoading;
    const { data: categories } = useCategories();
    const deleteTransaction = useDeleteTransaction();
    const batchDeleteTransactions = useBatchDeleteTransactions();
    const batchPayTransactions = useBatchPayTransactions();
    const batchUnpayTransactions = useBatchUnpayTransactions();
    const deleteTransactionGroup = useDeleteTransactionGroup();
    const togglePaymentStatus = useTogglePaymentStatus();

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
            // Open payment confirm modal for paying
            setSelectedTransaction(transaction);
            setPaymentModalOpen(true);
        } else {
            // Unmark as paid directly (or we could show modal too, but usually unmarking is simpler)
            togglePaymentStatus.mutate({
                id: transaction.id,
                currentStatus: true
            });
        }
    };

    const handleConfirmPayment = async (data: { account_id: string; payment_date: string }) => {
        try {
            if (selectedIds.length > 0) {
                // Batch pay
                await batchPayTransactions.mutateAsync({
                    ids: selectedIds,
                    accountId: data.account_id,
                    paymentDate: data.payment_date
                });
                setSelectedIds([]);
            } else if (selectedTransaction) {
                // Single pay
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

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && transactions) {
            // Respect current type filter
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

    const { filteredTransactions, summaries } = useMemo(() => {
        if (!transactions) return { filteredTransactions: [], summaries: { income: 0, expense: 0, balance: 0, pending: 0 } };

        const filtered = transactions.filter(t => {
            if (typeFilter && t.type !== typeFilter) return false;

            // Text Search
            if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            // Category Filter
            if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;

            // Payment Method Filter
            if (paymentMethodFilter !== 'all' && t.payment_method !== paymentMethodFilter) return false;

            // Hide Credit Cards
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
                // Only count as expense if it's NOT a credit card purchase (consumption)
                // Credit card bill payments (Pgto Fatura) do NOT have a card_id in their specific transaction record
                // even though they refer to a card in notes.
                if (!t.card_id) {
                    acc.expense += amount;
                }
            } else if (t.type === 'transfer') {
                // Transfers count only as expense as requested
                acc.expense += amount;
            }

            if (!t.is_paid) acc.pending += amount;
            return acc;
        }, { income: baseIncome, expense: 0, balance: 0, pending: 0 });

        const summaries = { ...stats, balance: stats.income - stats.expense };

        // Sorting
        filtered.sort((a, b) => {
            const field = sortConfig.field;
            let valA: any = a[field as keyof Transaction];
            let valB: any = b[field as keyof Transaction];

            // Specific logic for joined fields or derived ones
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
                    if (groupType === 'installment') {
                        return (a.installment_number || 0) - (b.installment_number || 0);
                    }
                    return new Date(a.payment_date + 'T12:00:00').getTime() - new Date(b.payment_date + 'T12:00:00').getTime();
                });
                group.mainTransaction = group.items[0];
            } else {
                groups.push(t);
            }
        });

        return groups;
    }, [filteredTransactions]);

    const handleSort = (field: keyof Transaction | 'amount' | 'payment_date' | 'is_paid' | 'payment_method') => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const renderPrice = (amount: number, type: string) => (
        <Typography variant="body2" sx={{
            fontWeight: 700,
            color: type === 'income' ? 'success.main' : type === 'expense' ? 'error.main' : '#FACC15'
        }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </Typography>
    );

    const renderTransactionRow = (t: Transaction, isChild = false) => (
        <TableRow key={t.id} sx={{
            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
            bgcolor: selectedIds.includes(t.id) ? 'rgba(212, 175, 55, 0.05)' : isChild ? 'rgba(255,255,255,0.01)' : 'transparent',
            transition: 'opacity 0.2s',
            opacity: togglePaymentStatus.isPending && togglePaymentStatus.variables?.id === t.id ? 0.6 : 1
        }}>
            <TableCell padding="checkbox">
                <Checkbox
                    size="small"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => handleSelectRow(t.id)}
                />
            </TableCell>
            <TableCell sx={{ width: 48, py: 1 }}>
                {!t.card_id ? (
                    <Checkbox
                        size="small"
                        checked={t.is_paid}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePaid(t);
                        }}
                        icon={<Clock size={16} style={{ opacity: 0.3 }} />}
                        checkedIcon={<CheckCircle2 size={16} color="#D4AF37" />}
                        sx={{ p: 0.5 }}
                    />
                ) : (
                    <Tooltip title="Pago via fatura">
                        <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
                            <CreditCard size={16} style={{ opacity: 0.5 }} />
                        </Box>
                    </Tooltip>
                )}
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', width: 100, fontSize: '0.85rem' }}>
                {format(new Date(t.payment_date + 'T12:00:00'), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {!isChild && (
                        <Box sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: t.type === 'income' ? 'rgba(46, 125, 50, 0.1)' :
                                t.type === 'expense' ? 'rgba(211, 47, 47, 0.1)' :
                                    'rgba(212, 175, 55, 0.1)',
                            color: t.type === 'income' ? 'success.main' :
                                t.type === 'expense' ? 'error.main' :
                                    'primary.main'
                        }}>
                            {t.type === 'income' ? <ArrowUpRight size={16} /> :
                                t.type === 'expense' ? <ArrowDownLeft size={16} /> :
                                    <ArrowRightLeft size={16} />}
                        </Box>
                    )}
                    {isChild && <Box sx={{ width: 32 }} />}
                    <Box sx={{ opacity: t.is_paid ? 1 : 0.6 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.description}</Typography>
                            {t.is_fixed && (
                                <Tooltip title="Recorrente">
                                    <RefreshCw size={12} style={{ opacity: 0.5 }} />
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {t.installment_number && (
                                <Chip
                                    label={`${t.installment_number}/${t.total_installments}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 16, fontSize: '0.65rem', borderColor: 'primary.main', color: 'primary.main' }}
                                />
                            )}
                            {t.is_fixed && (
                                <Chip label="Fixo" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.65rem' }} />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell>
                {t.type !== 'transfer' ? (
                    <Chip
                        label={t.category?.name || 'Sem Categoria'}
                        size="small"
                        sx={{
                            bgcolor: t.category?.color ? `${t.category.color}20` : 'rgba(255,255,255,0.05)',
                            color: t.category?.color || 'inherit',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.75rem',
                            opacity: t.is_paid ? 1 : 0.6
                        }}
                    />
                ) : '-'}
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        fontSize: '1.2rem',
                        opacity: t.is_paid ? 1 : 0.6,
                        filter: t.is_paid ? 'none' : 'grayscale(1)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {t.payment_method === 'money' && '💵'}
                        {t.payment_method === 'debit' && '💳'}
                        {t.payment_method === 'credit' && '💳'}
                        {t.payment_method === 'pix' && '📱'}
                        {(!t.payment_method && t.card_id) && '💳'}
                        {(!t.payment_method && !t.card_id && t.type !== 'transfer') && '🏦'}
                        {t.type === 'transfer' && '🔄'}
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', opacity: t.is_paid ? 1 : 0.6 }}>
                            {t.payment_method === 'money' && 'Dinheiro'}
                            {t.payment_method === 'debit' && 'Débito'}
                            {t.payment_method === 'credit' && 'Crédito'}
                            {t.payment_method === 'pix' && 'PIX'}
                            {t.type === 'transfer' && 'Transferência'}
                            {!t.payment_method && (t.card_id ? 'Cartão' : 'Conta')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                            {t.type === 'transfer' ?
                                `${t.bank_account?.name} → ${t.to_bank_account?.name}` :
                                (t.credit_card?.name || t.bank_account?.name || '-')}
                        </Typography>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell align="right">
                {renderPrice(t.amount, t.type)}
            </TableCell>
            <TableCell align="right" sx={{ width: 48 }}>
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, t)}>
                    <MoreVertical size={16} />
                </IconButton>
            </TableCell>
        </TableRow>
    );

    const formatPrice = (amount: number, _type?: string) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transações</Typography>
                        <Typography color="text.secondary">Histórico detalhado de suas entradas e saídas.</Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<Upload size={18} />}
                            size="large"
                            onClick={() => setImportModalOpen(true)}
                        >
                            Importar CSV
                        </Button>
                        <Button variant="contained" startIcon={<Plus />} size="large" onClick={handleAdd}>
                            Nova Transação
                        </Button>
                    </Stack>
                </Stack>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                        { title: 'Receitas', value: summaries.income, color: '#2E7D32', icon: <ArrowUpRight size={20} /> },
                        { title: 'Despesas', value: summaries.expense, color: '#D32F2F', icon: <ArrowDownLeft size={20} /> },
                        { title: 'Saldo', value: summaries.balance, color: summaries.balance >= 0 ? '#2E7D32' : '#D32F2F', icon: <ArrowRightLeft size={20} /> },
                        { title: 'Pendente', value: summaries.pending, color: '#E5C158', icon: <Clock size={20} /> },
                    ].map((card, idx) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${card.color}15`, color: card.color, display: 'flex' }}>
                                            {card.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{card.title}</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: card.color }}>
                                                {isLoading ? '...' : formatPrice(card.value, card.title === 'Despesas' ? 'expense' : 'income')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #2A2A2A' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <ToggleButtonGroup
                                        size="small"
                                        value={typeFilter}
                                        exclusive
                                        onChange={(_, value) => {
                                            setTypeFilter(value);
                                            setSelectedIds([]);
                                        }}
                                        fullWidth
                                        sx={{ borderColor: '#2A2A2A' }}
                                    >
                                        <ToggleButton value="income" sx={{ px: 2, flex: 1 }}>Receitas</ToggleButton>
                                        <ToggleButton value="expense" sx={{ px: 2, flex: 1 }}>Despesas</ToggleButton>
                                        <ToggleButton value="transfer" sx={{ px: 2, flex: 1 }}>Transf.</ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>

                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack direction="row" spacing={1}>
                                        <ToggleButtonGroup
                                            size="small"
                                            value={showPendingOnly ? 'pending' : 'all'}
                                            exclusive
                                            onChange={(_, value) => {
                                                if (value !== null) setShowPendingOnly(value === 'pending');
                                                setSelectedIds([]);
                                            }}
                                            fullWidth
                                            sx={{ borderColor: '#2A2A2A' }}
                                        >
                                            <ToggleButton value="all" sx={{ px: 2, flex: 1 }}>Todos</ToggleButton>
                                            <ToggleButton value="pending" sx={{ px: 2, flex: 1 }}>Pendentes</ToggleButton>
                                        </ToggleButtonGroup>

                                        <ToggleButtonGroup
                                            size="small"
                                            value={showAllTime ? 'all' : 'monthly'}
                                            exclusive
                                            onChange={(_, value) => {
                                                if (value !== null) {
                                                    setShowAllTime(value === 'all');
                                                    setSelectedIds([]);
                                                }
                                            }}
                                            sx={{ borderColor: '#2A2A2A' }}
                                        >
                                            <ToggleButton value="monthly" sx={{ px: 2 }}>Mês</ToggleButton>
                                            <ToggleButton value="all" sx={{ px: 2 }}>Geral</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, md: 4 }}>
                                    {!showAllTime && (
                                        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                                <Select
                                                    value={currentMonth.getMonth()}
                                                    onChange={(e) => {
                                                        const newDate = new Date(currentMonth);
                                                        newDate.setMonth(e.target.value as number);
                                                        setCurrentMonth(newDate);
                                                    }}
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.02)',
                                                        '& fieldset': { borderColor: '#2A2A2A' },
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {[
                                                        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                                    ].map((month, idx) => (
                                                        <MenuItem key={idx} value={idx}>{month}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <Select
                                                    value={currentMonth.getFullYear()}
                                                    onChange={(e) => {
                                                        const newDate = new Date(currentMonth);
                                                        newDate.setFullYear(e.target.value as number);
                                                        setCurrentMonth(newDate);
                                                    }}
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.02)',
                                                        '& fieldset': { borderColor: '#2A2A2A' },
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Stack direction="row">
                                                <IconButton size="small" onClick={handlePrevMonth}><ChevronLeft size={18} /></IconButton>
                                                <IconButton size="small" onClick={handleNextMonth}><ChevronRight size={18} /></IconButton>
                                            </Stack>
                                        </Stack>
                                    )}
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <TextField
                                                size="small"
                                                placeholder="Buscar descrição..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                fullWidth
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Search size={18} style={{ opacity: 0.5 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        bgcolor: 'rgba(255,255,255,0.02)',
                                                        '& fieldset': { borderColor: '#2A2A2A' },
                                                    }
                                                }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={hideCreditCards}
                                                        onChange={(e) => setHideCreditCards(e.target.checked)}
                                                        sx={{ color: '#2A2A2A', '&.Mui-checked': { color: 'primary.main' } }}
                                                    />
                                                }
                                                label={<Typography variant="caption" sx={{ whiteSpace: 'nowrap', opacity: 0.8 }}>Ocultar Cartão</Typography>}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2 }}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel id="category-filter-label" sx={{ fontSize: '0.85rem' }}>Categoria</InputLabel>
                                            <Select
                                                labelId="category-filter-label"
                                                value={categoryFilter}
                                                label="Categoria"
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' } }}
                                            >
                                                <MenuItem value="all">Todas</MenuItem>
                                                {categories?.map(c => (
                                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2 }}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel id="payment-method-filter-label" sx={{ fontSize: '0.85rem' }}>Método</InputLabel>
                                            <Select
                                                labelId="payment-method-filter-label"
                                                value={paymentMethodFilter}
                                                label="Método"
                                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                                sx={{ bgcolor: 'rgba(255,255,255,0.02)', '& fieldset': { borderColor: '#2A2A2A' } }}
                                            >
                                                <MenuItem value="all">Todos</MenuItem>
                                                <MenuItem value="credit">Cartão de Crédito</MenuItem>
                                                <MenuItem value="debit">Débito</MenuItem>
                                                <MenuItem value="pix">PIX</MenuItem>
                                                <MenuItem value="money">Dinheiro</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                indeterminate={selectedIds.length > 0 && selectedIds.length < (transactions?.length || 0)}
                                                checked={selectedIds.length > 0 && selectedIds.length === (transactions?.length || 0)}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'is_paid'}
                                                direction={sortConfig.field === 'is_paid' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('is_paid')}
                                            >
                                                Pago
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'payment_date'}
                                                direction={sortConfig.field === 'payment_date' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('payment_date')}
                                            >
                                                Data
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'description'}
                                                direction={sortConfig.field === 'description' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('description')}
                                            >
                                                Descrição
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'category_id'}
                                                direction={sortConfig.field === 'category_id' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('category_id')}
                                            >
                                                Categoria
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'payment_method'}
                                                direction={sortConfig.field === 'payment_method' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('payment_method')}
                                            >
                                                Forma de Pagamento
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            <TableSortLabel
                                                active={sortConfig.field === 'amount'}
                                                direction={sortConfig.field === 'amount' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('amount')}
                                            >
                                                Valor
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={32} color="primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : groupedTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                                Nenhuma transação encontrada.
                                            </TableCell>
                                        </TableRow>
                                    ) : groupedTransactions.map((item) => {
                                        if ('isGroup' in item) {
                                            const isExpanded = !!expandedGroups[item.id];
                                            const allGroupIds = item.items.map(t => t.id);
                                            const isSomeSelected = allGroupIds.some(id => selectedIds.includes(id));
                                            const isAllSelected = allGroupIds.every(id => selectedIds.includes(id));

                                            return (
                                                <Fragment key={item.id}>
                                                    <TableRow sx={{
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                                        bgcolor: isAllSelected ? 'rgba(212, 175, 55, 0.05)' : 'transparent'
                                                    }}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                size="small"
                                                                indeterminate={isSomeSelected && !isAllSelected}
                                                                checked={isAllSelected}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSelectedIds(prev => {
                                                                        const otherIds = prev.filter(id => !allGroupIds.includes(id));
                                                                        return checked ? [...otherIds, ...allGroupIds] : otherIds;
                                                                    });
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {item.isAllPaid ?
                                                                <CheckCircle2 size={16} color="#D4AF37" /> :
                                                                <Clock size={16} style={{ opacity: 0.3 }} />
                                                            }
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                                            {item.type === 'installment' ? 'Várias datas' : 'Recorrente'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <IconButton size="small" onClick={() => toggleGroup(item.id)}>
                                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </IconButton>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {item.type === 'installment' ?
                                                                            `${item.mainTransaction.description.split(' (')[0]} (Parcelamento)` :
                                                                            `${item.mainTransaction.description} (Recorrente)`
                                                                        }
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {item.items.length} ocorrências • {item.mainTransaction.credit_card?.name || item.mainTransaction.bank_account?.name || 'Conta'}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={item.mainTransaction.category?.name || 'Sem Categoria'}
                                                                size="small"
                                                                sx={{ bgcolor: item.mainTransaction.category?.color ? `${item.mainTransaction.category.color}20` : 'rgba(255,255,255,0.05)', color: item.mainTransaction.category?.color || 'inherit', fontWeight: 600, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                                                {item.mainTransaction.credit_card?.name || item.mainTransaction.bank_account?.name || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {renderPrice(item.totalAmount, item.mainTransaction.type)}
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.paidAmount)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right"></TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                                                            <Collapse in={isExpanded}>
                                                                <Table size="small">
                                                                    <TableBody>
                                                                        {item.items.map(t => renderTransactionRow(t, true))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>
                                                </Fragment>
                                            );
                                        } else {
                                            return renderTransactionRow(item as Transaction);
                                        }
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Batch Actions Toolbar */}
                <Fade in={selectedIds.length > 0}>
                    <Paper
                        elevation={6}
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'background.paper',
                            p: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            zIndex: 1000
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'background.paper',
                                fontWeight: 700,
                                fontSize: '0.75rem'
                            }}>
                                {selectedIds.length}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>selecionados</Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<CheckCircle2 size={16} />}
                                onClick={() => setPaymentModalOpen(true)}
                                sx={{ color: 'background.paper' }}
                            >
                                Marcar como Pago
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<RefreshCw size={16} />}
                                onClick={handleBatchUnpay}
                                disabled={batchUnpayTransactions.isPending}
                            >
                                Desfazer Pagamento
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<Trash2 size={16} />}
                                onClick={handleBatchDelete}
                                disabled={batchDeleteTransactions.isPending}
                            >
                                Excluir
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => setSelectedIds([])}
                                sx={{ color: 'text.secondary' }}
                            >
                                Cancelar
                            </Button>
                        </Stack>
                    </Paper>
                </Fade>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{
                        sx: { bgcolor: 'background.paper', border: '1px solid #2A2A2A', minWidth: 150 }
                    }}
                >
                    <MenuItem onClick={() => { if (menuTransaction) handleTogglePaid(menuTransaction); handleCloseMenu(); }}>
                        <CreditCard size={16} style={{ marginRight: 8 }} /> {menuTransaction?.is_paid ? 'Marcar como Pendente' : 'Pagar Agora'}
                    </MenuItem>
                    <MenuItem onClick={handleEdit}>
                        <Pencil size={16} style={{ marginRight: 8 }} /> Editar
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <Trash2 size={16} style={{ marginRight: 8 }} /> Excluir
                    </MenuItem>
                </Menu>

                <TransactionFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    transaction={selectedTransaction}
                />

                <PaymentConfirmModal
                    open={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedTransaction(undefined);
                    }}
                    onConfirm={handleConfirmPayment}
                    title={selectedIds.length > 1 ? `Pagar ${selectedIds.length} Transações` : 'Confirmar Pagamento'}
                    loading={batchPayTransactions.isPending}
                />

                <ImportTransactionsModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                />

                <DeleteTransactionModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setMenuTransaction(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    transaction={menuTransaction}
                    loading={deleteTransaction.isPending || deleteTransactionGroup.isPending}
                />
            </Container>
        </Box>
    );
}
