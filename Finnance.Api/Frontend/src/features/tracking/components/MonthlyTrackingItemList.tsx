import { CheckCircle2, Clock3, CreditCard, Wallet } from 'lucide-react';
import { formatCurrency } from '../constants';
import type { TrackingItem } from '../types/tracking.types';

interface MonthlyTrackingItemListProps {
  items: TrackingItem[];
  onPayItem: (item: TrackingItem) => void;
}

export function MonthlyTrackingItemList({ items, onPayItem }: MonthlyTrackingItemListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-2 text-center text-sm text-text-muted">
        Nenhum lançamento neste mês.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const clickable = !item.isPaid;
        return (
          <div
            key={`${item.itemType}-${item.id}`}
            onClick={clickable ? () => onPayItem(item) : undefined}
            className={`flex items-center justify-between gap-2 rounded-md px-1 py-1 transition-colors ${
              clickable ? 'cursor-pointer hover:bg-surface-2' : ''
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md border border-border bg-surface">
                {item.itemType === 'card' ? (
                  <CreditCard size={11} className="text-text-muted" />
                ) : (
                  <Wallet size={11} className="text-text-muted" />
                )}
              </div>
              <span
                className={`truncate text-sm font-medium ${
                  item.isPaid ? 'text-text-muted line-through' : 'text-text'
                }`}
              >
                {item.name}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span className="text-[11px] font-bold text-text-muted">
                {formatCurrency(item.total)}
              </span>
              {item.isPaid ? (
                <CheckCircle2 size={15} className="text-income" />
              ) : (
                <Clock3 size={15} className="text-primary opacity-80" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
