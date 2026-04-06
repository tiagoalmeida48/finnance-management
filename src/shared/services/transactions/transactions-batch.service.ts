import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { Transaction, CreateTransactionData } from '../../interfaces';
import { TransactionSchema } from '../../schemas';
import { transactionsCoreService } from './transactions-core.service';
import { transactionsCreationService } from './transactions-creation.service';
import {
  normalizeToPositiveInteger,
  requireAuthenticatedUserId,
  sanitizeCreatePayload,
  sanitizeIds,
} from './transactions-utils.service';

export const transactionsBatchService = {
  async batchCreate(transactions: Partial<Transaction>[]) {
    const createPayloads = transactions.map((transaction) => transaction as CreateTransactionData);
    if (createPayloads.length === 0) return [];

    const hasComplexRules = createPayloads.some((transaction) => {
      const totalInstallments = normalizeToPositiveInteger(transaction.total_installments ?? 1, 1);
      const repeatCount = normalizeToPositiveInteger(transaction.repeat_count ?? 1, 1);
      return (
        Boolean(transaction.is_installment) ||
        totalInstallments > 1 ||
        (transaction.is_fixed && repeatCount > 1)
      );
    });

    if (hasComplexRules) {
      return await Promise.all(
        createPayloads.map((transaction) => transactionsCreationService.create(transaction)),
      );
    }

    const userId = await requireAuthenticatedUserId();
    const rowsToInsert = createPayloads.map((transaction) =>
      sanitizeCreatePayload({
        ...transaction,
        user_id: userId,
        is_paid: Boolean(transaction.is_paid),
        is_fixed: Boolean(transaction.is_fixed),
        recurring_group_id: transaction.is_fixed ? (transaction.recurring_group_id ?? null) : null,
        installment_group_id: transaction.installment_group_id ?? null,
        installment_number: transaction.installment_number ?? null,
        total_installments: transaction.total_installments ?? 1,
      }),
    );

    const { data, error } = await supabase.from('transactions').insert(rowsToInsert).select('*');

    if (error) throw error;

    return z.array(TransactionSchema).parse(data ?? []);
  },

  async batchPay(ids: string[], accountId: string, paymentDate: string) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const { error } = await supabase.rpc('batch_pay_transactions', {
      p_ids: safeIds,
      p_account_id: accountId,
      p_payment_date: paymentDate,
    });

    if (error) throw error;

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .in('id', safeIds);

    if (fetchError) throw fetchError;
    return z.array(TransactionSchema).parse(data ?? []);
  },

  async batchUnpay(ids: string[]) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const { error } = await supabase.rpc('batch_unpay_transactions', {
      p_ids: safeIds,
    });

    if (error) throw error;

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .in('id', safeIds);

    if (fetchError) throw fetchError;
    return z.array(TransactionSchema).parse(data ?? []);
  },

  async batchDelete(ids: string[]) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return;

    const { error } = await supabase.rpc('batch_delete_transactions', {
      p_ids: safeIds,
    });

    if (error) throw error;
  },

  async batchChangeDay(ids: string[], day: number) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const { error } = await supabase.rpc('batch_change_day', {
      p_ids: safeIds,
      p_day: day,
    });

    if (error) throw error;

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .in('id', safeIds);

    if (fetchError) throw fetchError;
    return z.array(TransactionSchema).parse(data ?? []);
  },

  async payBill(
    _cardId: string,
    transactionIds: string[],
    accountId: string,
    paymentDate: string,
    amount: number,
    description: string,
  ) {
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
      await transactionsCoreService.update(existingPayment.id, {
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
      await transactionsCreationService.create({
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
};
