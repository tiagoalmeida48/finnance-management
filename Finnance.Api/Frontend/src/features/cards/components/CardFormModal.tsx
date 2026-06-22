import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Checkbox,
  Textarea,
} from '@/shared/components/ui';
import { useBankAccountsLookup } from '../hooks/useCards';
import type { CreditCard } from '../types/cards.types';

const cardSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do cartão.'),
  bankAccount: z.number().positive('Selecione a conta vinculada.'),
  creditLimit: z.number().positive('O limite deve ser maior que zero.'),
  color: z.string(),
  notes: z.string(),
  active: z.boolean(),
});

export type CardFormValues = z.infer<typeof cardSchema>;

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
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;
    if (card) {
      reset({
        bankAccount: card.bankAccount,
        name: card.name,
        color: card.color || '#d4a574',
        creditLimit: card.creditLimit,
        notes: card.notes ?? '',
        active: card.active,
      });
    } else {
      reset(emptyForm);
    }
  }, [open, card, reset]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Editar cartão' : 'Novo cartão'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="card-account">Conta vinculada</Label>
            <Controller
              control={control}
              name="bankAccount"
              render={({ field }) => (
                <Select
                  id="card-account"
                  value={field.value || 0}
                  disabled={loadingAccounts}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                >
                  <option value={0}>Selecione uma conta</option>
                  {accounts?.map((account) => (
                    <option key={account.bankAccount} value={account.bankAccount}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.bankAccount && (
              <p className="text-expense text-sm mt-1">{errors.bankAccount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="card-name">Nome</Label>
            <Input id="card-name" className="w-full" maxLength={100} {...register('name')} />
            {errors.name && <p className="text-expense text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-limit">Limite (R$)</Label>
              <Controller
                control={control}
                name="creditLimit"
                render={({ field }) => (
                  <Input
                    id="card-limit"
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full"
                    value={field.value || ''}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                )}
              />
              {errors.creditLimit && (
                <p className="text-expense text-sm mt-1">{errors.creditLimit.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="card-color">Cor</Label>
              <input
                id="card-color"
                type="color"
                className="h-10 w-full rounded-md border border-border bg-surface"
                {...register('color')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="card-notes">Observações</Label>
            <Textarea id="card-notes" className="min-h-20" maxLength={500} {...register('notes')} />
          </div>

          {card ? (
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-text">
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  Cartão ativo
                </label>
              )}
            />
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {card ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
