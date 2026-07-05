import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
import { formatCurrency } from '@/shared/utils';
import { InvoiceStatusId } from '@/config/constants';
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
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const label = MONTHS[Number(month) - 1];
  return label ? `${label}/${year}` : monthKey;
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState('payment_date');
  const [sortAsc, setSortAsc] = useState(false);
  const payBill = usePayBill();
  const deleteTransaction = useDeleteInvoiceTransaction();
  const cardsQuery = useCards();
  const defaultAccount = cardsQuery.data?.find((c) => c.creditCard === invoice.card)?.bankAccount;
  const status = getInvoiceStatusMeta(invoice.invoiceStatus);
  const isSettled = invoice.invoiceStatus === InvoiceStatusId.PAID;
  const transactionsQuery = useInvoiceTransactions(
    expanded ? invoice.creditCardInvoice : null,
    sortField,
    sortAsc,
  );
  const transactions = transactionsQuery.data ?? [];

  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortAsc((value) => !value);
      return;
    }
    setSortField(field);
    setSortAsc(true);
  };

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
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-text-muted transition-colors hover:text-text"
          aria-label={expanded ? 'Ocultar lançamentos' : 'Ver lançamentos'}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="font-semibold text-text">{formatMonthKey(invoice.monthKey)}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="text-xs text-text-muted">
            {invoice.itemsCount} {invoice.itemsCount === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <span className="nums font-semibold whitespace-nowrap text-text">
          {formatCurrency(invoice.totalAmount)}
        </span>
        {isSettled ? (
          <Badge variant="income">Quitada</Badge>
        ) : (
          <Button size="sm" onClick={() => setPayOpen(true)}>
            Pagar
          </Button>
        )}
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
              sortField={sortField}
              sortAsc={sortAsc}
              onSort={toggleSort}
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
