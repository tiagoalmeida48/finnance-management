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
import { useAccountsLookup } from '../hooks/useLookups';

interface TransactionsBatchBarProps {
  selectedCount: number;
  disablePayment?: boolean;
  onPay: (account: number, paymentDate: string) => void;
  onUnpay: () => void;
  onDelete: () => void;
  onChangeDay: (day: number) => void;
  onClear: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionsBatchBar({
  selectedCount,
  disablePayment = false,
  onPay,
  onUnpay,
  onDelete,
  onChangeDay,
  onClear,
}: TransactionsBatchBarProps) {
  const accounts = useAccountsLookup();
  const [payOpen, setPayOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [account, setAccount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(today());
  const [day, setDay] = useState(1);

  const accountOptions = (accounts.data ?? []).map((a) => ({ value: a.bankAccount, label: a.name }));

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-3">
      <span className="text-sm font-semibold text-text">{selectedCount} selecionada(s)</span>
      {disablePayment ? (
        <span className="text-xs text-text-muted">
          Lançamentos de cartão são pagos pela fatura.
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2 ml-auto">
        <Button size="sm" disabled={disablePayment} onClick={() => setPayOpen(true)}>
          Pagar
        </Button>
        <Button size="sm" variant="secondary" disabled={disablePayment} onClick={onUnpay}>
          Despagar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDayOpen(true)}>
          Mudar dia
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          Excluir
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear}>
          Cancelar
        </Button>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar lançamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-account">Conta de pagamento</Label>
              <SelectMenu
                id="batch-account"
                placeholder="Selecione"
                options={accountOptions}
                value={account || ''}
                onChange={(value) => setAccount(Number(value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="batch-date">Data do pagamento</Label>
              <Input
                id="batch-date"
                type="date"
                className="w-full"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!account || !paymentDate}
              onClick={() => {
                onPay(account, paymentDate);
                setPayOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dayOpen} onOpenChange={setDayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar dia de vencimento</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="batch-day">Novo dia (1 a 31)</Label>
            <Input
              id="batch-day"
              type="number"
              min="1"
              max="31"
              className="w-full"
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDayOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={day < 1 || day > 31}
              onClick={() => {
                onChangeDay(day);
                setDayOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
