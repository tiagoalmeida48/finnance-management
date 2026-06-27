import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionTypeId } from '@/config/constants';
import { formatCurrency } from '@/shared/utils';
import {
  transactionFormSchema,
  type TransactionFormData,
} from '../components/transactionFormSchema';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
  usePaymentMethodsLookup,
} from './useLookups';
import { useTransactionMutations } from './useTransactions';
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
  UpdateGroupInput,
} from '../types/transactions.types';

interface UseTransactionFormLogicArgs {
  open: boolean;
  editing?: Transaction | null;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

function defaultValues(): TransactionFormData {
  return {
    transactionType: TransactionTypeId.EXPENSE,
    paymentDate: today(),
    purchaseDate: '',
    isPaid: false,
    isFixed: false,
    isInstallment: false,
    totalInstallments: 1,
    repeatCount: 1,
    replicateToGroup: false,
  } as TransactionFormData;
}

function toFormValues(t: Transaction): TransactionFormData {
  return {
    transactionType: t.transactionType,
    amount: t.amount ?? 0,
    description: t.description,
    paymentDate: (t.paymentDate ?? '').slice(0, 10),
    purchaseDate: (t.purchaseDate ?? '').slice(0, 10),
    account: t.account ?? 0,
    toAccount: t.toAccount ?? 0,
    card: t.card ?? 0,
    category: t.category ?? 0,
    paymentMethod: t.paymentMethod ?? 0,
    notes: t.notes ?? '',
    isPaid: t.paid,
    isFixed: t.fixed,
    isInstallment: false,
    totalInstallments: 1,
    repeatCount: 1,
    replicateToGroup: false,
  };
}

export function useTransactionFormLogic({ open, editing, onClose }: UseTransactionFormLogicArgs) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();
  const paymentMethods = usePaymentMethodsLookup();
  const { create, update, updateGroup } = useTransactionMutations();
  const groupId = editing?.installmentGroup ?? editing?.recurringGroup ?? null;
  const isGroupEditing = Boolean(editing && groupId != null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaultValues(),
  });

  const initialized = useRef(false);
  const lookupsReady =
    !accounts.isLoading && !cards.isLoading && !categories.isLoading && !paymentMethods.isLoading;

  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    if (editing && !lookupsReady) return;
    reset(editing ? toFormValues(editing) : defaultValues());
    initialized.current = true;
  }, [open, editing, lookupsReady, reset]);

  const transactionType = Number(watch('transactionType'));
  const card = Number(watch('card'));
  const isInstallment = watch('isInstallment');
  const isFixed = watch('isFixed');
  const isTransfer = transactionType === TransactionTypeId.TRANSFER;
  const isCard = !isTransfer && card > 0;
  const amountValue = Number(watch('amount')) || 0;
  const installmentsCount = Number(watch('totalInstallments')) || 0;
  const installmentPreview =
    isInstallment && amountValue > 0 && installmentsCount > 1
      ? `${installmentsCount}x de ${formatCurrency(amountValue / installmentsCount)}`
      : null;

  const accountOptions = useMemo(
    () => (accounts.data ?? []).map((a) => ({ value: a.bankAccount, label: a.name })),
    [accounts.data],
  );
  const cardOptions = useMemo(
    () => (cards.data ?? []).map((c) => ({ value: c.creditCard, label: c.name })),
    [cards.data],
  );
  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((c) => ({ value: c.category, label: c.name })),
    [categories.data],
  );
  const paymentMethodOptions = useMemo(
    () => (paymentMethods.data ?? []).map((p) => ({ value: p.paymentMethod, label: p.name })),
    [paymentMethods.data],
  );

  const bind = (name: keyof TransactionFormData) => ({
    value: (watch(name) as string | number | undefined) ?? '',
    onChange: (value: string) => setValue(name, value, { shouldValidate: true }),
  });

  const setType = (value: number) => setValue('transactionType', value, { shouldValidate: true });

  const onSubmit = handleSubmit((data) => {
    if (editing && data.replicateToGroup && groupId != null) {
      const type = Number(data.transactionType);
      const transfer = type === TransactionTypeId.TRANSFER;
      const onCard = !transfer && Number(data.card) > 0;
      const groupPayload: UpdateGroupInput = {
        groupId,
        type: editing.installmentGroup != null ? 'installment' : 'recurring',
        transactionType: type,
        amount: Number(data.amount),
        description: data.description.trim(),
        paymentDate: data.paymentDate || null,
        category: !transfer && data.category ? Number(data.category) : null,
        paymentMethod: !transfer && data.paymentMethod ? Number(data.paymentMethod) : null,
        notes: data.notes ?? '',
      };
      if (data.account) groupPayload.account = Number(data.account);
      else groupPayload.clearAccount = true;
      if (transfer && data.toAccount) groupPayload.toAccount = Number(data.toAccount);
      else groupPayload.clearToAccount = true;
      if (onCard) groupPayload.card = Number(data.card);
      else groupPayload.clearCard = true;
      if (onCard && data.purchaseDate) groupPayload.purchaseDate = data.purchaseDate;
      else groupPayload.clearPurchaseDate = true;
      updateGroup.mutate(groupPayload, { onSuccess: onClose });
      return;
    }

    if (editing) {
      const type = Number(data.transactionType);
      const transfer = type === TransactionTypeId.TRANSFER;
      const onCard = !transfer && Number(data.card) > 0;
      const updatePayload: TransactionUpdateInput = {
        transaction: editing.transaction,
        transactionType: type,
        amount: Number(data.amount),
        description: data.description.trim(),
        paymentDate: data.paymentDate || null,
        paid: Boolean(data.isPaid),
        fixed: Boolean(data.isFixed),
        notes: data.notes ?? '',
      };
      if (data.account) updatePayload.account = Number(data.account);
      else updatePayload.clearAccount = true;
      if (transfer && data.toAccount) updatePayload.toAccount = Number(data.toAccount);
      else updatePayload.clearToAccount = true;
      if (onCard) updatePayload.card = Number(data.card);
      else updatePayload.clearCard = true;
      if (!transfer && data.category) updatePayload.category = Number(data.category);
      else updatePayload.clearCategory = true;
      if (!transfer && data.paymentMethod) updatePayload.paymentMethod = Number(data.paymentMethod);
      else updatePayload.clearPaymentMethod = true;
      if (onCard && data.purchaseDate) updatePayload.purchaseDate = data.purchaseDate;
      else updatePayload.clearPurchaseDate = true;
      update.mutate(updatePayload, { onSuccess: onClose });
      return;
    }

    const payload: TransactionCreateInput = {
      transactionType: Number(data.transactionType),
      amount: Number(data.amount),
      description: data.description.trim(),
      paymentDate: data.paymentDate || null,
      purchaseDate: data.purchaseDate ? data.purchaseDate : null,
      account: data.account ? Number(data.account) : null,
      toAccount: isTransfer && data.toAccount ? Number(data.toAccount) : null,
      card: !isTransfer && data.card ? Number(data.card) : null,
      category: !isTransfer && data.category ? Number(data.category) : null,
      paymentMethod: !isTransfer && data.paymentMethod ? Number(data.paymentMethod) : null,
      notes: data.notes ?? '',
      isPaid: Boolean(data.isPaid),
      isFixed: Boolean(data.isFixed),
      isInstallment: Boolean(data.isInstallment),
      totalInstallments: data.isInstallment ? Number(data.totalInstallments) : 1,
      repeatCount: data.isFixed ? Number(data.repeatCount) : 1,
      installmentAmounts: null,
      recurringGroup: null,
    };
    create.mutate(payload, { onSuccess: onClose });
  });

  return {
    register,
    errors,
    onSubmit,
    setType,
    bind,
    transactionType,
    isTransfer,
    isCard,
    isInstallment,
    isFixed,
    installmentPreview,
    isGroupEditing,
    accountOptions,
    cardOptions,
    categoryOptions,
    paymentMethodOptions,
    isPending: create.isPending || update.isPending || updateGroup.isPending,
  };
}
