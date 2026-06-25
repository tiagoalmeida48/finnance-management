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
  SelectMenu,
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
  closingDay: z
    .number()
    .int()
    .min(1, 'O dia de fechamento deve estar entre 1 e 31.')
    .max(31, 'O dia de fechamento deve estar entre 1 e 31.'),
  dueDay: z
    .number()
    .int()
    .min(1, 'O dia de vencimento deve estar entre 1 e 31.')
    .max(31, 'O dia de vencimento deve estar entre 1 e 31.'),
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
  closingDay: 1,
  dueDay: 10,
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
        closingDay: 1,
        dueDay: 10,
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="card-account">Conta vinculada</Label>
            <Controller
              control={control}
              name="bankAccount"
              render={({ field }) => (
                <SelectMenu
                  id="card-account"
                  value={field.value || ''}
                  disabled={loadingAccounts}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Selecione uma conta"
                  options={(accounts ?? []).map((account) => ({
                    value: account.bankAccount,
                    label: account.name,
                  }))}
                />
              )}
            />
            {errors.bankAccount && (
              <p className="text-expense text-xs mt-1">{errors.bankAccount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="card-name">Nome</Label>
            <Input id="card-name" className="w-full" maxLength={100} {...register('name')} />
            {errors.name && <p className="text-expense text-xs mt-1">{errors.name.message}</p>}
          </div>

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
              <p className="text-expense text-xs mt-1">{errors.creditLimit.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="card-color">Cor</Label>
            <input
              id="card-color"
              type="color"
              className="h-9 w-full rounded-lg border border-border bg-bg/60 p-1"
              {...register('color')}
            />
          </div>

          {!card ? (
            <>
              <div>
                <Label htmlFor="card-closing-day">Dia de fechamento</Label>
                <Controller
                  control={control}
                  name="closingDay"
                  render={({ field }) => (
                    <Input
                      id="card-closing-day"
                      type="number"
                      min={1}
                      max={31}
                      className="w-full"
                      value={field.value || ''}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  )}
                />
                {errors.closingDay && (
                  <p className="text-expense text-xs mt-1">{errors.closingDay.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="card-due-day">Dia de vencimento</Label>
                <Controller
                  control={control}
                  name="dueDay"
                  render={({ field }) => (
                    <Input
                      id="card-due-day"
                      type="number"
                      min={1}
                      max={31}
                      className="w-full"
                      value={field.value || ''}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  )}
                />
                {errors.dueDay && (
                  <p className="text-expense text-xs mt-1">{errors.dueDay.message}</p>
                )}
              </div>

              <p className="text-xs text-text-muted sm:col-span-2">
                A primeira vigência de fatura será criada automaticamente com estes dias, a partir de
                hoje.
              </p>
            </>
          ) : null}

          <div className="sm:col-span-2">
            <Label htmlFor="card-notes">Observações</Label>
            <Textarea id="card-notes" rows={2} maxLength={500} {...register('notes')} />
          </div>

          {card ? (
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-text sm:col-span-2">
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  Cartão ativo
                </label>
              )}
            />
          ) : null}

          <DialogFooter className="sm:col-span-2">
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
