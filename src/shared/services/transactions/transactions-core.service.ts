import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../../interfaces';
import { TransactionSchema } from '../../schemas';
import { getTransactionAnchorDateKey } from '@/shared/utils/card-statement-cycle.utils';
import { recalculateInvoiceTotal } from '../invoice-reconciliation.service';
import { TRANSACTION_MUTATION_PAGE_SIZE } from './transactions-utils.service';

export interface TransactionsPaginatedParams {
  start_date?: string;
  end_date?: string;
  type?: string | null;
  is_paid?: boolean;
  account_id?: string;
  card_id?: string;
  category_id?: string;
  payment_method?: string;
  search?: string;
  hide_credit_cards?: boolean;
  only_credit_cards?: boolean;
  only_installments?: boolean;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export type TransactionsSummaryParams = Omit<
  TransactionsPaginatedParams,
  'limit' | 'offset' | 'sort_field' | 'sort_direction'
>;

export const transactionsCoreService = {
  async getAll(filters?: {
    account_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    is_paid?: boolean;
    limit?: number;
    offset?: number;
  }) {
    if (filters?.limit !== undefined) {
      const { data, error } = await supabase.rpc('get_transactions_paginated', {
        p_account_id: filters.account_id ?? null,
        p_category_id: filters.category_id ?? null,
        p_start_date: filters.start_date ?? null,
        p_end_date: filters.end_date ?? null,
        p_is_paid: filters.is_paid ?? null,
        p_limit: filters.limit,
        p_offset: filters.offset ?? 0,
        p_sort_asc: false,
      });
      if (error) throw error;
      return z.array(TransactionSchema).parse(data ?? []);
    }

    let offset = 0;
    const allTransactions: Transaction[] = [];

    while (true) {
      const { data, error } = await supabase.rpc('get_transactions_paginated', {
        p_account_id: filters?.account_id ?? null,
        p_category_id: filters?.category_id ?? null,
        p_start_date: filters?.start_date ?? null,
        p_end_date: filters?.end_date ?? null,
        p_is_paid: filters?.is_paid ?? null,
        p_limit: TRANSACTION_MUTATION_PAGE_SIZE,
        p_offset: offset,
        p_sort_asc: false,
      });
      if (error) throw error;

      const page = z.array(TransactionSchema).parse(data ?? []);
      allTransactions.push(...page);
      if (page.length < TRANSACTION_MUTATION_PAGE_SIZE) break;
      offset += TRANSACTION_MUTATION_PAGE_SIZE;
    }

    return allTransactions;
  },

  async getRecent(limit = 6) {
    const { data, error } = await supabase.rpc('get_transactions_paginated', {
      p_limit: limit,
      p_offset: 0,
      p_sort_asc: false,
    });
    if (error) throw error;
    return z.array(TransactionSchema).parse(data ?? []);
  },

  async getById(id: string) {
    const { data, error } = await supabase.rpc('get_transaction_by_id', { p_id: id });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return TransactionSchema.parse(row);
  },

  async update(id: string, updates: Partial<Transaction>) {
    const oldTransaction = await this.getById(id);

    const { data, error } = await supabase.rpc('update_transaction', {
      p_id: id,
      p_updates: updates as Record<string, unknown>,
    });
    if (error) throw error;

    const updatedTransaction = TransactionSchema.parse(data);

    const oldAnchorDateKey = getTransactionAnchorDateKey(oldTransaction);
    const newAnchorDateKey = getTransactionAnchorDateKey(updatedTransaction);
    const anchorDateChanged = oldAnchorDateKey !== newAnchorDateKey;
    const cardChanged = oldTransaction.card_id !== updatedTransaction.card_id;

    if ((cardChanged || anchorDateChanged) && oldTransaction.invoice_id) {
      await recalculateInvoiceTotal(oldTransaction.invoice_id);
    } else if (
      updatedTransaction.invoice_id &&
      (Number(oldTransaction.amount) !== Number(updatedTransaction.amount) ||
        oldTransaction.type !== updatedTransaction.type ||
        Boolean(oldTransaction.is_paid) !== Boolean(updatedTransaction.is_paid))
    ) {
      await recalculateInvoiceTotal(updatedTransaction.invoice_id);
    }

    return updatedTransaction;
  },

  async togglePaymentStatus(id: string, currentStatus: boolean) {
    return await this.update(id, { is_paid: !currentStatus });
  },

  async delete(id: string) {
    const { data, error } = await supabase.rpc('delete_transaction', { p_id: id });
    if (error) throw error;

    const transaction = TransactionSchema.parse(data);
    if (transaction.invoice_id) {
      await recalculateInvoiceTotal(transaction.invoice_id);
    }
  },

  async getFirstTransactionDate() {
    const { data, error } = await supabase.rpc('get_first_transaction_date');
    if (error) return null;
    return (data as string | null) || null;
  },

  async getPaginated(params: TransactionsPaginatedParams) {
    const effectiveLimit = params.limit === -1 ? 10000 : params.limit;

    const { data, error } = await supabase.rpc('get_transactions_paginated', {
      p_start_date: params.start_date ?? null,
      p_end_date: params.end_date ?? null,
      p_type: params.type ?? null,
      p_is_paid: params.is_paid ?? null,
      p_account_id: params.account_id ?? null,
      p_card_id: params.card_id ?? null,
      p_category_id: params.category_id ?? null,
      p_payment_method: params.payment_method ?? null,
      p_search: params.search?.trim() ?? null,
      p_hide_credit_cards: params.hide_credit_cards ?? false,
      p_only_credit_cards: params.only_credit_cards ?? false,
      p_only_installments: params.only_installments ?? false,
      p_sort_field: params.sort_field ?? 'payment_date',
      p_sort_asc: params.sort_direction === 'asc',
      p_limit: effectiveLimit,
      p_offset: params.offset,
    });

    if (error) throw error;

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    const totalCount = rows.length > 0 ? Number((rows[0] as { total_count?: number }).total_count ?? 0) : 0;

    return {
      data: z.array(TransactionSchema).parse(rows),
      count: totalCount,
    };
  },

  async getSummaries(params: TransactionsSummaryParams) {
    const { data, error } = await supabase.rpc('get_transactions_summaries', {
      p_start_date: params.start_date ?? null,
      p_end_date: params.end_date ?? null,
      p_type: params.type ?? null,
      p_is_paid: params.is_paid ?? null,
      p_account_id: params.account_id ?? null,
      p_card_id: params.card_id ?? null,
      p_category_id: params.category_id ?? null,
      p_payment_method: params.payment_method ?? null,
      p_search: params.search?.trim() ?? null,
      p_hide_credit_cards: params.hide_credit_cards ?? false,
      p_only_credit_cards: params.only_credit_cards ?? false,
      p_only_installments: params.only_installments ?? false,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    const income = Number(row?.income ?? 0);
    const expense = Number(row?.expense ?? 0);
    const pending = Number(row?.pending ?? 0);
    return { income, expense, pending, balance: income - expense };
  },
};
