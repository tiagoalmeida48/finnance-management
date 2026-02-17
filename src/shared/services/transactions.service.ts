import { supabase } from '@/lib/supabase/client';
import { Transaction, CreateTransactionData } from '../interfaces';
import { invokeSupabaseFunction } from './supabase-functions.service';
import {
    buildInstallmentDescription,
    extractDayFromDateLike,
    filterGroupUpdates,
    replaceDateDayPreservingMonth,
    shiftDateByMonths,
    stripInstallmentSuffix,
    toDateKeyIgnoringTime,
} from './transactionsGroup.utils';

const DATE_LIKE_FIELDS: Array<keyof Transaction> = ['payment_date', 'purchase_date'];

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
    Object.prototype.hasOwnProperty.call(value, key);

const toComparableValue = (field: keyof Transaction, value: unknown) => {
    if (value === undefined || value === null || value === '') return null;

    if (DATE_LIKE_FIELDS.includes(field)) {
        return typeof value === 'string' ? (toDateKeyIgnoringTime(value) ?? value) : null;
    }

    return value;
};

const hasChangedValue = (field: keyof Transaction, currentValue: unknown, nextValue: unknown) =>
    toComparableValue(field, currentValue) !== toComparableValue(field, nextValue);

const buildSingleTransactionCreatePayload = (
    transaction: Transaction,
    overrides: Partial<CreateTransactionData> = {},
): CreateTransactionData => {
    const payload: CreateTransactionData = {
        description: `${stripInstallmentSuffix(transaction.description) || transaction.description} (copia)`,
        amount: Number(transaction.amount) || 0,
        type: transaction.type,
        payment_date: toDateKeyIgnoringTime(transaction.payment_date) ?? transaction.payment_date,
        purchase_date: toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ?? transaction.purchase_date ?? undefined,
        account_id: transaction.account_id ?? null,
        to_account_id: transaction.to_account_id ?? null,
        card_id: transaction.card_id ?? null,
        invoice_id: null,
        category_id: transaction.category_id ?? null,
        is_fixed: false,
        is_paid: false,
        installment_group_id: null,
        installment_number: null,
        total_installments: 1,
        recurring_group_id: null,
        notes: transaction.notes ?? null,
        payment_method: transaction.payment_method ?? null,
        is_installment: false,
        repeat_count: undefined,
    };

    return {
        ...payload,
        ...overrides,
    };
};

