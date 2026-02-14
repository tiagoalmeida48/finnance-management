import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from './useAccounts';
import { useCategories } from './useCategories';
import { useCreditCards } from './useCreditCards';
import { useCreateTransaction, useUpdateTransaction, useUpdateTransactionGroup } from './useTransactions';
import { Transaction, type CreateTransactionData } from '../interfaces/transaction.interface';

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
    installments: z.array(z.object({ amount: z.coerce.number() })).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

type TransactionMutationPayload = Partial<Transaction> & {
    installment_amounts?: number[];
    repeat_count?: number;
    is_installment?: boolean;
    installments?: { amount: number }[];
};

export function useTransactionFormLogic(open: boolean, onClose: () => void, transaction?: Transaction) {
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
            installments: [],
        },
    });

    const { replace } = useFieldArray({
        control: form.control,
        name: "installments"
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
            return cards.filter(c => c.bank_account_id === selectedAccountId);
        }
        return cards;
    }, [cards, paymentMethod, selectedAccountId]);

    useEffect(() => {
        if (isInstallment && totalInstallments > 0) {
            const installmentAmount = Number((baseAmount / totalInstallments).toFixed(2));
            const newInstallments = Array.from({ length: totalInstallments }, (_, i) => {
                if (i === totalInstallments - 1) {
                    const sumOfOthers = installmentAmount * (totalInstallments - 1);
                    return { amount: Number((baseAmount - sumOfOthers).toFixed(2)) };
                }
                return { amount: installmentAmount };
            });
            replace(newInstallments);
        } else {
            replace([]);
        }
    }, [isInstallment, totalInstallments, baseAmount, replace]);

    const { reset } = form;

    useEffect(() => {
        if (open) {
            reset({
                description: transaction?.description || '',
                amount: transaction?.amount || 0,
                type: transaction?.type || 'expense',
                payment_date: transaction?.payment_date || new Date().toISOString().split('T')[0],
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
                notes: transaction?.notes || '',
                installments: [],
            });
        }
    }, [transaction, open, reset]);

    const resetUiState = () => {
        setApplyToGroup(false);
    };

    const onSubmit = async (values: TransactionFormValues) => {
        try {
            const payload: TransactionMutationPayload = { ...values };
            if (values.type !== 'transfer') delete payload.to_account_id;
            if (values.payment_method !== 'credit') delete payload.card_id;

            if (!values.is_installment) {
                delete payload.total_installments;
                delete payload.installments;
                payload.installment_group_id = undefined;
            } else if (!transaction) {
                payload.installment_amounts = values.installments?.map(i => i.amount);
                delete payload.installments;
            }

            if (!values.is_fixed) {
                payload.recurring_group_id = null;
                payload.repeat_count = undefined;
            }

            if (payload.category_id === '') payload.category_id = undefined;
            if (payload.account_id === '') payload.account_id = undefined;
            if (payload.card_id === '') payload.card_id = undefined;
            if (payload.to_account_id === '') payload.to_account_id = undefined;

            if (transaction) {
                delete payload.repeat_count;
                delete payload.is_installment;
                delete payload.installment_amounts;
                delete payload.installments;

                if (applyToGroup && values.payment_date === transaction.payment_date) {
                    delete payload.payment_date;
                }

                const groupId = transaction.installment_group_id || transaction.recurring_group_id;
                const groupType = transaction.installment_group_id ? 'installment' : 'recurring';
                if (applyToGroup && groupId) {
                    await updateTransactionGroup.mutateAsync({ groupId, type: groupType, updates: payload });
                } else {
                    await updateTransaction.mutateAsync({ id: transaction.id, updates: payload });
                }
            } else {
                const createPayload: CreateTransactionData = {
                    ...(payload as CreateTransactionData),
                    // New transactions must always start as pending.
                    is_paid: false,
                    // Recurrence only exists when explicitly enabled.
                    is_fixed: Boolean(values.is_fixed),
                    recurring_group_id: values.is_fixed ? (payload.recurring_group_id as string | null | undefined) : null,
                    repeat_count: values.is_fixed ? values.repeat_count : undefined,
                };

                await createTransaction.mutateAsync(createPayload);
            }
            resetUiState();
            onClose();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    return {
        form, accounts, categories, cards: filteredCards,
        applyToGroup, setApplyToGroup,
        resetUiState,
        transactionType, paymentMethod, isInstallment, isFixed,
        totalInstallments, baseAmount, selectedAccountId,
        onSubmit: form.handleSubmit(onSubmit)
    };
}
