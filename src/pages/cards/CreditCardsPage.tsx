import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreditCardsPageLogic } from "@/pages/cards/hooks/useCreditCardsPageLogic";
import { CreditCardCard } from "./components/cards/CreditCardCard";
import { CardFormModal } from "./components/modals/CardFormModal";
import { DeleteConfirmationModal } from "@/shared/components/composite/DeleteConfirmationModal";
import { Container } from "@/shared/components/layout/Container";
import { Section } from "@/shared/components/layout/Section";
import { Grid } from "@/shared/components/layout/Grid";
import { messages } from "@/shared/i18n/messages";
import { PageHeader } from "@/shared/components/composite/PageHeader";
import { CollectionState } from "@/shared/components/composite/CollectionState";
import { Text } from "@/shared/components/ui/Text";

export function CreditCardsPage() {
  const pageMessages = messages.cards.page;
  const deleteMessages = messages.cards.deleteModal;
  const navigate = useNavigate();
  const {
    cards,
    isLoading,
    deleteCard,
    modalOpen,
    setModalOpen,
    selectedCard,
    setSelectedCard,
    deleteModalOpen,
    setDeleteModalOpen,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleAdd,
  } = useCreditCardsPageLogic();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const totalLimit =
    cards?.reduce((sum, c) => sum + (c.credit_limit || 0), 0) || 0;
  const totalUsage = cards?.reduce((sum, c) => sum + (c.usage || 0), 0) || 0;
  const isEmpty = !cards || cards.length === 0;

  return (
    <Section>
      <Container>
        <PageHeader
          title={pageMessages.title}
          subtitle={
            <>
              <Text className="mb-1 text-sm text-[var(--color-text-muted)]">
                {pageMessages.subtitle}
              </Text>
              {cards && cards.length > 0 ? (
                <Text className="text-[13px] text-[var(--color-text-secondary)]">
                  {pageMessages.cardCount(cards.length)}
                  <span className="mx-1 text-[var(--color-text-muted)]">•</span>
                  {pageMessages.totalLimit}: {formatCurrency(totalLimit)}
                  <span className="mx-1 text-[var(--color-text-muted)]">•</span>
                  {pageMessages.used}: {formatCurrency(totalUsage)}
                </Text>
              ) : null}
            </>
          }
          actions={
            <Button
              startIcon={<Plus size={18} />}
              onClick={handleAdd}
              className="w-full rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold shadow-[0_2px_8px_var(--overlay-primary-25)] hover:-translate-y-px sm:w-auto"
            >
              {pageMessages.newCard}
            </Button>
          }
          className="w-full flex-col items-start sm:flex-row sm:items-start"
        />

        <Grid className="xl:grid-cols-2">
          <CollectionState
            isLoading={isLoading}
            isEmpty={isEmpty}
            loadingFallback={
              <div className="col-span-full flex justify-center py-8">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--color-primary)]"
                  aria-label={pageMessages.loading}
                />
              </div>
            }
            emptyFallback={
              <div className="col-span-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card)] py-8 text-center">
                <Text className="text-[var(--color-text-secondary)]">
                  {pageMessages.empty}
                </Text>
              </div>
            }
          >
            {cards?.map((card) => (
              <CreditCardCard
                key={card.id}
                card={card}
                navigate={navigate}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}
          </CollectionState>
        </Grid>

        <CardFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          card={selectedCard || undefined}
        />

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedCard(null);
          }}
          onConfirm={handleConfirmDelete}
          title={deleteMessages.title}
          description={deleteMessages.description}
          itemName={selectedCard?.name}
          loading={deleteCard.isPending}
        />
      </Container>
    </Section>
  );
}
