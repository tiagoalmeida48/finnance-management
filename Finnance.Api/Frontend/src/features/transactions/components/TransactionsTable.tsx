import { Button, Checkbox } from '@/shared/components/ui';
import { TransactionRow } from './TransactionRow';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
} from '../hooks/useLookups';
import type { Transaction } from '../types/transactions.types';

interface TransactionsTableProps {
  transactions: Transaction[];
  selectedIds: number[];
  page: number;
  hasNextPage: boolean;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onTogglePaid: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
}

const columns = ['', '', 'Data', 'Descrição', 'Tipo', 'Origem', 'Valor', ''];

export function TransactionsTable({
  transactions,
  selectedIds,
  page,
  hasNextPage,
  onToggleSelect,
  onToggleSelectAll,
  onTogglePaid,
  onDuplicate,
  onDelete,
  onPageChange,
}: TransactionsTableProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
              <th className="px-3 py-3">
                <Checkbox
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label="Selecionar todos"
                />
              </th>
              {columns.slice(1).map((label, index) => (
                <th key={index} className={`px-3 py-3 ${label === 'Valor' ? 'text-right' : ''}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.transaction}
                transaction={transaction}
                selected={selectedIds.includes(transaction.transaction)}
                accounts={accounts.data ?? []}
                categories={categories.data ?? []}
                cards={cards.data ?? []}
                onToggleSelect={onToggleSelect}
                onTogglePaid={onTogglePaid}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">Página {page + 1}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
