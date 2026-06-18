import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { CreditCardInvoiceSchema } from '../schemas';
import { reprocessInvoicesFromDate } from './invoice-reconciliation.service';

export const invoicesService = {
  async getByCardId(cardId: string, filters?: { year?: string }) {
    const { data, error } = await supabase.rpc('get_invoices_by_card', {
      p_card_id: cardId,
      p_year: filters?.year ?? null,
    });
    if (error) throw error;
    return z.array(CreditCardInvoiceSchema).parse(data ?? []);
  },

  async getByMonthKey(cardId: string, monthKey: string) {
    const { data, error } = await supabase.rpc('get_invoice_by_month', {
      p_card_id: cardId,
      p_month_key: monthKey,
    });
    if (error && (error as { code?: string }).code !== 'PGRST116') throw error;
    return data ? CreditCardInvoiceSchema.parse(data) : null;
  },

  async reprocessInvoicesFromDate(cardId: string, fromDate: string) {
    await reprocessInvoicesFromDate(cardId, fromDate);
  },
};
