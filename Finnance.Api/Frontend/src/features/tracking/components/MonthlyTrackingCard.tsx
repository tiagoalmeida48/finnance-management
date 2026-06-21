import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui';
import { MonthlyTrackingHeader } from './MonthlyTrackingHeader';
import { MonthlyTrackingProgress } from './MonthlyTrackingProgress';
import { MonthlyTrackingItemList } from './MonthlyTrackingItemList';
import { TrackingPayModal } from './TrackingPayModal';
import { useTrackingAccounts, useTrackingPayMutations } from '../hooks/useTracking';
import type {
  MonthlyTrackingData,
  PayItemInput,
  TrackingItem,
} from '../types/tracking.types';

interface MonthlyTrackingCardProps {
  data: MonthlyTrackingData;
}

export function MonthlyTrackingCard({ data }: MonthlyTrackingCardProps) {
  const [payingItem, setPayingItem] = useState<TrackingItem | null>(null);
  const { data: accounts = [] } = useTrackingAccounts();
  const { togglePaid, batchPay } = useTrackingPayMutations();

  const progress = Math.round(data.progress || 0);
  const isSettled = progress === 100 && data.totalItems > 0;
  const isPending = togglePaid.isPending || batchPay.isPending;

  const handleConfirm = (input: PayItemInput) => {
    if (!payingItem) return;

    const onSuccess = () => setPayingItem(null);

    if (input.account) {
      batchPay.mutate(
        { ids: [payingItem.id], account: input.account, paymentDate: input.paymentDate },
        { onSuccess },
      );
      return;
    }

    togglePaid.mutate(payingItem.id, { onSuccess });
  };

  return (
    <>
      <Card
        className={
          isSettled ? 'h-full border-income/35 bg-income/5' : 'h-full border-border bg-surface'
        }
      >
        <CardContent className="p-4">
          <MonthlyTrackingHeader
            monthName={data.monthName}
            totalAmount={data.totalAmount}
            isSettled={isSettled}
          />
          <MonthlyTrackingProgress
            progress={progress}
            isSettled={isSettled}
            paidItems={data.paidItems}
            totalItems={data.totalItems}
          />
          <MonthlyTrackingItemList items={data.items} onPayItem={setPayingItem} />
        </CardContent>
      </Card>

      {payingItem ? (
        <TrackingPayModal
          item={payingItem}
          accounts={accounts}
          isPending={isPending}
          onClose={() => setPayingItem(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}
