import { supabase } from '@/lib/supabase/client';

const toUniqueInvoiceIds = (transactions: Array<{ invoice_id?: string | null }>) =>
  Array.from(
    new Set(transactions.map((transaction) => transaction.invoice_id).filter(Boolean) as string[]),
  );

export const recalculateInvoiceTotal = async (invoiceId: string) => {
  const { error } = await supabase.rpc('recalculate_invoice_total', {
    p_invoice_id: invoiceId,
  });
  if (error) throw error;
};

export const linkTransactionToInvoice = async () => {};

export const reprocessInvoicesFromDate = async (cardId: string, fromDateInput: string) => {
  const fromDate = fromDateInput.slice(0, 10);

  const { error } = await supabase.rpc('reprocess_invoices_for_card', {
    p_card_id: cardId,
    p_from_date: fromDate,
  });

  if (error) throw error;
};

export const recalculateInvoicesForTransactions = async (
  transactions: Array<{ invoice_id?: string | null }>,
) => {
  const invoiceIds = toUniqueInvoiceIds(transactions);
  await Promise.all(invoiceIds.map((invoiceId) => recalculateInvoiceTotal(invoiceId)));
};
