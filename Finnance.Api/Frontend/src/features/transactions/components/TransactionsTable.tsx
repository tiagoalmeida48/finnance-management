import { Fragment } from 'react';
import { Button, Checkbox } from '@/shared/components/ui';
import { TransactionRow } from './TransactionRow';
import { TransactionGroupRow } from './TransactionGroupRow';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
} from '../hooks/useLookups';
import type { Transaction, TransactionListItem } from '../types/transactions.types';

interface TransactionsTableProps {
  items: TransactionListItem[];
  selectedIds: number[];
  page: number;
  totalLines: number;
  hasNextPage: boolean;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onTogglePaid: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
}

const columns = ['', '', 'Data', 'Descrição', 'Tipo', 'Origem', 'Valor', ''];

function visibleIds(items: TransactionListItem[]): number[] {
  return items.flatMap((item) =>
    item.isGroup && item.group
      ? item.group.items.map((t) => t.transaction)
      : item.transaction
        ? [item.transaction.transaction]
        : [],
  );
}

export function TransactionsTable({
  items,
  selectedIds,
  page,
  totalLines,
  hasNextPage,
  expandedGroups,
  onToggleGroup,
  onToggleSelect,
  onToggleSelectAll,
  onTogglePaid,
  onEdit,
  onDuplicate,
  onDelete,
  onPageChange,
}: TransactionsTableProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();

  const allIds = visibleIds(items);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const renderRow = (transaction: Transaction, isChild: boolean) => (
    <TransactionRow
      key={transaction.transaction}
      transaction={transaction}
      isChild={isChild}
      selected={selectedIds.includes(transaction.transaction)}
      accounts={accounts.data ?? []}
      categories={categories.data ?? []}
      cards={cards.data ?? []}
      onToggleSelect={onToggleSelect}
      onTogglePaid={onTogglePaid}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    />
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left font-mono text-[0.65rem] uppercase tracking-wider text-text-muted">
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
            {items.map((item, index) => {
              if (item.isGroup && item.group) {
                const group = item.group;
                const groupKey = `${group.type}-${group.groupId}`;
                const expanded = Boolean(expandedGroups[groupKey]);
                return (
                  <Fragment key={groupKey}>
                    <TransactionGroupRow
                      group={group}
                      expanded={expanded}
                      selectedIds={selectedIds}
                      onToggle={() => onToggleGroup(groupKey)}
                      onToggleSelect={onToggleSelect}
                    />
                    {expanded && group.items.map((child) => renderRow(child, true))}
                  </Fragment>
                );
              }
              if (item.transaction) return renderRow(item.transaction, false);
              return <Fragment key={`empty-${index}`} />;
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">
          Página {page + 1} · {totalLines} lançamentos
        </span>
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
