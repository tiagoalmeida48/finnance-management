import { CreditCard as CreditCardIcon } from 'lucide-react';
import { Button, Card, CardContent, EmptyState, PageHeader, Spinner } from '@/shared/components/ui';
import {
  CardDetailModal,
  CardFormModal,
  CardItem,
  DeleteCardDialog,
  useCardsPageLogic,
} from '@/features/cards';

export function CardsPage() {
  const {
    cards,
    isLoading,
    isError,
    refetch,
    statsByCard,
    formOpen,
    editing,
    detailCard,
    pendingDelete,
    saving,
    deleting,
    openCreate,
    openEdit,
    closeForm,
    handleSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    openDetail,
    closeDetail,
  } = useCardsPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CreditCardIcon}
        title="Cartões"
        description="Acompanhe os limites e as faturas dos seus cartões de crédito."
        actions={<Button onClick={openCreate}>Novo cartão</Button>}
      />

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-expense">Não foi possível carregar os cartões.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CreditCardIcon}
              title="Nenhum cartão cadastrado"
              description="Cadastre seu primeiro cartão para acompanhar limites e faturas."
              action={<Button onClick={openCreate}>Criar cartão</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <CardItem
              key={card.creditCard}
              card={card}
              stats={statsByCard.get(card.creditCard)}
              onView={openDetail}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      <CardFormModal
        open={formOpen}
        card={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <CardDetailModal card={detailCard} onClose={closeDetail} />

      <DeleteCardDialog
        card={pendingDelete}
        deleting={deleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
