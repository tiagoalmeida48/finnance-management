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
  const { togglePaid, pay, payBill } = useTrackingPayMutations();

  const progress = Math.round(data.progress || 0);
  const isSettled = progress === 100 && data.totalItems > 0;
  const isPending = togglePaid.isPending || pay.isPending || payBill.isPending;

  const handleConfirm = (input: PayItemInput) => {
    if (!payingItem) return;

    const onSuccess = () => setPayingItem(null);

    if (payingItem.itemType === 'card') {
      if (!input.account) return;
      const paymentDate = new Date().toISOString().slice(0, 10);
      payBill.mutate(
        { invoice: payingItem.id, account: input.account, paymentDate },
        { onSuccess },
      );
      return;
    }

    if (input.account) {
      pay.mutate({ id: payingItem.id, account: input.account }, { onSuccess });
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
        <CardContent className="p-3">
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
