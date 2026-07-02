import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/components/ui';
import { TransactionFormModal, transactionsService } from '@/features/transactions';
import { MonthlyTrackingHeader } from './MonthlyTrackingHeader';
import { MonthlyTrackingProgress } from './MonthlyTrackingProgress';
import { MonthlyTrackingItemList } from './MonthlyTrackingItemList';
import { TrackingPayModal } from './TrackingPayModal';
import { trackingKeys, useTrackingAccounts, useTrackingPayMutations } from '../hooks/useTracking';
import type {
  MonthlyTrackingData,
  PayItemInput,
  TrackingItem,
} from '../types/tracking.types';

interface MonthlyTrackingCardProps {
  data: MonthlyTrackingData;
}

export function MonthlyTrackingCard({ data }: MonthlyTrackingCardProps) {
  const [selected, setSelected] = useState<TrackingItem | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useTrackingAccounts();
  const { togglePaid, pay, payBill } = useTrackingPayMutations();

  const editQuery = useQuery({
    queryKey: ['tracking', 'edit-transaction', editId],
    queryFn: () => transactionsService.getById(editId as number),
    enabled: editId != null,
  });
  const editingTransaction = editId != null ? editQuery.data ?? null : null;

  const progress = Math.round(data.progress || 0);
  const isSettled = progress === 100 && data.totalItems > 0;
  const isPending = togglePaid.isPending || pay.isPending || payBill.isPending;

  const handleConfirm = (input: PayItemInput) => {
    if (!selected) return;

    const onSuccess = () => setSelected(null);

    if (selected.itemType === 'card') {
      if (!input.account) return;
      const paymentDate = new Date().toISOString().slice(0, 10);
      payBill.mutate({ invoice: selected.id, account: input.account, paymentDate }, { onSuccess });
      return;
    }

    if (input.account) {
      pay.mutate({ id: selected.id, account: input.account }, { onSuccess });
      return;
    }

    togglePaid.mutate(selected.id, { onSuccess });
  };

  const handleEdit = () => {
    if (!selected) return;
    setEditId(selected.id);
    setSelected(null);
  };

  const closeEdit = () => {
    setEditId(null);
    void queryClient.invalidateQueries({ queryKey: trackingKeys.all });
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
          <MonthlyTrackingItemList items={data.items} onSelectItem={setSelected} />
        </CardContent>
      </Card>

      {selected ? (
        <TrackingPayModal
          item={selected}
          accounts={accounts}
          isPending={isPending}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onEdit={selected.itemType === 'fixed' ? handleEdit : undefined}
        />
      ) : null}

      <TransactionFormModal
        open={Boolean(editingTransaction)}
        editing={editingTransaction}
        onClose={closeEdit}
      />
    </>
  );
}
