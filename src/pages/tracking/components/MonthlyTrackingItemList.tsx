import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { CreditCard, CheckCircle2, Clock3, Wallet } from 'lucide-react';
import { colors } from '@/shared/theme';
import type { TrackingItem } from './MonthlyTrackingCard';

interface MonthlyTrackingItemListProps {
  items: TrackingItem[];
  totalItems: number;
  emptyText: string;
  pendingTitle: string;
  formatCurrency: (value: number) => string;
  onPayItem?: (item: TrackingItem) => void;
}

export function MonthlyTrackingItemList({
  items,
  totalItems,
  emptyText,
  pendingTitle,
  formatCurrency,
  onPayItem,
}: MonthlyTrackingItemListProps) {
  if (totalItems === 0) {
    return (
      <Text className="rounded-[10px] border border-[var(--color-border)] border-dashed py-2 text-center text-sm text-[var(--color-text-muted)]">
        {emptyText}
      </Text>
    );
  }

  return (
    <>
      {items.map((item, iidx: number) => (
        <Container unstyled key={iidx}>
<<<<<<< HEAD
          <Container
            unstyled
            className={`flex items-center justify-between gap-1.5 rounded-[8px] px-1 py-0.5 transition-colors ${!item.isPaid && onPayItem ? 'cursor-pointer hover:bg-[var(--overlay-white-03)]' : ''}`}
            onClick={!item.isPaid && onPayItem ? () => onPayItem(item) : undefined}
          >
=======
          <Container unstyled className="flex items-center justify-between gap-1.5">
>>>>>>> finnance-management/main
            <Container unstyled className="flex min-w-0 flex-1 items-center gap-1">
              <Container
                unstyled
                className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {item.itemType === 'card' ? (
                  <CreditCard size={11} color={colors.textMuted} />
                ) : (
                  <Wallet size={11} color={colors.textMuted} />
                )}
              </Container>
              <Text
                className={`truncate text-sm font-medium ${
                  item.isPaid
                    ? 'text-[var(--color-text-secondary)] line-through'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {item.name}
              </Text>
            </Container>

            <Container unstyled className="flex shrink-0 items-center gap-1">
              <Text className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                {formatCurrency(item.total)}
              </Text>
              {item.isPaid ? (
                <CheckCircle2 size={15} color={colors.green} />
              ) : (
                <Text as="span" title={pendingTitle}>
                  <Clock3 size={15} color={colors.yellow} className="opacity-80" />
                </Text>
              )}
            </Container>
          </Container>

          {iidx < items.length - 1 && (
            <hr className="mt-1 border-0 border-t border-[var(--color-border)]" />
          )}
        </Container>
      ))}
    </>
  );
}
