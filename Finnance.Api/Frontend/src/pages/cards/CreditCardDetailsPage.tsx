import { useState } from 'react';
import { Spinner } from '@/shared/components/ui';
import {
  CardCyclesModal,
  CardDetailHeader,
  StatementInvoiceList,
  useCardDetailLogic,
  useRecalculateInvoice,
} from '@/features/cards';

export function CreditCardDetailsPage() {
  const {
    card,
    stats,
    openCycle,
    invoices,
    isLoading,
    invoicesLoading,
    isAllTime,
    setIsAllTime,
    year,
    prevYear,
    nextYear,
    goBack,
  } = useCardDetailLogic();

  const [cyclesOpen, setCyclesOpen] = useState(false);
  const recalculate = useRecalculateInvoice();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!card) {
    return <p className="text-text-muted">Cartão não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <CardDetailHeader
        card={card}
        stats={stats}
        openCycle={openCycle}
        isAllTime={isAllTime}
        year={year}
        onSetAllTime={setIsAllTime}
        onPrevYear={prevYear}
        onNextYear={nextYear}
        onBack={goBack}
        onOpenCycles={() => setCyclesOpen(true)}
      />

      <StatementInvoiceList
        invoices={invoices}
        isLoading={invoicesLoading}
        recalculatingId={recalculate.isPending ? (recalculate.variables ?? null) : null}
        onRecalculate={(id) => recalculate.mutate(id)}
      />

      <CardCyclesModal
        card={card.creditCard}
        cardName={card.name}
        fallbackClosingDay={openCycle?.closingDay ?? 0}
        fallbackDueDay={openCycle?.dueDay ?? 0}
        open={cyclesOpen}
        onClose={() => setCyclesOpen(false)}
      />
    </div>
  );
}
