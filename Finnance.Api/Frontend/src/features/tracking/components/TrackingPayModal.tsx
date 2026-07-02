import { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  onEdit?: () => void;
}

export function TrackingPayModal({
  item,
  accounts,
  isPending,
  onClose,
  onConfirm,
  onEdit,
}: TrackingPayModalProps) {
  const [accountId, setAccountId] = useState(item.account ? String(item.account) : '');

  const handleConfirm = () => {
    if (!accountId) return;
    onConfirm({ account: Number(accountId) });
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

        {item.isPaid ? (
          <p className="text-sm text-text-muted">Lançamento já pago.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="tracking-account">Conta de débito</Label>
              <SelectMenu
                id="tracking-account"
                value={accountId}
                onChange={setAccountId}
                placeholder="Selecione a conta"
                options={accounts.map((account) => ({
                  value: account.bankAccount,
                  label: account.name,
                }))}
              />
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {onEdit ? (
            <Button variant="outline" onClick={onEdit} disabled={isPending}>
              Editar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              {item.isPaid ? 'Fechar' : 'Cancelar'}
            </Button>
            {!item.isPaid ? (
              <Button onClick={handleConfirm} loading={isPending} disabled={!accountId}>
                Confirmar pagamento
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
