import { Badge, Button } from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import { getInvoiceStatusMeta } from './invoiceStatus';
import type { CreditCardInvoice } from '../types/cards.types';

interface InvoiceRowProps {
  invoice: CreditCardInvoice;
  recalculating: boolean;
  onRecalculate: (invoiceId: number) => void;
}

export function InvoiceRow({ invoice, recalculating, onRecalculate }: InvoiceRowProps) {
  const status = getInvoiceStatusMeta(invoice.invoiceStatus);
  const remaining = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text">{invoice.monthKey}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="text-xs text-text-muted">
          Vencimento {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
          {invoice.closingDate ? ` · Fechamento ${formatDate(invoice.closingDate)}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-text">{formatCurrency(invoice.totalAmount)}</p>
          <p className="text-xs text-text-muted">
            {remaining > 0 ? `Falta ${formatCurrency(remaining)}` : 'Quitada'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={recalculating}
          onClick={() => onRecalculate(invoice.creditCardInvoice)}
        >
          Recalcular
        </Button>
      </div>
    </div>
  );
}
