import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@/shared/components/ui';
import {
  TransactionFormModal,
  TransactionsBatchBar,
  TransactionsFilters,
  TransactionsSummary,
  TransactionsTable,
  useTransactionsPageLogic,
} from '@/features/transactions';

export function TransactionsPage() {
  const {
    filter,
    transactions,
    summary,
    summaryLoading,
    isLoading,
    isError,
    isEmpty,
    page,
    hasNextPage,
    formOpen,
    selectedIds,
    pendingDelete,
    openForm,
    closeForm,
    updateFilter,
    resetFilter,
    goToPage,
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Transações</h1>
          <p className="text-sm text-text-muted">
            Acompanhe e gerencie suas receitas, despesas e transferências.
          </p>
        </div>
        <Button onClick={openForm}>Nova transação</Button>
      </div>

      <TransactionsSummary summary={summary} loading={summaryLoading} />

      <Card>
        <CardContent className="space-y-4">
          <TransactionsFilters filter={filter} onChange={updateFilter} onReset={resetFilter} />

          {isLoading ? (
            <div className="py-16">
              <Spinner />
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-expense">
              Não foi possível carregar os lançamentos.
            </p>
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-semibold text-text">Nenhum lançamento encontrado</p>
              <p className="text-sm text-text-muted">
                Ajuste os filtros ou registre uma nova transação.
              </p>
              <Button onClick={openForm}>Criar transação</Button>
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              selectedIds={selectedIds}
              page={page}
              hasNextPage={hasNextPage}
              onToggleSelect={toggleSelection}
              onToggleSelectAll={toggleSelectAll}
              onTogglePaid={togglePaid}
              onDuplicate={duplicate}
              onDelete={requestDelete}
              onPageChange={goToPage}
            />
          )}
        </CardContent>
      </Card>

      <TransactionsBatchBar
        selectedCount={selectedIds.length}
        onPay={batchPay}
        onUnpay={batchUnpay}
        onDelete={batchDelete}
        onChangeDay={batchChangeDay}
        onClear={clearSelection}
      />

      <TransactionFormModal open={formOpen} onClose={closeForm} />

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
