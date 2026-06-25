import { useState } from 'react';
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
import { formatCurrency } from '@/shared/utils';
import { useBankAccountsLookup } from '../hooks/useCards';
import type { CreditCardInvoice } from '../types/cards.types';

interface PayBillModalProps {
  invoice: CreditCardInvoice;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (input: { account: number; paymentDate: string }) => void;
}

export function PayBillModal({ invoice, isPending, onClose, onConfirm }: PayBillModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: accounts, isLoading } = useBankAccountsLookup();
  const [paymentDate, setPaymentDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const remaining = invoice.totalAmount - invoice.paidAmount;

  const handleConfirm = () => {
    if (!paymentDate || !accountId) return;
    onConfirm({ account: Number(accountId), paymentDate });
  };

  return (
    <Dialog open onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar fatura {invoice.monthKey}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
          <p className="text-sm text-text-muted">Valor em aberto</p>
          <p className="text-lg font-bold text-text">{formatCurrency(remaining)}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="paybill-date">Data de pagamento</Label>
            <Input
              id="paybill-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="paybill-account">Conta de débito</Label>
            <SelectMenu
              id="paybill-account"
              value={accountId}
              disabled={isLoading}
              onChange={setAccountId}
              placeholder="Selecione a conta"
              options={(accounts ?? []).map((account) => ({
                value: account.bankAccount,
                label: account.name,
              }))}
            />
          </div>

          <p className="text-xs text-text-muted">
            As transações em aberto desta fatura serão marcadas como pagas e debitadas da conta
            escolhida.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={isPending} disabled={!paymentDate || !accountId}>
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
