import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import { TransactionFormModal } from '@/features/transactions';
import { getInvoiceStatusMeta } from './invoiceStatus';
import { PayBillModal } from './PayBillModal';
import { InvoiceTransactionList } from './InvoiceTransactionList';
import {
  useCards,
  useDeleteInvoiceTransaction,
  useInvoiceTransactions,
  usePayBill,
} from '../hooks/useCards';
import type { CreditCardInvoice, Transaction } from '../types/cards.types';

interface InvoiceRowProps {
  invoice: CreditCardInvoice;
  recalculating: boolean;
  onRecalculate: (invoiceId: number) => void;
}

export function InvoiceRow({ invoice, recalculating, onRecalculate }: InvoiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const payBill = usePayBill();
  const deleteTransaction = useDeleteInvoiceTransaction();
  const cardsQuery = useCards();
  const defaultAccount = cardsQuery.data?.find((c) => c.creditCard === invoice.card)?.bankAccount;
  const status = getInvoiceStatusMeta(invoice.invoiceStatus);
  const remaining = invoice.totalAmount - invoice.paidAmount;
  const transactionsQuery = useInvoiceTransactions(expanded ? invoice.creditCardInvoice : null);
  const transactions = transactionsQuery.data ?? [];

  const handlePay = (input: { account: number; paymentDate: string }) => {
    payBill.mutate(
      { invoice: invoice.creditCardInvoice, account: input.account, paymentDate: input.paymentDate },
      { onSuccess: () => setPayOpen(false) },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTransaction.mutate(pendingDelete.transaction, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  return (
    <div className="rounded-md border border-border bg-surface-2">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-text">{formatCurrency(invoice.totalAmount)}</p>
            <p className="text-xs text-text-muted">
              {remaining > 0 ? `Falta ${formatCurrency(remaining)}` : 'Quitada'}
            </p>
          </div>
          {remaining > 0 ? (
            <Button size="sm" onClick={() => setPayOpen(true)}>
              Pagar
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            loading={recalculating}
            onClick={() => onRecalculate(invoice.creditCardInvoice)}
          >
            Recalcular
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? 'Ocultar lançamentos' : 'Ver lançamentos'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-border px-4 py-3">
          {transactionsQuery.isLoading ? (
            <div className="py-4">
              <Spinner />
            </div>
          ) : transactions.length > 0 ? (
            <InvoiceTransactionList
              transactions={transactions}
              onEdit={setEditing}
              onDelete={setPendingDelete}
            />
          ) : (
            <p className="py-2 text-sm text-text-muted">Nenhum lançamento nesta fatura.</p>
          )}
        </div>
      ) : null}

      {payOpen ? (
        <PayBillModal
          invoice={invoice}
          isPending={payBill.isPending}
          defaultAccount={defaultAccount}
          onClose={() => setPayOpen(false)}
          onConfirm={handlePay}
        />
      ) : null}

      <TransactionFormModal
        open={editing !== null}
        editing={editing}
        onClose={() => setEditing(null)}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lançamento</DialogTitle>
          </DialogHeader>

          <p className="text-text-muted">
            Tem certeza que deseja excluir{' '}
            <span className="font-semibold text-text">
              {pendingDelete?.description || 'este lançamento'}
            </span>
            ? A fatura será recalculada.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              disabled={deleteTransaction.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteTransaction.isPending}
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
