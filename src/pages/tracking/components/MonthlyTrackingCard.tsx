import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { MonthlyTrackingHeader } from './MonthlyTrackingHeader';
import { MonthlyTrackingProgress } from './MonthlyTrackingProgress';
import { MonthlyTrackingItemList } from './MonthlyTrackingItemList';
import { TrackingPayModal } from './TrackingPayModal';
import { useTogglePaymentStatus } from '@/shared/hooks/api/useTransactions';
import { useToast } from '@/shared/contexts/useToast';

export interface TrackingItem {
  id: string;
  name: string;
  total: number;
  isPaid: boolean;
  itemType: 'card' | 'fixed';
}

export interface MonthlyTrackingData {
  month: Date;
  monthName: string;
  items: TrackingItem[];
  progress: number;
  totalItems: number;
  paidItems: number;
  totalAmount: number;
}

export interface MonthlyTrackingCardProps {
  data: MonthlyTrackingData;
}

export function MonthlyTrackingCard({ data }: MonthlyTrackingCardProps) {
  const cardMessages = messages.tracking.card;
  const [payingItem, setPayingItem] = useState<TrackingItem | null>(null);
  const togglePaid = useTogglePaymentStatus();
  const toast = useToast();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const progress = Math.round(data.progress || 0);
  const isSettled = progress === 100 && data.totalItems > 0;

  const handleConfirmPay = async (_opts: { paymentDate: string; accountId?: string; cardId?: string }) => {
    if (!payingItem) return;
    try {
      await togglePaid.mutateAsync({ id: payingItem.id, currentStatus: false });
      toast.success(`${payingItem.name} marcado como pago.`);
      setPayingItem(null);
    } catch {
      toast.error('Erro ao registrar pagamento.');
    }
  };

  return (
    <Container unstyled>
      <Card
        className={`h-full transition-all duration-200 hover:-translate-y-0.5 ${
          isSettled
            ? 'border-[var(--overlay-success-35)] bg-[var(--color-success-surface-strong)]'
            : 'border-[var(--color-border)] bg-[var(--color-card)]'
        }`}
      >
        <CardContent className="p-[18px]">
          <MonthlyTrackingHeader
            monthName={data.monthName}
            totalAmount={data.totalAmount}
            isSettled={isSettled}
            settledText={cardMessages.settled}
            pendingText={cardMessages.pending}
            formatCurrency={formatCurrency}
          />

          <MonthlyTrackingProgress
            progress={progress}
            isSettled={isSettled}
            progressText={cardMessages.progress(data.paidItems, data.totalItems)}
          />

          <Container unstyled className="flex flex-col gap-1">
            <MonthlyTrackingItemList
              items={data.items}
              totalItems={data.totalItems}
              emptyText={cardMessages.empty}
              pendingTitle={cardMessages.pendingTitle}
              formatCurrency={formatCurrency}
              onPayItem={(item) => setPayingItem(item)}
            />
          </Container>
        </CardContent>
      </Card>

      {payingItem && (
        <TrackingPayModal
          item={payingItem}
          onClose={() => setPayingItem(null)}
          onConfirm={handleConfirmPay}
          isPending={togglePaid.isPending}
        />
      )}
    </Container>
  );
}
