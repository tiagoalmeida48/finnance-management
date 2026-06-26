import { Landmark, Wallet } from 'lucide-react';
import { Button, Card, CardContent, EmptyState, PageHeader, Spinner } from '@/shared/components/ui';
import { AccountFormModal, DeleteAccountDialog } from '@/features/accounts';
import { CardDetailModal, CardFormModal, CardRow, DeleteCardDialog } from '@/features/cards';
import { AccountWithCards, useFinancesPageLogic } from '@/features/finances';

export function FinancesPage() {
  const { accounts, cards, groups, orphanCards } = useFinancesPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title="Contas e Cartões"
        description="Gerencie suas contas bancárias e os cartões de crédito vinculados a elas."
        actions={<Button onClick={accounts.openCreate}>Nova conta</Button>}
      />

      {accounts.isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : accounts.isError ? (
        <Card>
          <CardContent>
            <p className="text-expense">Não foi possível carregar as contas.</p>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Landmark}
              title="Nenhuma conta cadastrada"
              description="Crie sua primeira conta para começar a controlar suas finanças."
              action={<Button onClick={accounts.openCreate}>Criar conta</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <AccountWithCards
              key={group.account.bankAccount}
              account={group.account}
              accountTypeName={group.accountTypeName}
              cards={group.cards}
              statsByCard={cards.statsByCard}
              onEditAccount={accounts.openEdit}
              onDeleteAccount={accounts.setAccountToDelete}
              onAddCard={cards.openCreate}
              onViewCard={cards.openDetail}
              onEditCard={cards.openEdit}
              onDeleteCard={cards.requestDelete}
            />
          ))}

          {orphanCards.length > 0 && (
            <Card className="space-y-3">
              <div>
                <h2 className="font-semibold text-text">Outros cartões</h2>
                <p className="text-sm text-text-muted">Cartões sem uma conta vinculada.</p>
              </div>
              <div className="space-y-2">
                {orphanCards.map((card) => (
                  <CardRow
                    key={card.creditCard}
                    card={card}
                    stats={cards.statsByCard.get(card.creditCard)}
                    onView={cards.openDetail}
                    onEdit={cards.openEdit}
                    onDelete={cards.requestDelete}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <AccountFormModal
        open={accounts.formOpen}
        onOpenChange={accounts.handleFormOpenChange}
        onSubmit={accounts.submitForm}
        accountTypes={accounts.accountTypes}
        account={accounts.editingAccount}
        submitting={accounts.submitting}
      />
      <DeleteAccountDialog
        account={accounts.accountToDelete}
        onOpenChange={(open) => !open && accounts.setAccountToDelete(null)}
        onConfirm={accounts.confirmDelete}
        deleting={accounts.deleting}
      />

      <CardFormModal
        open={cards.formOpen}
        card={cards.editing}
        saving={cards.saving}
        defaultBankAccount={cards.createBankAccount}
        onClose={cards.closeForm}
        onSubmit={cards.handleSubmit}
      />
      <CardDetailModal card={cards.detailCard} onClose={cards.closeDetail} />
      <DeleteCardDialog
        card={cards.pendingDelete}
        deleting={cards.deleting}
        onClose={cards.cancelDelete}
        onConfirm={cards.confirmDelete}
      />
    </div>
  );
}
