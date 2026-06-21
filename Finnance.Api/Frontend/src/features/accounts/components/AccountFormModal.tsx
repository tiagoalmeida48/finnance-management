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
} from '@/shared/components/ui';
import { CurrencyInput } from './CurrencyInput';
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from '../constants';
import type { AccountType, BankAccount } from '../types/accounts.types';

const accountSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conta.'),
  accountType: z.number().int().positive('Selecione o tipo de conta.'),
  initialBalance: z.number(),
  color: z.string().min(1),
  icon: z.string().min(1),
  notes: z.string(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccountFormValues) => void;
  accountTypes: AccountType[];
  account?: BankAccount | null;
  submitting?: boolean;
}

const emptyValues: AccountFormValues = {
  name: '',
  accountType: 0,
  initialBalance: 0,
  color: ACCOUNT_COLORS[0],
  icon: ACCOUNT_ICONS[0],
  notes: '',
};

export function AccountFormModal({
  open,
  onOpenChange,
  onSubmit,
  accountTypes,
  account,
  submitting,
}: AccountFormModalProps) {
  const isEditing = Boolean(account);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    if (account) {
      reset({
        name: account.name,
        accountType: account.accountType,
        initialBalance: account.initialBalance,
        color: account.color || ACCOUNT_COLORS[0],
        icon: account.icon || ACCOUNT_ICONS[0],
        notes: account.notes ?? '',
      });
    } else {
      reset(emptyValues);
    }
  }, [open, account, reset]);

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="account-name">Nome</Label>
            <Input id="account-name" className="w-full" placeholder="Ex.: Conta corrente" {...register('name')} />
            {errors.name && <p className="text-expense text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="account-type">Tipo de conta</Label>
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <select
                  id="account-type"
                  value={field.value || ''}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  className="input-base w-full"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {accountTypes.map((type) => (
                    <option key={type.accountType} value={type.accountType}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.accountType && (
              <p className="text-expense text-sm mt-1">{errors.accountType.message}</p>
            )}
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="account-balance">Saldo inicial</Label>
              <Controller
                control={control}
                name="initialBalance"
                render={({ field }) => (
                  <CurrencyInput
                    id="account-balance"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          )}

          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Selecionar cor ${color}`}
                  onClick={() => setValue('color', color, { shouldDirty: true })}
                  className={
                    'h-8 w-8 rounded-full border-2 transition-transform ' +
                    (selectedColor === color
                      ? 'border-text scale-110'
                      : 'border-transparent hover:scale-105')
                  }
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={`Selecionar ícone ${icon}`}
                  onClick={() => setValue('icon', icon, { shouldDirty: true })}
                  className={
                    'h-9 w-9 rounded-md border text-lg flex items-center justify-center transition-colors ' +
                    (selectedIcon === icon
                      ? 'border-primary bg-surface-2'
                      : 'border-border hover:bg-surface-2')
                  }
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="account-notes">Observações</Label>
            <textarea
              id="account-notes"
              rows={3}
              className="input-base w-full resize-none"
              placeholder="Opcional"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Salvar' : 'Criar conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
