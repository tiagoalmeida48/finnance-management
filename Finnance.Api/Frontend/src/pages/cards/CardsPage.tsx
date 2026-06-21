import { Button, Card, CardContent, Spinner } from '@/shared/components/ui';
import {
  CardDetailModal,
  CardFormModal,
  CardItem,
  useCardsPageLogic,
} from '@/features/cards';

export function CardsPage() {
  const {
    cards,
    isLoading,
    isError,
    statsByCard,
    formOpen,
    editing,
    detailCard,
    saving,
    openCreate,
    openEdit,
    closeForm,
    handleSubmit,
    handleDelete,
    openDetail,
    closeDetail,
  } = useCardsPageLogic();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Cartões</h1>
          <p className="text-sm text-text-muted">
            Acompanhe os limites e as faturas dos seus cartões de crédito.
          </p>
        </div>
        <Button onClick={openCreate}>Novo cartão</Button>
      </div>

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <p className="text-expense">Não foi possível carregar os cartões.</p>
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-semibold text-text">Nenhum cartão cadastrado</p>
              <p className="text-sm text-text-muted">
                Cadastre seu primeiro cartão para acompanhar limites e faturas.
              </p>
              <Button onClick={openCreate}>Criar cartão</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardItem
              key={card.creditCard}
              card={card}
              stats={statsByCard.get(card.creditCard)}
              onView={openDetail}
              onEdit={openEdit}
              onDelete={handleDelete}
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
    </div>
  );
}
