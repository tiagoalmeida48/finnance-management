import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/components/ui';
import { useBankAccountsLookup } from '../hooks/useCards';
import type { CreditCard } from '../types/cards.types';

export interface CardFormValues {
  bankAccount: number;
  name: string;
  color: string;
  creditLimit: number;
  notes: string;
  active: boolean;
}

interface CardFormModalProps {
  open: boolean;
  card: CreditCard | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CardFormValues) => void;
}

const emptyForm: CardFormValues = {
  bankAccount: 0,
  name: '',
  color: '#d4a574',
  creditLimit: 0,
  notes: '',
  active: true,
};

export function CardFormModal({ open, card, saving, onClose, onSubmit }: CardFormModalProps) {
  const { data: accounts, isLoading: loadingAccounts } = useBankAccountsLookup();
  const [form, setForm] = useState<CardFormValues>(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (card) {
      setForm({
        bankAccount: card.bankAccount,
        name: card.name,
        color: card.color || '#d4a574',
        creditLimit: card.creditLimit,
        notes: card.notes ?? '',
        active: card.active,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [open, card]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Informe o nome do cartão.');
      return;
    }
    if (!form.bankAccount) {
      setError('Selecione a conta vinculada.');
      return;
    }
    if (form.creditLimit <= 0) {
      setError('O limite deve ser maior que zero.');
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Editar cartão' : 'Novo cartão'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="card-account">Conta vinculada</Label>
            <select
              id="card-account"
              className="input-base w-full"
              value={form.bankAccount}
              disabled={loadingAccounts}
              onChange={(e) => setForm((prev) => ({ ...prev, bankAccount: Number(e.target.value) }))}
            >
              <option value={0}>Selecione uma conta</option>
              {accounts?.map((account) => (
                <option key={account.bankAccount} value={account.bankAccount}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="card-name">Nome</Label>
            <Input
              id="card-name"
              className="w-full"
              value={form.name}
              maxLength={100}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-limit">Limite (R$)</Label>
              <Input
                id="card-limit"
                type="number"
                min={0}
                step="0.01"
                className="w-full"
                value={form.creditLimit || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, creditLimit: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label htmlFor="card-color">Cor</Label>
              <input
                id="card-color"
                type="color"
                className="h-10 w-full rounded-md border border-border bg-surface"
                value={form.color}
                onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="card-notes">Observações</Label>
            <textarea
              id="card-notes"
              className="input-base min-h-20 w-full resize-none"
              value={form.notes}
              maxLength={500}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {card ? (
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              Cartão ativo
            </label>
          ) : null}

          {error ? <p className="text-sm text-expense">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {card ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
