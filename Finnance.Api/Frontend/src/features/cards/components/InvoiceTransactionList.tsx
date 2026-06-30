import { Pencil, Trash2 } from 'lucide-react';
import { SortableTh } from '@/shared/components/ui';
import { useSortableData, type SortAccessors } from '@/shared/hooks';
import { formatCurrency, formatDate } from '@/shared/utils';
import type { Transaction } from '../types/cards.types';

interface InvoiceTransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const accessors: SortAccessors<Transaction> = {
  description: (t) => t.description,
  date: (t) => t.purchaseDate ?? t.paymentDate,
  amount: (t) => t.amount ?? 0,
  paid: (t) => t.paid,
};

export function InvoiceTransactionList({
  transactions,
  onEdit,
  onDelete,
}: InvoiceTransactionListProps) {
  const { sorted, sortKey, direction, toggleSort } = useSortableData(transactions, accessors, 'date');

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="font-mono text-[0.6rem] uppercase tracking-wider text-text-muted">
          <SortableTh label="Descrição" sortKey="description" activeKey={sortKey} direction={direction} onSort={toggleSort} />
          <SortableTh label="Data" sortKey="date" activeKey={sortKey} direction={direction} onSort={toggleSort} />
          <SortableTh label="Valor" sortKey="amount" activeKey={sortKey} direction={direction} onSort={toggleSort} align="right" />
          <th className="px-3 py-2" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((item) => {
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
