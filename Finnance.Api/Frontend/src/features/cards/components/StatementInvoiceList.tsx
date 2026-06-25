import { ReceiptText } from 'lucide-react';
import { EmptyState, Spinner } from '@/shared/components/ui';
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
    <div className="rounded-xl border border-border bg-surface-gradient p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-text">Faturas</h2>

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
        <EmptyState
          icon={ReceiptText}
          title="Nenhuma fatura no período"
          description="As faturas aparecem aqui conforme você lança compras no cartão."
        />
      )}
    </div>
  );
}
