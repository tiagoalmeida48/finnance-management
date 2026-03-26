import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAccount, useUpdateAccount } from '@/shared/hooks/api/useAccounts';
import type { Account } from '@/shared/interfaces/account.interface';
import { messages } from '@/shared/i18n/messages';

const accountValidationMessages = messages.accounts.form.validation;

const accountSchema = z.object({
  name: z.string().min(3, accountValidationMessages.nameMin),
  type: z.enum(['checking', 'savings', 'investment', 'wallet', 'other'] as const, {
    message: accountValidationMessages.typeRequired,
  }),
  initial_balance: z.number({
    message: accountValidationMessages.initialBalanceRequired,
  }),
  current_balance: z.number().optional(),
  color: z.string().min(1, accountValidationMessages.colorRequired),
  icon: z.string().min(1, accountValidationMessages.iconRequired),
  notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const DEFAULT_ACCOUNT_FORM_VALUES: AccountFormValues = {
  name: '',
  type: 'checking',
  initial_balance: 0,
  current_balance: 0,
  color: '#c9a84c',
  icon: 'wallet',
  notes: '',
};

const mapAccountToFormValues = (account?: Account): AccountFormValues => ({
  name: account?.name ?? DEFAULT_ACCOUNT_FORM_VALUES.name,
  type: account?.type ?? DEFAULT_ACCOUNT_FORM_VALUES.type,
  initial_balance: account?.initial_balance ?? DEFAULT_ACCOUNT_FORM_VALUES.initial_balance,
  current_balance: account?.current_balance ?? DEFAULT_ACCOUNT_FORM_VALUES.current_balance,
  color: account?.color ?? DEFAULT_ACCOUNT_FORM_VALUES.color,
  icon: account?.icon ?? DEFAULT_ACCOUNT_FORM_VALUES.icon,
  notes: account?.notes ?? DEFAULT_ACCOUNT_FORM_VALUES.notes,
});

const fieldBaseClass = 'bg-white/[0.06] border-[var(--overlay-white-16)]';
const fieldErrorClass = 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]';

const getFieldClass = (hasError: boolean) =>
  hasError ? `${fieldBaseClass} ${fieldErrorClass}` : fieldBaseClass;

interface UseAccountFormModalLogicParams {
  open: boolean;
  onClose: () => void;
  account?: Account;
}

export function useAccountFormModalLogic({
  open,
  onClose,
  account,
}: UseAccountFormModalLogicParams) {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: DEFAULT_ACCOUNT_FORM_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(mapAccountToFormValues(account));
    }
  }, [account, open, reset]);

  const onSubmit = async (values: AccountFormValues) => {
    try {
      if (account) {
        await updateAccount.mutateAsync({ id: account.id, updates: values });
      } else {
        await createAccount.mutateAsync({
          ...values,
          current_balance: values.initial_balance,
          is_active: true,
        });
      }
      onClose();
    } catch {
      // erro tratado pelo onError global do QueryClient
    }
  };

  return {
    control,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isSaving: createAccount.isPending || updateAccount.isPending,
    getFieldClass,
  };
}
