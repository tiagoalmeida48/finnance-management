import { CheckCircle2, ChevronDown, Circle, MinusCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { TransactionTypeId } from '@/config/constants';
import type { TransactionGroup } from '../types/transactions.types';

interface TransactionGroupRowProps {
  group: TransactionGroup;
  expanded: boolean;
  selectedIds: number[];
  onToggle: () => void;
  onToggleSelect: (id: number) => void;
}

export function TransactionGroupRow({
  group,
  expanded,
  selectedIds,
  onToggle,
  onToggleSelect,
}: TransactionGroupRowProps) {
  const childIds = group.items.map((item) => item.transaction);
  const selectedCount = childIds.filter((id) => selectedIds.includes(id)).length;
  const allSelected = childIds.length > 0 && selectedCount === childIds.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const main = group.mainTransaction;
  const amountColor =
    main.transactionType === TransactionTypeId.INCOME
      ? 'text-income'
      : main.transactionType === TransactionTypeId.TRANSFER
        ? 'text-transfer'
        : 'text-expense';

  const handleGroupSelect = () => {
    childIds.forEach((id) => {
      const isSelected = selectedIds.includes(id);
      if (allSelected ? isSelected : !isSelected) onToggleSelect(id);
    });
  };

  return (
    <tr className="border-b border-border border-l-2 border-l-primary bg-primary/5 transition-colors hover:bg-primary/10">
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={handleGroupSelect}
          className={someSelected || allSelected ? 'text-primary' : 'text-text-muted hover:text-text'}
          aria-label="Selecionar grupo"
        >
          {allSelected ? (
            <CheckCircle2 size={18} />
          ) : someSelected ? (
            <MinusCircle size={18} />
          ) : (
            <Circle size={18} />
          )}
        </button>
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="text-text-muted transition-colors hover:text-text"
          aria-label={expanded ? 'Recolher grupo' : 'Expandir grupo'}
        >
          <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </td>
      <td className="px-3 py-3">
        <Badge variant={group.type === 'installment' ? 'primary' : 'transfer'}>
          {group.type === 'installment' ? 'Parcelado' : 'Recorrente'}
        </Badge>
      </td>
      <td className="px-3 py-3" colSpan={2}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-text">{main.description}</span>
          <Badge variant="default">
            {group.totalItemsCount} {group.totalItemsCount === 1 ? 'parcela' : 'parcelas'}
          </Badge>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex min-w-[180px] items-center gap-2">
          <div className="h-[6px] w-full max-w-[160px] overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${group.paidItemsPercent}%` }}
            />
          </div>
          <span className="nums whitespace-nowrap text-[11px] text-text-muted">
            {group.paidItemsCount}/{group.totalItemsCount} ({group.paidItemsPercent}%)
          </span>
        </div>
      </td>
      <td className={`nums px-3 py-3 text-right text-sm font-semibold whitespace-nowrap ${amountColor}`}>
        {formatCurrency(group.totalAmount)}
      </td>
      <td className="px-3 py-3" />
    </tr>
  );
}
