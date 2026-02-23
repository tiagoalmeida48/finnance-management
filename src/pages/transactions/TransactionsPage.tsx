import { useTransactionsPageLogic } from "@/pages/transactions/hooks/useTransactionsPageLogic";
import { TransactionsSummary } from "./components/summary/TransactionsSummary";
import { TransactionsFilter } from "./components/filters/TransactionsFilter";
import { TransactionsToolbar } from "./components/filters/TransactionsToolbar";
import { TransactionsTable } from "./components/tables/TransactionsTable";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { transactionsPageStyles } from "./TransactionsPage.styles";
import { TransactionsHeader } from "./components/headers/TransactionsHeader";
import { TransactionsRowMenu } from "./components/menus/TransactionsRowMenu";
import { TransactionsBulkActionsBar } from "./components/filters/TransactionsBulkActionsBar";
import { TransactionsModalsGateway } from "./components/modals/TransactionsModalsGateway";
import { Container } from "@/shared/components/layout/Container";
import { Section } from "@/shared/components/layout/Section";

export function TransactionsPage() {
  const isMobile = useMediaQuery("(max-width: 599px)");
  const {
    isLoading,
    summaries,
    typeFilter,
    setTypeFilter,
    showPendingOnly,
    setShowPendingOnly,
    showAllTime,
    setShowAllTime,
    showInstallmentsOnly,
    setShowInstallmentsOnly,
    currentMonth,
    setCurrentMonth,
    searchQuery,
    setSearchQuery,
    hideCreditCards,
    setHideCreditCards,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    accountFilter,
    setAccountFilter,
    cardFilter,
    setCardFilter,
    categories,
    accounts,
    cards,
    handlePrevMonth,
    handleNextMonth,
    selectedTransaction,
    setSelectedTransaction,
    modalOpen,
    setModalOpen,
    importModalOpen,
    setImportModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    changeDayModalOpen,
    setChangeDayModalOpen,
    batchDeleteModalOpen,
    setBatchDeleteModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    handleAdd,
    handleImport,
    groupedTransactions,
    paginatedGroupedTransactions,
    transactionsPage,
    setTransactionsPage,
    transactionsRowsPerPage,
    setTransactionsRowsPerPage,
    selectedIds,
    handleSelectAll,
    handleSelectRow,
    handleTogglePaid,
    handleOpenMenu,
    handleSort,
    sortConfig,
    expandedGroups,
    toggleGroup,
    anchorEl,
    handleCloseMenu,
    menuTransaction,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleDuplicate,
    handleInsertInstallmentBetween,
    handleConfirmPayment,
    handleBatchDelete,
    handleBatchUnpay,
    handleOpenBatchPayModal,
    handleOpenBatchChangeDayModal,
    handleOpenBatchDeleteModal,
    handleBatchChangeDay,
    batchChangeTransactionDay,
    batchDeleteTransactions,
    duplicateTransaction,
    insertInstallmentBetween,
    togglePaymentStatus,
  } = useTransactionsPageLogic();

  const hasSelection = selectedIds.length > 0;

  return (
    <Section className={hasSelection ? "pb-[88px]" : "pb-6"}>
      <Container>
        <Container unstyled className={transactionsPageStyles.content}>
          <TransactionsHeader
            isMobile={isMobile}
            onImport={handleImport}
            onAdd={handleAdd}
          />

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

          <TransactionsToolbar
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
            isPendingToggle={(id) =>
              togglePaymentStatus.isPending && selectedTransaction?.id === id
            }
          />

          <TransactionsRowMenu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl as HTMLElement | null}
            menuTransaction={menuTransaction}
            duplicatePending={duplicateTransaction.isPending}
            insertInstallmentPending={insertInstallmentBetween.isPending}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onInsertInstallmentBetween={handleInsertInstallmentBetween}
            onTogglePaid={() => {
              if (!menuTransaction) return;
              handleTogglePaid(menuTransaction);
            }}
            onDelete={handleDelete}
            onClose={handleCloseMenu}
          />

          <TransactionsBulkActionsBar
            selectedCount={selectedIds.length}
            onBatchPay={handleOpenBatchPayModal}
            onBatchUnpay={handleBatchUnpay}
            onBatchChangeDay={handleOpenBatchChangeDayModal}
            onBatchDelete={handleOpenBatchDeleteModal}
          />
        </Container>
      </Container>

      <TransactionsModalsGateway
        selectedTransaction={selectedTransaction}
        menuTransaction={menuTransaction}
        selectedIds={selectedIds}
        modalOpen={modalOpen}
        importModalOpen={importModalOpen}
        paymentModalOpen={paymentModalOpen}
        changeDayModalOpen={changeDayModalOpen}
        batchDeleteModalOpen={batchDeleteModalOpen}
        deleteModalOpen={deleteModalOpen}
        batchChangeDayPending={batchChangeTransactionDay.isPending}
        batchDeletePending={batchDeleteTransactions.isPending}
        setModalOpen={setModalOpen}
        setImportModalOpen={setImportModalOpen}
        setPaymentModalOpen={setPaymentModalOpen}
        setChangeDayModalOpen={setChangeDayModalOpen}
        setBatchDeleteModalOpen={setBatchDeleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        setSelectedTransaction={setSelectedTransaction}
        onConfirmDelete={handleConfirmDelete}
        onConfirmPayment={handleConfirmPayment}
        onConfirmBatchDelete={handleBatchDelete}
        onConfirmBatchChangeDay={handleBatchChangeDay}
      />
    </Section>
  );
}
