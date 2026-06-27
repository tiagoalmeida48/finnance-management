import { ArrowLeftRight, Upload } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  PageHeader,
  Spinner,
} from '@/shared/components/ui';
import {
  TransactionFormModal,
  TransactionImportModal,
  TransactionsBatchBar,
  TransactionsFilters,
  TransactionsSummary,
  TransactionsTable,
  useTransactionsPageLogic,
} from '@/features/transactions';

export function TransactionsPage() {
  const {
    filter,
    items,
    summary,
    summaryLoading,
    isLoading,
    isError,
    isEmpty,
    page,
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
    openForm,
    openImport,
    closeImport,
    openEdit,
    closeForm,
    updateFilter,
    goToPage,
    viewMode,
    monthLabel,
    setTypeFilter,
    setStatusFilter,
    toggleHideCards,
    setViewMode,
    prevMonth,
    nextMonth,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    togglePaid,
    duplicate,
    requestDelete,
    cancelDelete,
    confirmDelete,
    deleting,
    batchPay,
    batchUnpay,
    batchDelete,
    batchChangeDay,
  } = useTransactionsPageLogic();

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        icon={ArrowLeftRight}
        title="Transações"
        description="Acompanhe e gerencie suas receitas, despesas e transferências."
        actions={
          <>
            <Button variant="outline" onClick={openImport}>
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            <Button onClick={openForm}>Nova transação</Button>
          </>
        }
      />

      <TransactionsSummary summary={summary} loading={summaryLoading} />

      <Card>
        <CardContent className="space-y-4">
          <TransactionsFilters
            filter={filter}
            viewMode={viewMode}
            monthLabel={monthLabel}
            onChange={updateFilter}
            onTypeChange={setTypeFilter}
            onStatusChange={setStatusFilter}
            onToggleHideCards={toggleHideCards}
            onViewChange={setViewMode}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />

          {isLoading ? (
            <div className="py-16">
              <Spinner />
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-expense">
              Não foi possível carregar os lançamentos.
            </p>
          ) : isEmpty ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="Nenhum lançamento encontrado"
              description="Ajuste os filtros ou registre uma nova transação."
              action={<Button onClick={openForm}>Criar transação</Button>}
            />
          ) : (
            <TransactionsTable
              items={items}
              selectedIds={selectedIds}
              page={page}
              totalLines={totalLines}
              hasNextPage={hasNextPage}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              onToggleSelect={toggleSelection}
              onToggleSelectAll={toggleSelectAll}
              onTogglePaid={togglePaid}
              onEdit={openEdit}
              onDuplicate={duplicate}
              onDelete={requestDelete}
              onPageChange={goToPage}
            />
          )}
        </CardContent>
      </Card>

      <TransactionsBatchBar
        selectedCount={selectedIds.length}
        disablePayment={selectionHasCard}
        onPay={batchPay}
        onUnpay={batchUnpay}
        onDelete={batchDelete}
        onChangeDay={batchChangeDay}
        onClear={clearSelection}
      />

      <TransactionFormModal open={formOpen} editing={editing} onClose={closeForm} />

      <TransactionImportModal open={importOpen} onClose={closeImport} />

      <Dialog
        open={!!pendingDelete}
        onOpenChange={(value) => (value ? undefined : cancelDelete())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lançamento</DialogTitle>
          </DialogHeader>
          <p className="text-text-muted">
            Tem certeza que deseja excluir{' '}
            <span className="font-semibold text-text">{pendingDelete?.description}</span>? Essa ação
            não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelDelete} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
