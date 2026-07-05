import { Pencil, Trash2 } from 'lucide-react';
import { SortableTh } from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils';
import type { Transaction } from '../types/cards.types';

interface InvoiceTransactionListProps {
  transactions: Transaction[];
  sortField: string;
  sortAsc: boolean;
  onSort: (field: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function InvoiceTransactionList({
  transactions,
  sortField,
  sortAsc,
  onSort,
  onEdit,
  onDelete,
}: InvoiceTransactionListProps) {
  const direction = sortAsc ? 'asc' : 'desc';

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
          <SortableTh label="Descrição" sortKey="description" activeKey={sortField} direction={direction} onSort={onSort} />
          <SortableTh label="Data" sortKey="payment_date" activeKey={sortField} direction={direction} onSort={onSort} />
          <SortableTh label="Valor" sortKey="amount" activeKey={sortField} direction={direction} onSort={onSort} align="right" />
          <th className="px-3 py-2" />
        </tr>
      </thead>
      <tbody>
        {transactions.map((item) => {
          const date = item.purchaseDate ?? item.paymentDate;
          return (
            <tr key={item.transaction} className="border-t border-border/60">
              <td className="px-3 py-2">
                <p className={`truncate text-text ${item.paid ? '' : 'opacity-70'}`}>
                  {item.description || 'Lançamento'}
                </p>
                {!item.paid ? <span className="text-xs text-text-muted">Pendente</span> : null}
              </td>
              <td className="nums px-3 py-2 text-xs text-text-muted">
                {date ? formatDate(date) : '—'}
              </td>
              <td className="nums px-3 py-2 text-right font-medium text-text">
                {formatCurrency(item.amount ?? 0)}
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-3">
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
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
