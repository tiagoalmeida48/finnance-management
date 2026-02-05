import { Box, Container, Stack, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useTransactionsPageLogic } from '../shared/hooks/useTransactionsPageLogic';
import { TransactionsSummary } from '../shared/components/transactions/TransactionsSummary';
import { TransactionsFilter } from '../shared/components/transactions/TransactionsFilter';
import { TransactionsTable } from '../shared/components/transactions/TransactionsTable';
import { TransactionFormModal } from '../shared/components/transactions/TransactionFormModal';
import { DeleteTransactionModal } from '../shared/components/transactions/DeleteTransactionModal';
import { ImportTransactionsModal } from '../shared/components/transactions/ImportTransactionsModal';

export function TransactionsPage() {
    const {
        isLoading, summaries,
        typeFilter, setTypeFilter,
        showPendingOnly, setShowPendingOnly,
        showAllTime, setShowAllTime,
        currentMonth, setCurrentMonth,
        searchQuery, setSearchQuery,
        hideCreditCards, setHideCreditCards,
        categoryFilter, setCategoryFilter,
        paymentMethodFilter, setPaymentMethodFilter,
        categories,
        handlePrevMonth, handleNextMonth,
        selectedTransaction, setSelectedTransaction,
        modalOpen, setModalOpen,
        importModalOpen, setImportModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        handleAdd, handleImport,
        groupedTransactions, selectedIds, handleSelectAll, handleSelectRow,
        handleTogglePaid, handleOpenMenu, handleSort, sortConfig,
        expandedGroups, toggleGroup, anchorEl, handleCloseMenu,
        menuTransaction, handleEdit, handleDelete, handleConfirmDelete,
        togglePaymentStatus
    } = useTransactionsPageLogic();

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transações</Typography>
                        <Typography color="text.secondary">Controle suas receitas e despesas.</Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={handleImport}>Importar</Button>
                        <Button variant="contained" startIcon={<Plus />} onClick={handleAdd}>Nova Transação</Button>
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
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    hideCreditCards={hideCreditCards}
                    setHideCreditCards={setHideCreditCards}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    paymentMethodFilter={paymentMethodFilter}
                    setPaymentMethodFilter={setPaymentMethodFilter}
                    categories={categories}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                />

                <TransactionsTable
                    groupedTransactions={groupedTransactions}
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
                />

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{ sx: { minWidth: 150, mt: 1, bgcolor: '#121212', border: '1px solid #1F1F1F' } }}
                >
                    <MenuItem onClick={handleEdit}>
                        <Pencil size={16} style={{ marginRight: 8 }} /> Editar
                    </MenuItem>
                    <MenuItem onClick={() => menuTransaction && handleTogglePaid(menuTransaction)}>
                        <CheckCircle2 size={16} style={{ marginRight: 8 }} /> {menuTransaction?.is_paid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <Trash2 size={16} style={{ marginRight: 8 }} /> Excluir
                    </MenuItem>
                </Menu>

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
            </Container>
        </Box>
    );
}
