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
  EntityIcon,
  Input,
  Label,
  SelectMenu,
  Textarea,
} from '@/shared/components/ui';
import { CurrencyInput } from './CurrencyInput';
import { ACCOUNT_COLORS, ACCOUNT_ICONS, DEFAULT_ACCOUNT_ICON } from '../constants';
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
  icon: DEFAULT_ACCOUNT_ICON,
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
        icon: account.icon || DEFAULT_ACCOUNT_ICON,
        notes: account.notes ?? '',
      });
    } else {
      reset(emptyValues);
    }
  }, [open, account, reset]);

  const selectedIcon = watch('icon');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar conta' : 'Nova conta'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="account-name">Nome</Label>
            <Input id="account-name" className="w-full" placeholder="Ex.: Conta corrente" {...register('name')} />
            {errors.name && <p className="text-expense text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="account-type">Tipo de conta</Label>
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <SelectMenu
                  id="account-type"
                  value={field.value || ''}
                  onChange={(value) => field.onChange(Number(value))}
                  placeholder="Selecione..."
                  options={accountTypes.map((type) => ({
                    value: type.accountType,
                    label: type.name,
                  }))}
                />
              )}
            />
            {errors.accountType && (
              <p className="text-expense text-xs mt-1">{errors.accountType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account-color">Cor</Label>
            <input
              id="account-color"
              type="color"
              className="h-9 w-full rounded-lg border border-border bg-bg/60 p-1"
              {...register('color')}
            />
          </div>

          {!isEditing && (
            <div className="sm:col-span-2">
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

          <div className="sm:col-span-2">
            <Label>Ícone</Label>
            <div className="grid max-h-44 grid-cols-8 gap-2 overflow-y-auto rounded-md border border-border bg-surface-2/30 p-2">
              {ACCOUNT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={`Selecionar ícone ${icon}`}
                  onClick={() => setValue('icon', icon, { shouldDirty: true })}
                  className={
                    'flex h-9 w-9 items-center justify-center rounded-md border text-text-muted transition-colors ' +
                    (selectedIcon === icon
                      ? 'border-primary bg-primary/10 text-text'
                      : 'border-border bg-surface hover:bg-surface-2')
                  }
                >
                  <EntityIcon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="account-notes">Observações</Label>
            <Textarea id="account-notes" rows={2} placeholder="Opcional" {...register('notes')} />
          </div>

          <DialogFooter className="sm:col-span-2">
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
