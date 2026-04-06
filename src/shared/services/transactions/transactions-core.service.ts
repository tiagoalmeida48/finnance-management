import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import type { Transaction } from '../../interfaces';
import { TransactionSchema } from '../../schemas';
import { getTransactionAnchorDateKey } from '@/shared/utils/card-statement-cycle.utils';
import { recalculateInvoiceTotal } from '../invoice-reconciliation.service';
import { TRANSACTION_MUTATION_PAGE_SIZE } from './transactions-utils.service';

const TRANSACTION_SELECT =
  '*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)';

const SORTABLE_DB_FIELDS = new Set([
  'payment_date', 'purchase_date', 'amount', 'is_paid',
  'payment_method', 'description', 'type',
]);

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
      const pageOffset = filters.offset ?? 0;

      let query = supabase
        .from('transactions')
        .select(TRANSACTION_SELECT)
        .order('payment_date', { ascending: false })
        .range(pageOffset, pageOffset + filters.limit - 1);

      if (filters.account_id) query = query.eq('account_id', filters.account_id);
      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.start_date) query = query.gte('payment_date', filters.start_date);
      if (filters.end_date) query = query.lte('payment_date', filters.end_date);
      if (filters.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);

      const { data, error } = await query;
      if (error) throw error;
      return z.array(TransactionSchema).parse(data ?? []);
    }

    let from = 0;
    const allTransactions: Transaction[] = [];

    while (true) {
      let query = supabase
        .from('transactions')
        .select(TRANSACTION_SELECT)
        .order('payment_date', { ascending: false })
        .range(from, from + TRANSACTION_MUTATION_PAGE_SIZE - 1);

      if (filters?.account_id) query = query.eq('account_id', filters.account_id);
      if (filters?.category_id) query = query.eq('category_id', filters.category_id);
      if (filters?.start_date) query = query.gte('payment_date', filters.start_date);
      if (filters?.end_date) query = query.lte('payment_date', filters.end_date);
      if (filters?.is_paid !== undefined) query = query.eq('is_paid', filters.is_paid);

      const { data, error } = await query;
      if (error) throw error;

      const page = z.array(TransactionSchema).parse(data ?? []);
      allTransactions.push(...page);

      if (page.length < TRANSACTION_MUTATION_PAGE_SIZE) break;
      from += TRANSACTION_MUTATION_PAGE_SIZE;
    }

    return allTransactions;
  },

  async getRecent(limit = 6) {
    const { data, error } = await supabase
      .from('transactions')
      .select(TRANSACTION_SELECT)
      .order('payment_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return z.array(TransactionSchema).parse(data ?? []);
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        '*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)',
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return TransactionSchema.parse(data);
  },

  async update(id: string, updates: Partial<Transaction>) {
    const { data: oldTransactionRaw, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const oldTransaction = TransactionSchema.parse(oldTransactionRaw);
    const { data: updatedRaw, error: updateError } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    const updatedTransaction = TransactionSchema.parse(updatedRaw);

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
    const { data: transactionRaw, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    const transaction = TransactionSchema.parse(transactionRaw);

    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);

    if (deleteError) throw deleteError;

    if (transaction.invoice_id) {
      await recalculateInvoiceTotal(transaction.invoice_id);
    }
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

  async getPaginated(params: TransactionsPaginatedParams) {
    const effectiveLimit = params.limit === -1 ? 10000 : params.limit;
    const dbSortField = SORTABLE_DB_FIELDS.has(params.sort_field ?? '')
      ? (params.sort_field as string)
      : 'payment_date';

    let query = supabase
      .from('transactions')
      .select(TRANSACTION_SELECT, { count: 'exact' });

    if (params.start_date) query = query.gte('payment_date', params.start_date);
    if (params.end_date) query = query.lte('payment_date', params.end_date);
    if (params.type) query = query.eq('type', params.type);
    if (params.is_paid !== undefined) query = query.eq('is_paid', params.is_paid);
    if (params.account_id) query = query.eq('account_id', params.account_id);
    if (params.card_id) query = query.eq('card_id', params.card_id);
    if (params.category_id) query = query.eq('category_id', params.category_id);
    if (params.payment_method) query = query.eq('payment_method', params.payment_method);
    if (params.search?.trim()) query = query.ilike('description', `%${params.search.trim()}%`);
    if (params.hide_credit_cards) query = query.is('card_id', null);
    else if (params.only_credit_cards) query = query.not('card_id', 'is', null);
    if (params.only_installments) query = query.not('installment_group_id', 'is', null);

    query = query
      .order(dbSortField, { ascending: params.sort_direction === 'asc' })
      .range(params.offset, params.offset + effectiveLimit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: z.array(TransactionSchema).parse(data ?? []),
      count: count ?? 0,
    };
  },

  async getSummaries(params: TransactionsSummaryParams) {
    let query = supabase
      .from('transactions')
      .select('amount, type, is_paid, card_id');

    if (params.start_date) query = query.gte('payment_date', params.start_date);
    if (params.end_date) query = query.lte('payment_date', params.end_date);
    if (params.type) query = query.eq('type', params.type);
    if (params.is_paid !== undefined) query = query.eq('is_paid', params.is_paid);
    if (params.account_id) query = query.eq('account_id', params.account_id);
    if (params.card_id) query = query.eq('card_id', params.card_id);
    if (params.category_id) query = query.eq('category_id', params.category_id);
    if (params.payment_method) query = query.eq('payment_method', params.payment_method);
    if (params.search?.trim()) query = query.ilike('description', `%${params.search.trim()}%`);
    if (params.hide_credit_cards) query = query.is('card_id', null);
    else if (params.only_credit_cards) query = query.not('card_id', 'is', null);
    if (params.only_installments) query = query.not('installment_group_id', 'is', null);

    const { data, error } = await query;
    if (error) throw error;

    const stats = (data ?? []).reduce(
      (acc, t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === 'income') {
          acc.income += amount;
        } else if (t.type === 'expense') {
          if (!t.card_id || params.only_credit_cards) acc.expense += amount;
        } else if (t.type === 'transfer') {
          acc.expense += amount;
        }
        if (!t.is_paid) acc.pending += amount;
        return acc;
      },
      { income: 0, expense: 0, pending: 0 },
    );

    return { ...stats, balance: stats.income - stats.expense };
  },
};

