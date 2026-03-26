import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { CreditCardInvoiceSchema } from '../schemas';
import { reprocessInvoicesFromDate } from './invoice-reconciliation.service';

export const invoicesService = {
  async getByCardId(cardId: string, filters?: { year?: string }) {
    let query = supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('card_id', cardId)
      .order('month_key', { ascending: false });

    if (filters?.year) {
      query = query.gte('month_key', `${filters.year}-01`).lte('month_key', `${filters.year}-12`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return z.array(CreditCardInvoiceSchema).parse(data ?? []);
  },

  async getByMonthKey(cardId: string, monthKey: string) {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('card_id', cardId)
      .eq('month_key', monthKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? CreditCardInvoiceSchema.parse(data) : null;
  },

  async reprocessInvoicesFromDate(cardId: string, fromDate: string) {
    await reprocessInvoicesFromDate(cardId, fromDate);
  },
};
