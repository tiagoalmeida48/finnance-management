import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import { useCategories } from '@/shared/hooks/api/useCategories';
import { useCreditCards } from '@/shared/hooks/api/useCreditCards';
import {
  useCreateTransaction,
  useUpdateTransaction,
  useUpdateTransactionGroup,
} from '@/shared/hooks/api/useTransactions';
import { Transaction, type CreateTransactionData } from '@/shared/interfaces/transaction.interface';
import { toDateKeyIgnoringTime } from '@/shared/utils/transactionsGroup.utils';

const transactionSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense', 'transfer']),
  payment_date: z.string(),
  account_id: z.string().optional(),
  to_account_id: z.string().optional(),
  card_id: z.string().optional(),
  category_id: z.string().optional().nullable(),
  is_fixed: z.boolean().default(false),
  repeat_count: z.coerce.number().min(1).max(60).optional(),
  is_paid: z.boolean().default(false),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  is_installment: z.boolean().default(false),
  total_installments: z.coerce.number().min(1, 'Mínimo 1').max(120, 'Máximo 120').optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

type TransactionMutationPayload = Partial<Transaction> & {
  installment_amounts?: number[];
  repeat_count?: number;
  is_installment?: boolean;
  installments?: { amount: number }[];
};

const NON_TRANSACTION_FIELDS = new Set([
  'installment_amounts',
  'repeat_count',
  'is_installment',
  'installments',
]);
const DATE_LIKE_FIELDS = new Set<keyof Transaction>(['payment_date', 'purchase_date']);

const toComparableValue = (field: keyof Transaction, value: unknown) => {
  if (value === undefined || value === null || value === '') return null;
  if (DATE_LIKE_FIELDS.has(field) && typeof value === 'string') {
    return toDateKeyIgnoringTime(value) ?? value;
  }
  return value;
};

const buildChangedUpdates = (transaction: Transaction, updates: TransactionMutationPayload) => {
  const changed: Partial<Transaction> = {};

  for (const [key, rawValue] of Object.entries(updates)) {
    if (NON_TRANSACTION_FIELDS.has(key)) continue;
    if (rawValue === undefined) continue;

    const field = key as keyof Transaction;
    const currentValue = transaction[field];

    if (toComparableValue(field, currentValue) === toComparableValue(field, rawValue)) {
      continue;
    }

    (changed as Record<string, unknown>)[field] = rawValue;
  }

  return changed;
};

export function useTransactionFormLogic(
  open: boolean,
  onClose: () => void,
  transaction?: Transaction,
) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: cards } = useCreditCards();

  const [applyToGroup, setApplyToGroup] = useState(false);

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const updateTransactionGroup = useUpdateTransactionGroup();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionFormValues>,
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      payment_date: new Date().toISOString().split('T')[0],
      is_fixed: false,
      repeat_count: 1,
      is_paid: false,
      is_installment: false,
      total_installments: 1,
      account_id: '',
      category_id: '',
    },
  });

  const transactionType = useWatch({ control: form.control, name: 'type', defaultValue: 'expense' });
  const paymentMethod = useWatch({ control: form.control, name: 'payment_method' });
  const isInstallment = useWatch({ control: form.control, name: 'is_installment', defaultValue: false });
  const isFixed = useWatch({ control: form.control, name: 'is_fixed', defaultValue: false });
  const totalInstallments = useWatch({ control: form.control, name: 'total_installments', defaultValue: 1 }) || 1;
  const baseAmount = useWatch({ control: form.control, name: 'amount', defaultValue: 0 }) || 0;
  const selectedAccountId = useWatch({ control: form.control, name: 'account_id' });

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (paymentMethod === 'credit' && selectedAccountId) {
      return cards.filter((c) => c.bank_account_id === selectedAccountId);
    }
    return cards;
  }, [cards, paymentMethod, selectedAccountId]);

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset({
        description: transaction?.description || '',
        amount: transaction?.amount || 0,
        type: transaction?.type || 'expense',
        payment_date:
          (transaction?.card_id
            ? transaction.purchase_date || transaction.payment_date
            : transaction?.payment_date) || new Date().toISOString().split('T')[0],
        is_fixed: transaction?.is_fixed || false,
        repeat_count: 1,
        is_paid: transaction?.is_paid ?? false,
        is_installment: !!transaction?.installment_group_id,
        total_installments: transaction?.total_installments || 1,
        account_id: transaction?.account_id || '',
        to_account_id: transaction?.to_account_id || '',
        card_id: transaction?.card_id || '',
        category_id: transaction?.category_id || '',
        payment_method: transaction?.payment_method || (transaction?.card_id ? 'credit' : 'debit'),
      });
    }
  }, [transaction, open, reset]);

  const resetUiState = () => {
    setApplyToGroup(false);
  };

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const payload: TransactionMutationPayload = { ...values };
      const isCreditPurchase = values.payment_method === 'credit' && Boolean(values.card_id);
      if (values.type !== 'transfer') delete payload.to_account_id;
      if (values.payment_method !== 'credit') delete payload.card_id;

      if (isCreditPurchase) {
        payload.purchase_date = values.payment_date;
        if (!transaction || !transaction.is_paid) {
          payload.payment_date = values.payment_date;
        } else {
          delete payload.payment_date;
        }
      } else {
        delete payload.purchase_date;
      }

      if (!values.is_installment) {
        delete payload.total_installments;
        payload.installment_group_id = null;
      }

      if (!values.is_fixed) {
        payload.recurring_group_id = null;
        payload.repeat_count = undefined;
      }

      if (payload.category_id === '') payload.category_id = null;
      if (payload.account_id === '') payload.account_id = null;
      if (payload.card_id === '') payload.card_id = null;
      if (payload.to_account_id === '') payload.to_account_id = null;

      if (transaction) {
        delete payload.repeat_count;
        delete payload.is_installment;
        const changedUpdates = buildChangedUpdates(transaction, payload);
        if (Object.keys(changedUpdates).length === 0) {
          resetUiState();
          onClose();
          return;
        }

        const groupId = transaction.installment_group_id || transaction.recurring_group_id;
        const groupType = transaction.installment_group_id ? 'installment' : 'recurring';
        if (applyToGroup && groupId) {
          await updateTransactionGroup.mutateAsync({ groupId, type: groupType, updates: changedUpdates });
        } else {
          await updateTransaction.mutateAsync({ id: transaction.id, updates: changedUpdates });
        }
      } else {
        const createPayload: CreateTransactionData = {
          ...(payload as CreateTransactionData),
          is_paid: values.is_paid,
          is_fixed: Boolean(values.is_fixed),
          recurring_group_id: values.is_fixed
            ? (payload.recurring_group_id as string | null | undefined)
            : null,
          repeat_count: values.is_fixed ? values.repeat_count : undefined,
        };

        await createTransaction.mutateAsync(createPayload);
      }
      resetUiState();
      onClose();
    } catch { return; }
  };

  return {
    form,
    accounts,
    categories,
    cards: filteredCards,
    applyToGroup,
    setApplyToGroup,
    resetUiState,
    transactionType,
    paymentMethod,
    isInstallment,
    isFixed,
    totalInstallments,
    baseAmount,
    selectedAccountId,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
