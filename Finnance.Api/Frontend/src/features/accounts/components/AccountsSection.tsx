import { Landmark } from 'lucide-react';
import { Button, Card, CardContent, EmptyState, Spinner } from '@/shared/components/ui';
import { useAccountsPageLogic } from '../hooks/useAccountsPageLogic';
import { AccountCard } from './AccountCard';
import { AccountFormModal } from './AccountFormModal';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export function AccountsSection() {
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
    <div className="space-y-4">
      <div className="flex justify-end">
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
            <EmptyState
              icon={Landmark}
              title="Nenhuma conta cadastrada"
              description="Crie sua primeira conta para começar a controlar suas finanças."
              action={<Button onClick={openCreate}>Criar conta</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
