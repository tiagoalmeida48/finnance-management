import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryTypeId, PaymentMethodId, TransactionTypeId } from '@/config/constants';
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
    paymentDate: ((t.card ? (t.purchaseDate ?? t.paymentDate) : t.paymentDate) ?? '').slice(0, 10),
    purchaseDate: '',
    account: t.account ?? 0,
    toAccount: t.toAccount ?? 0,
    card: t.card ?? 0,
    category: t.category ?? 0,
    paymentMethod: t.card ? PaymentMethodId.CREDIT : (t.paymentMethod ?? 0),
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
      reset(defaultValues());
      return;
    }
    if (initialized.current) return;
    if (editing && !lookupsReady) return;
    reset(editing ? toFormValues(editing) : defaultValues());
    initialized.current = true;
  }, [open, editing, lookupsReady, reset]);

  const transactionType = Number(watch('transactionType'));
  const card = Number(watch('card'));
  const account = Number(watch('account'));
  const paymentMethod = Number(watch('paymentMethod'));
  const isInstallment = watch('isInstallment');
  const isFixed = watch('isFixed');
  const isTransfer = transactionType === TransactionTypeId.TRANSFER;
  const isCreditMethod = !isTransfer && paymentMethod === PaymentMethodId.CREDIT;
  const isCard = isCreditMethod && card > 0;
  const amountValue = Number(watch('amount')) || 0;

  useEffect(() => {
    if (paymentMethod === PaymentMethodId.DEBIT) setValue('isPaid', true);
  }, [paymentMethod, setValue]);

  useEffect(() => {
    const current = Number(watch('card'));
    if (!current || !cards.data?.length) return;
    const stillValid =
      isCreditMethod && cards.data.some((c) => c.creditCard === current && (!account || c.bankAccount === account));
    if (!stillValid) setValue('card', 0, { shouldValidate: true });
  }, [isCreditMethod, account, cards.data, setValue, watch]);

  const categoryType =
    transactionType === TransactionTypeId.INCOME ? CategoryTypeId.INCOME : CategoryTypeId.EXPENSE;

  useEffect(() => {
    const current = Number(watch('category'));
    if (!current || !categories.data?.length) return;
    const valid = categories.data.some(
      (c) => c.category === current && c.categoryType === categoryType,
    );
    if (!valid) setValue('category', 0, { shouldValidate: true });
  }, [categoryType, categories.data, setValue, watch]);
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
    () =>
      (cards.data ?? [])
        .filter((c) => !account || c.bankAccount === account)
        .map((c) => ({ value: c.creditCard, label: c.name })),
    [cards.data, account],
  );
  const categoryOptions = useMemo(
    () =>
      (categories.data ?? [])
        .filter((c) => c.categoryType === categoryType)
        .map((c) => ({ value: c.category, label: c.name })),
    [categories.data, categoryType],
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
        notes: data.notes ?? '',
      };
      if (data.account) groupPayload.account = Number(data.account);
      else groupPayload.clearAccount = true;
      if (transfer && data.toAccount) groupPayload.toAccount = Number(data.toAccount);
      else groupPayload.clearToAccount = true;
      if (onCard) groupPayload.card = Number(data.card);
      else groupPayload.clearCard = true;
      if (!transfer && data.category) groupPayload.category = Number(data.category);
      else groupPayload.clearCategory = true;
      if (!transfer && data.paymentMethod) groupPayload.paymentMethod = Number(data.paymentMethod);
      else groupPayload.clearPaymentMethod = true;
      if (onCard && data.paymentDate) groupPayload.purchaseDate = data.paymentDate;
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
      if (onCard && data.paymentDate) updatePayload.purchaseDate = data.paymentDate;
      else updatePayload.clearPurchaseDate = true;
      update.mutate(updatePayload, { onSuccess: onClose });
      return;
    }

    const payload: TransactionCreateInput = {
      transactionType: Number(data.transactionType),
      amount: Number(data.amount),
      description: data.description.trim(),
      paymentDate: data.paymentDate || null,
      purchaseDate: !isTransfer && data.card && data.paymentDate ? data.paymentDate : null,
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
    isCreditMethod,
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
