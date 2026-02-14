import { Box, Container, Stack, Typography, Button, Menu, MenuItem, Slide } from '@mui/material';
import { Plus, Pencil, Trash2, CheckCircle2, Clock, Upload } from 'lucide-react';
import { useTransactionsPageLogic } from '../shared/hooks/useTransactionsPageLogic';
import { TransactionsSummary } from '../shared/components/transactions/TransactionsSummary';
import { TransactionsFilter } from '../shared/components/transactions/TransactionsFilter';
import { TransactionsTable } from '../shared/components/transactions/TransactionsTable';
import { TransactionFormModal } from '../shared/components/transactions/TransactionFormModal';
import { DeleteTransactionModal } from '../shared/components/transactions/DeleteTransactionModal';
import { ImportTransactionsModal } from '../shared/components/transactions/ImportTransactionsModal';
import { PaymentConfirmModal } from '../shared/components/cards/PaymentConfirmModal';
import { colors } from '@/shared/theme';

export function TransactionsPage() {
    const {
        isLoading, summaries,
        typeFilter, setTypeFilter,
        showPendingOnly, setShowPendingOnly,
        showAllTime, setShowAllTime,
        showInstallmentsOnly, setShowInstallmentsOnly,
        currentMonth, setCurrentMonth,
        searchQuery, setSearchQuery,
        hideCreditCards, setHideCreditCards,
        categoryFilter, setCategoryFilter,
        paymentMethodFilter, setPaymentMethodFilter,
        accountFilter, setAccountFilter,
        cardFilter, setCardFilter,
        categories, accounts, cards,
        handlePrevMonth, handleNextMonth,
        selectedTransaction, setSelectedTransaction,
        modalOpen, setModalOpen,
        importModalOpen, setImportModalOpen,
        paymentModalOpen, setPaymentModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        handleAdd, handleImport,
        groupedTransactions, paginatedGroupedTransactions, transactionsPage, setTransactionsPage,
        transactionsRowsPerPage, setTransactionsRowsPerPage, selectedIds, handleSelectAll, handleSelectRow,
        handleTogglePaid, handleOpenMenu, handleSort, sortConfig,
        expandedGroups, toggleGroup, anchorEl, handleCloseMenu,
        menuTransaction, handleEdit, handleDelete, handleConfirmDelete,
        handleConfirmPayment,
        handleBatchDelete,
        handleBatchUnpay,
        handleOpenBatchPayModal,
        togglePaymentStatus
    } = useTransactionsPageLogic();

    const hasSelection = selectedIds.length > 0;

    return (
        <Box sx={{ pt: 4, pb: hasSelection ? 12 : 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                {/* Page Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography sx={{
                            fontSize: '28px',
                            fontFamily: '"Plus Jakarta Sans"',
                            fontWeight: 700,
                            color: colors.textPrimary,
                            mb: 0.5,
                        }}>
                            Transações
                        </Typography>
                        <Typography sx={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                        }}>
                            Controle suas receitas e despesas.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {/* Import Button (Secondary) */}
                        <Button
                            variant="outlined"
                            startIcon={<Upload size={16} />}
                            onClick={handleImport}
                            sx={{
                                borderRadius: '10px',
                                px: 2.5,
                                py: 1.25,
                                fontSize: '13px',
                                fontWeight: 500,
                                borderColor: 'rgba(255,255,255,0.1)',
                                color: colors.textSecondary,
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    color: colors.textPrimary,
                                    bgcolor: 'transparent',
                                },
                            }}
                        >
                            Importar
                        </Button>
                        {/* New Transaction Button (CTA) */}
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={handleAdd}
                            sx={{
                                borderRadius: '10px',
                                px: 2.5,
                                py: 1.25,
                                fontSize: '13px',
                                fontWeight: 600,
                                bgcolor: colors.accent,
                                color: colors.bgPrimary,
                                boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                                '&:hover': {
                                    bgcolor: '#D4B85C',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
                                },
                            }}
                        >
                            Nova Transação
                        </Button>
                    </Stack>
                </Stack>

                <TransactionsSummary summaries={summaries} isLoading={isLoading} />

                <TransactionsFilter
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    showPendingOnly={showPendingOnly}
                    setShowPendingOnly={setShowPendingOnly}
                    showAllTime={showAllTime}
                    setShowAllTime={setShowAllTime}
                    showInstallmentsOnly={showInstallmentsOnly}
                    setShowInstallmentsOnly={setShowInstallmentsOnly}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    hideCreditCards={hideCreditCards}
                    setHideCreditCards={setHideCreditCards}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                />

                <TransactionsTable
                    groupedTransactions={paginatedGroupedTransactions}
                    totalItems={groupedTransactions.length}
                    page={transactionsPage}
                    rowsPerPage={transactionsRowsPerPage}
                    onPageChange={setTransactionsPage}
                    onRowsPerPageChange={setTransactionsRowsPerPage}
                    selectedIds={selectedIds}
                    handleSelectAll={handleSelectAll}
                    handleSelectRow={handleSelectRow}
                    handleTogglePaid={handleTogglePaid}
                    handleOpenMenu={handleOpenMenu}
                    handleSort={handleSort}
                    sortConfig={sortConfig}
                    expandedGroups={expandedGroups}
                    toggleGroup={toggleGroup}
                    isPendingToggle={(id) => togglePaymentStatus.isPending && selectedTransaction?.id === id}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    paymentMethodFilter={paymentMethodFilter}
                    setPaymentMethodFilter={setPaymentMethodFilter}
                    accountFilter={accountFilter}
                    setAccountFilter={setAccountFilter}
                    cardFilter={cardFilter}
                    setCardFilter={setCardFilter}
                    categories={categories}
                    accounts={accounts}
                    cards={cards}
                />

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    slotProps={{
                        paper: {
                            sx: {
                                minWidth: 150,
                                mt: 1,
                                bgcolor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '10px',
                            }
                        }
                    }}
                >
                    <MenuItem onClick={handleEdit} sx={{ fontSize: '13px', py: 1.5 }}>
                        <Pencil size={16} style={{ marginRight: 10 }} /> Editar
                    </MenuItem>
                    <MenuItem
                        onClick={() => menuTransaction && handleTogglePaid(menuTransaction)}
                        sx={{ fontSize: '13px', py: 1.5 }}
                    >
                        <CheckCircle2 size={16} style={{ marginRight: 10 }} />
                        {menuTransaction?.is_paid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ fontSize: '13px', py: 1.5, color: colors.red }}>
                        <Trash2 size={16} style={{ marginRight: 10 }} /> Excluir
                    </MenuItem>
                </Menu>

                {/* Batch Actions Bar */}
                <Slide direction="up" in={hasSelection} mountOnEnter unmountOnExit>
                    <Box sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: colors.bgCardHover,
                        borderTop: `1px solid rgba(255,255,255,0.08)`,
                        borderRadius: '16px 16px 0 0',
                        px: 3,
                        py: 1.5,
                        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                    }}>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
                            <Typography sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: colors.textPrimary,
                            }}>
                                {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    size="small"
                                    startIcon={<CheckCircle2 size={14} />}
                                    onClick={handleOpenBatchPayModal}
                                    sx={{
                                        borderRadius: '8px',
                                        px: 2,
                                        py: 1,
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        bgcolor: colors.greenBg,
                                        color: colors.green,
                                        '&:hover': {
                                            bgcolor: 'rgba(16, 185, 129, 0.2)',
                                        },
                                    }}
                                >
                                    Marcar Pago
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<Clock size={14} />}
                                    onClick={handleBatchUnpay}
                                    sx={{
                                        borderRadius: '8px',
                                        px: 2,
                                        py: 1,
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        bgcolor: colors.yellowBg,
                                        color: colors.yellow,
                                        '&:hover': {
                                            bgcolor: 'rgba(245, 158, 11, 0.2)',
                                        },
                                    }}
                                >
                                    Marcar Pendente
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<Trash2 size={14} />}
                                    onClick={handleBatchDelete}
                                    sx={{
                                        borderRadius: '8px',
                                        px: 2,
                                        py: 1,
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        border: `1px solid ${colors.red}`,
                                        color: colors.red,
                                        '&:hover': {
                                            bgcolor: colors.redBg,
                                        },
                                    }}
                                >
                                    Excluir
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Slide>

                {/* Modals */}
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
                    onConfirm={handleConfirmDelete}
                    transaction={menuTransaction}
                />

                <ImportTransactionsModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                />

                <PaymentConfirmModal
                    open={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedTransaction(undefined);
                    }}
                    onConfirm={handleConfirmPayment}
                />
            </Container>
        </Box>
    );
}
