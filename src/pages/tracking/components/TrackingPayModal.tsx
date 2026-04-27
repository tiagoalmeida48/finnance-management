import { useState } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { Input } from '@/shared/components/ui/input';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import type { TrackingItem } from './MonthlyTrackingCard';

interface TrackingPayModalProps {
  item: TrackingItem;
  onClose: () => void;
  onConfirm: (opts: { paymentDate: string; accountId?: string; cardId?: string }) => void;
  isPending: boolean;
}

export function TrackingPayModal({ item, onClose, onConfirm, isPending }: TrackingPayModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [paymentDate, setPaymentDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const { data: accounts = [] } = useAccounts();

  const handleConfirm = () => {
    if (!paymentDate) return;
    onConfirm({ paymentDate, accountId: accountId || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Container
        unstyled
        className="w-full max-w-sm rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
      >
        <Container unstyled className="flex items-center justify-between mb-4">
          <Text className="text-base font-bold">Registrar Pagamento</Text>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <X size={18} />
          </button>
        </Container>

        <Container
          unstyled
          className="mb-4 flex items-center gap-2 rounded-[10px] border border-[var(--color-primary)]/30 bg-[var(--overlay-primary-08)] px-3 py-2"
        >
          {item.itemType === 'card' ? (
            <CreditCard size={16} className="text-[var(--color-primary)] shrink-0" />
          ) : (
            <Wallet size={16} className="text-[var(--color-primary)] shrink-0" />
          )}
          <Container unstyled>
            <Text className="text-sm font-bold text-[var(--color-text-primary)]">{item.name}</Text>
            <Text className="text-xs text-[var(--color-text-secondary)]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
            </Text>
          </Container>
        </Container>

        <Container unstyled className="flex flex-col gap-3">
          <Container unstyled className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Data de pagamento</label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </Container>

          <Container unstyled className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Conta de débito</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--overlay-white-03)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="" style={{ background: '#14141e', color: '#f0f0f5' }}>Selecione uma conta...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} style={{ background: '#14141e', color: '#f0f0f5' }}>
                  {acc.name}
                </option>
              ))}
            </select>
          </Container>

          <Container unstyled className="flex gap-2 justify-end pt-1">
            <Button variant="outlined" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button variant="contained" onClick={handleConfirm} disabled={!paymentDate || isPending}>
              {isPending ? 'Salvando...' : 'Confirmar pagamento'}
            </Button>
          </Container>
        </Container>
      </Container>
    </div>
  );
}
