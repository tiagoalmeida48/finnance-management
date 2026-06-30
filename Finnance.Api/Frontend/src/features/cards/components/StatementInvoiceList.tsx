import { CalendarClock, ReceiptText, RotateCw } from 'lucide-react';
import { Button, EmptyState, Spinner } from '@/shared/components/ui';
import { InvoiceRow } from './InvoiceRow';
import type { CreditCardInvoice } from '../types/cards.types';

interface StatementInvoiceListProps {
  invoices: CreditCardInvoice[];
  isLoading: boolean;
  isRecalculating: boolean;
  onRecalculate: (invoiceId: number) => void;
}

export function StatementInvoiceList({
  invoices,
  isLoading,
  isRecalculating,
  onRecalculate,
}: StatementInvoiceListProps) {
  const recalculateAll = () => invoices.forEach((invoice) => onRecalculate(invoice.creditCardInvoice));

  return (
    <div className="rounded-xl border border-border bg-surface-gradient p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
          <CalendarClock size={18} className="text-text-muted" />
          Histórico de Faturas
        </h2>
        {invoices.length > 0 ? (
          <Button variant="outline" size="sm" loading={isRecalculating} onClick={recalculateAll}>
            <RotateCw size={14} />
            Recalcular
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.creditCardInvoice} invoice={invoice} />
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
