import { Button, Card, CardContent, Spinner } from '@/shared/components/ui';
import {
  AccountCard,
  AccountFormModal,
  DeleteAccountDialog,
  useAccountsPageLogic,
} from '@/features/accounts';

export function AccountsPage() {
  const {
    accounts,
    isLoading,
    isError,
    accountTypes,
    accountTypeNames,
    formOpen,
    editingAccount,
    accountToDelete,
    submitting,
    deleting,
    openCreate,
    openEdit,
    handleFormOpenChange,
    submitForm,
    setAccountToDelete,
    confirmDelete,
  } = useAccountsPageLogic();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Contas</h1>
          <p className="text-sm text-text-muted">
            Gerencie suas contas bancárias e acompanhe os saldos.
          </p>
        </div>
        <Button onClick={openCreate}>Nova conta</Button>
      </div>

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <p className="text-expense">Não foi possível carregar as contas.</p>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-semibold text-text">Nenhuma conta cadastrada</p>
              <p className="text-sm text-text-muted">
                Crie sua primeira conta para começar a controlar suas finanças.
              </p>
              <Button onClick={openCreate}>Criar conta</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.bankAccount}
              account={account}
              accountTypeName={accountTypeNames.get(account.accountType)}
              onEdit={openEdit}
              onDelete={setAccountToDelete}
            />
          ))}
        </div>
      )}

      <AccountFormModal
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={submitForm}
        accountTypes={accountTypes}
        account={editingAccount}
        submitting={submitting}
      />

      <DeleteAccountDialog
        account={accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
      />
    </div>
  );
}
