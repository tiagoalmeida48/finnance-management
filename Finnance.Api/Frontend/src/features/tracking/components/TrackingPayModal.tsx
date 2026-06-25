import { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  SelectMenu,
} from '@/shared/components/ui';
import { formatCurrency } from '../constants';
import type { PayItemInput, TrackingItem } from '../types/tracking.types';
import type { TrackingAccount } from '../services/trackingService';

interface TrackingPayModalProps {
  item: TrackingItem;
  accounts: TrackingAccount[];
  isPending: boolean;
  onClose: () => void;
  onConfirm: (input: PayItemInput) => void;
}

export function TrackingPayModal({
  item,
  accounts,
  isPending,
  onClose,
  onConfirm,
}: TrackingPayModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [paymentDate, setPaymentDate] = useState(today);
  const [accountId, setAccountId] = useState('');

  const handleConfirm = () => {
    if (!paymentDate) return;
    onConfirm({ paymentDate, account: accountId ? Number(accountId) : null });
  };

  return (
    <Dialog open onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
          {item.itemType === 'card' ? (
            <CreditCard size={16} className="shrink-0 text-primary" />
          ) : (
            <Wallet size={16} className="shrink-0 text-primary" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{item.name}</p>
            <p className="text-xs text-text-muted">{formatCurrency(item.total)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="tracking-payment-date">Data de pagamento</Label>
            <Input
              id="tracking-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tracking-account">Conta de débito</Label>
            <SelectMenu
              id="tracking-account"
              value={accountId}
              onChange={setAccountId}
              options={[
                { value: '', label: 'Sem conta (apenas marcar como pago)' },
                ...accounts.map((account) => ({
                  value: account.bankAccount,
                  label: account.name,
                })),
              ]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={isPending} disabled={!paymentDate}>
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
