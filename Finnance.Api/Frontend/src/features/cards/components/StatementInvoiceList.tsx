import { Spinner } from '@/shared/components/ui';
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
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-bold text-text">Faturas</h2>

      {isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.creditCardInvoice}
              invoice={invoice}
              recalculating={recalculatingId === invoice.creditCardInvoice}
              onRecalculate={onRecalculate}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-text-muted">Nenhuma fatura encontrada para o período.</p>
      )}
    </div>
  );
}
