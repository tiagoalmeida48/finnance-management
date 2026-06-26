import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/shared/utils';
import type { Transaction } from '../types/cards.types';

interface InvoiceTransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function InvoiceTransactionList({
  transactions,
  onEdit,
  onDelete,
}: InvoiceTransactionListProps) {
  return (
    <ul className="space-y-2">
      {transactions.map((item) => {
        const date = item.purchaseDate ?? item.paymentDate;
        return (
          <li key={item.transaction} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className={`truncate text-text ${item.paid ? '' : 'opacity-70'}`}>
                {item.description || 'Lançamento'}
              </p>
              <p className="text-xs text-text-muted">
                {date ? formatDate(date) : '—'}
                {item.paid ? '' : ' · Pendente'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="nums font-medium text-text">{formatCurrency(item.amount ?? 0)}</span>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="text-text-muted transition-colors hover:text-text"
                aria-label="Editar lançamento"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="text-expense transition-colors hover:brightness-125"
                aria-label="Excluir lançamento"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