export const transactionsService = {
    async getAll(filters?: { account_id?: string; category_id?: string; start_date?: string; end_date?: string; is_paid?: boolean }) {
        const pageSize = 1000;
        let from = 0;
        const allTransactions: Transaction[] = [];

        while (true) {
            let query = supabase
                .from('transactions')
                .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)')
                .order('payment_date', { ascending: false })
                .range(from, from + pageSize - 1);

            if (filters?.account_id) query = query.eq('account_id', filters.account_id);
            if (filters?.category_id) query = query.eq('category_id', filters.category_id);
            if (filters?.start_date) query = query.gte('payment_date', filters.start_date);
            if (filters?.end_date) query = query.lte('payment_date', filters.end_date);
            if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);

            const { data, error } = await query;
            if (error) throw error;

            const page = (data ?? []) as Transaction[];
            allTransactions.push(...page);

            if (page.length < pageSize) break;
            from += pageSize;
        }

        return allTransactions;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async create(transaction: CreateTransactionData) {
        return await invokeSupabaseFunction<Transaction>('manage-transactions', {
            action: 'create',
            payload: transaction,
        });
    },

    async batchCreate(transactions: Partial<Transaction>[]) {
        return Promise.all(
            transactions.map((transaction) => this.create(transaction as CreateTransactionData)),
        );
    },

    async update(id: string, updates: Partial<Transaction>) {
        return await invokeSupabaseFunction<Transaction>('manage-transactions', {
            action: 'update',
            payload: { id, updates },
        });
    },

    async togglePaymentStatus(id: string, currentStatus: boolean) {
        // Toggling is just updating is_paid
        return await invokeSupabaseFunction<Transaction>('manage-transactions', {
            action: 'update',
            payload: { id, updates: { is_paid: !currentStatus } },
        });
    },

    async batchPay(ids: string[], accountId: string, paymentDate: string) {
        return await invokeSupabaseFunction<Transaction[]>('manage-transactions', {
            action: 'batch-pay',
            payload: { ids, accountId, paymentDate },
        });
    },

    async batchUnpay(ids: string[]) {
        return await invokeSupabaseFunction<Transaction[]>('manage-transactions', {
            action: 'batch-unpay',
            payload: { ids },
        });
    },

    async batchDelete(ids: string[]) {
        await Promise.all(ids.map((id) => this.delete(id)));
    },

    async batchChangeDay(ids: string[], day: number) {
        return await invokeSupabaseFunction<Transaction[]>('manage-transactions', {
            action: 'batch-change-day',
            payload: { ids, day },
        });
    },

    async delete(id: string) {
        await invokeSupabaseFunction<{ success: true }>('manage-transactions', {
            action: 'delete',
            payload: { id },
        });
    },

    async deleteGroup(groupId: string, type: 'installment' | 'recurring') {
        await invokeSupabaseFunction<{ success: true }>('manage-transactions', {
            action: 'delete-group',
            payload: { groupId, type },
        });
    },

    async duplicate(id: string) {
        const transaction = await this.getById(id);
        const baseDescription = stripInstallmentSuffix(transaction.description) || transaction.description;

        const duplicatePayload = buildSingleTransactionCreatePayload(transaction, {
            description: `${baseDescription} (copia)`,
            payment_date: toDateKeyIgnoringTime(transaction.payment_date) ?? transaction.payment_date,
            purchase_date: toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ?? transaction.purchase_date ?? undefined,
        });

        return await this.create(duplicatePayload);
    },

    async insertInstallmentBetween(id: string) {
        const selectedTransaction = await this.getById(id);
        const installmentGroupId = selectedTransaction.installment_group_id;

        if (!installmentGroupId) {
            throw new Error('A transacao selecionada nao pertence a um grupo de parcelas.');
        }

        const { data: groupTransactionsRaw, error: fetchGroupError } = await supabase
            .from('transactions')
            .select('*')
            .eq('installment_group_id', installmentGroupId);

        if (fetchGroupError) throw fetchGroupError;

        const groupTransactions = ((groupTransactionsRaw ?? []) as Transaction[])
            .sort((a, b) => (a.installment_number ?? 0) - (b.installment_number ?? 0));

        if (groupTransactions.length === 0) {
            throw new Error('Nao foi possivel localizar as parcelas do grupo.');
        }

        const selectedInstallmentNumber = selectedTransaction.installment_number
            ?? (groupTransactions.findIndex((transaction) => transaction.id === selectedTransaction.id) + 1);

        if (!selectedInstallmentNumber || selectedInstallmentNumber < 1) {
            throw new Error('Nao foi possivel identificar a parcela selecionada.');
        }

        const currentTotalInstallments = Math.max(
            ...groupTransactions.map((transaction) => transaction.total_installments ?? transaction.installment_number ?? 1),
            groupTransactions.length,
        );

        const insertionInstallmentNumber = Math.min(selectedInstallmentNumber + 1, currentTotalInstallments + 1);
        const updatedTotalInstallments = currentTotalInstallments + 1;
        const baseDescription = stripInstallmentSuffix(selectedTransaction.description) || 'Parcela';

        const nextInstallment = groupTransactions.find(
            (transaction) => (transaction.installment_number ?? 0) === insertionInstallmentNumber,
        );

        const insertedPaymentDate = nextInstallment?.payment_date
            ? (toDateKeyIgnoringTime(nextInstallment.payment_date) ?? nextInstallment.payment_date)
            : (shiftDateByMonths(selectedTransaction.payment_date, 1)
                ?? toDateKeyIgnoringTime(selectedTransaction.payment_date)
                ?? selectedTransaction.payment_date);

        const insertedPurchaseDate = nextInstallment?.purchase_date
            ? (toDateKeyIgnoringTime(nextInstallment.purchase_date) ?? nextInstallment.purchase_date)
            : (shiftDateByMonths(selectedTransaction.purchase_date, 1)
                ?? toDateKeyIgnoringTime(selectedTransaction.purchase_date ?? undefined)
                ?? selectedTransaction.purchase_date
                ?? null);

        const descendingInstallments = [...groupTransactions].sort(
            (a, b) => (b.installment_number ?? 0) - (a.installment_number ?? 0),
        );

        for (const transaction of descendingInstallments) {
            const currentInstallmentNumber = transaction.installment_number ?? 1;

            if (currentInstallmentNumber >= insertionInstallmentNumber) {
                const shiftedPaymentDate = shiftDateByMonths(transaction.payment_date, 1)
                    ?? toDateKeyIgnoringTime(transaction.payment_date)
                    ?? transaction.payment_date;

                const shiftedPurchaseDate = transaction.purchase_date
                    ? (shiftDateByMonths(transaction.purchase_date, 1)
                        ?? toDateKeyIgnoringTime(transaction.purchase_date)
                        ?? transaction.purchase_date)
                    : null;

                await this.update(transaction.id, {
                    installment_number: currentInstallmentNumber + 1,
                    total_installments: updatedTotalInstallments,
                    description: buildInstallmentDescription(
                        baseDescription,
                        currentInstallmentNumber + 1,
                        updatedTotalInstallments,
                    ),
                    payment_date: shiftedPaymentDate,
                    purchase_date: shiftedPurchaseDate,
                });

                continue;
            }

            await this.update(transaction.id, {
                total_installments: updatedTotalInstallments,
                description: buildInstallmentDescription(
                    baseDescription,
                    currentInstallmentNumber,
                    updatedTotalInstallments,
                ),
            });
        }

        const insertedInstallmentDraft = await this.create(
            buildSingleTransactionCreatePayload(selectedTransaction, {
                description: buildInstallmentDescription(
                    baseDescription,
                    insertionInstallmentNumber,
                    updatedTotalInstallments,
                ),
                payment_date: insertedPaymentDate,
                purchase_date: insertedPurchaseDate ?? undefined,
                is_paid: false,
            }),
        );

        return await this.update(insertedInstallmentDraft.id, {
            installment_group_id: installmentGroupId,
            installment_number: insertionInstallmentNumber,
            total_installments: updatedTotalInstallments,
            description: buildInstallmentDescription(
                baseDescription,
                insertionInstallmentNumber,
                updatedTotalInstallments,
            ),
            payment_date: insertedPaymentDate,
            purchase_date: insertedPurchaseDate ?? undefined,
            recurring_group_id: null,
            is_fixed: false,
            is_paid: false,
        });
    },

    async payBill(_cardId: string, transactionIds: string[], accountId: string, paymentDate: string, amount: number, description: string) {
        // Keep cardId in signature for backward compatibility with current UI contract.
        const normalizedDescription = description.startsWith('Pgto Fatura:')
            ? description
            : `Pgto Fatura: ${description}`;

        const { data: existingPayment } = await supabase
            .from('transactions')
            .select('id')
            .eq('description', normalizedDescription)
            .eq('payment_method', 'bill_payment')
            .limit(1)
            .maybeSingle();

        if (existingPayment?.id) {
            await this.update(existingPayment.id, {
                amount,
                type: 'expense',
                account_id: accountId,
                payment_date: paymentDate,
                is_paid: true,
                is_fixed: false,
                card_id: null,
                invoice_id: null,
                category_id: null,
                payment_method: 'bill_payment',
            } as Partial<Transaction>);
        } else {
            await this.create({
                description: normalizedDescription,
                amount,
                type: 'expense',
                account_id: accountId,
                payment_date: paymentDate,
                is_paid: true,
                is_fixed: false,
                card_id: null,
                invoice_id: null,
                category_id: null,
                payment_method: 'bill_payment',
            } as CreateTransactionData);
        }

        await this.batchPay(transactionIds, accountId, paymentDate);
    },

    async updateGroup(groupId: string, type: 'installment' | 'recurring', updates: Partial<Transaction>) {
        const groupUpdates = filterGroupUpdates(updates);
        if (Object.keys(groupUpdates).length === 0) return [];

        const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';
        const { data: transactionsRaw, error: fetchGroupError } = await supabase
            .from('transactions')
            .select('*')
            .eq(column, groupId);

        if (fetchGroupError) throw fetchGroupError;

        const transactions = (transactionsRaw ?? []) as Transaction[];
        if (transactions.length === 0) return [];

        const sortedTransactions = [...transactions].sort((a, b) => {
            if (type === 'installment') {
                return (a.installment_number ?? 0) - (b.installment_number ?? 0);
            }
            return (a.payment_date || '').localeCompare(b.payment_date || '');
        });

        const hasPaymentDate = hasOwn(groupUpdates, 'payment_date');
        const hasPurchaseDate = hasOwn(groupUpdates, 'purchase_date');
        const hasDescription = hasOwn(groupUpdates, 'description');

        const paymentDay = hasPaymentDate
            ? extractDayFromDateLike(groupUpdates.payment_date as string | null | undefined)
            : null;

        const purchaseDay = hasPurchaseDate
            ? extractDayFromDateLike(groupUpdates.purchase_date as string | null | undefined)
            : null;

        const baseDescription = hasDescription && typeof groupUpdates.description === 'string'
            ? stripInstallmentSuffix(groupUpdates.description)
            : '';

        const sharedRawUpdates: Partial<Transaction> = { ...groupUpdates };
        delete sharedRawUpdates.payment_date;
        delete sharedRawUpdates.purchase_date;
        delete sharedRawUpdates.description;
        const updatedTransactions: Transaction[] = [];

        for (const transaction of sortedTransactions) {
            const perTransactionUpdates: Partial<Transaction> = { ...sharedRawUpdates };

            if (hasPaymentDate) {
                if (paymentDay !== null && transaction.payment_date) {
                    const nextPaymentDate = replaceDateDayPreservingMonth(transaction.payment_date, paymentDay);
                    if (nextPaymentDate) perTransactionUpdates.payment_date = nextPaymentDate;
                }
            }

            if (hasPurchaseDate) {
                if (groupUpdates.purchase_date === null) {
                    perTransactionUpdates.purchase_date = null;
                } else if (purchaseDay !== null && transaction.purchase_date) {
                    const nextPurchaseDate = replaceDateDayPreservingMonth(transaction.purchase_date, purchaseDay);
                    if (nextPurchaseDate) perTransactionUpdates.purchase_date = nextPurchaseDate;
                }
            }

            if (hasDescription) {
                if (type === 'installment') {
                    perTransactionUpdates.description = buildInstallmentDescription(
                        baseDescription || stripInstallmentSuffix(transaction.description) || 'Parcela',
                        transaction.installment_number ?? 1,
                        transaction.total_installments ?? sortedTransactions.length,
                    );
                } else {
                    perTransactionUpdates.description = String(groupUpdates.description ?? '');
                }
            }

            const changedUpdates = Object.fromEntries(
                Object.entries(perTransactionUpdates).filter(([field, value]) => (
                    hasChangedValue(
                        field as keyof Transaction,
                        transaction[field as keyof Transaction],
                        value,
                    )
                )),
            ) as Partial<Transaction>;

            if (Object.keys(changedUpdates).length === 0) {
                continue;
            }

            const updatedTransaction = await this.update(transaction.id, changedUpdates);
            updatedTransactions.push(updatedTransaction);
        }

        return updatedTransactions;
    },

    async getFirstTransactionDate() {
        const { data, error } = await supabase
            .from('transactions')
            .select('payment_date')
            .order('payment_date', { ascending: true })
            .limit(1)
            .single();

        if (error) return null;
        return data?.payment_date || null;
    },
};
export type { Transaction };
