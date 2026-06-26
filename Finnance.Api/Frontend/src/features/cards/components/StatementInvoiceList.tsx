import { useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { Button, EmptyState, Spinner } from '@/shared/components/ui';
import { InvoiceRow } from './InvoiceRow';
import type { CreditCardInvoice } from '../types/cards.types';

interface StatementInvoiceListProps {
  invoices: CreditCardInvoice[];
  isLoading: boolean;
  recalculatingId: number | null;
  onRecalculate: (invoiceId: number) => void;
}

export function StatementInvoiceList({
  invoices,
  isLoading,
  recalculatingId,
  onRecalculate,
}: StatementInvoiceListProps) {
  const [showAll, setShowAll] = useState(false);

  const representative = useMemo(
    () => invoices.find((item) => item.totalAmount - item.paidAmount > 0) ?? invoices[0] ?? null,
    [invoices],
  );
  const visibleInvoices = showAll ? invoices : representative ? [representative] : [];

  return (
    <div className="rounded-xl border border-border bg-surface-gradient p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-text">Faturas</h2>

      {isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-3">
          {visibleInvoices.map((invoice) => (
            <InvoiceRow
              key={invoice.creditCardInvoice}
              invoice={invoice}
              recalculating={recalculatingId === invoice.creditCardInvoice}
              onRecalculate={onRecalculate}
            />
          ))}
          {invoices.length > 1 ? (
            <Button variant="ghost" className="w-full" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Mostrar só a fatura atual' : `Ver todas as ${invoices.length} faturas`}
            </Button>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={ReceiptText}
          title="Nenhuma fatura no período"
          description="As faturas aparecem aqui conforme você lança compras no cartão."
        />
      )}
    </div>
  );
}
