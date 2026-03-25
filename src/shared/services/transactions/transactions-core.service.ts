import { supabase } from "@/lib/supabase/client";
import type { Transaction } from "../../interfaces";
import { getTransactionAnchorDateKey } from "@/shared/utils/card-statement-cycle.utils";
import {
  linkTransactionToInvoice,
  recalculateInvoiceTotal,
} from "../invoice-reconciliation.service";
import { TRANSACTION_MUTATION_PAGE_SIZE } from "./transactions-utils.service";

const TRANSACTION_SELECT =
  "*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)";

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
    // Single-page fetch when caller provides explicit pagination params
    if (filters?.limit !== undefined) {
      const pageOffset = filters.offset ?? 0;

      let query = supabase
        .from("transactions")
        .select(TRANSACTION_SELECT)
        .order("payment_date", { ascending: false })
        .range(pageOffset, pageOffset + filters.limit - 1);

      if (filters.account_id) query = query.eq("account_id", filters.account_id);
      if (filters.category_id) query = query.eq("category_id", filters.category_id);
      if (filters.start_date) query = query.gte("payment_date", filters.start_date);
      if (filters.end_date) query = query.lte("payment_date", filters.end_date);
      if (filters.is_paid !== undefined) query = query.eq("is_paid", filters.is_paid);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Transaction[];
    }

    // Legacy: accumulate all pages (backward compatible)
    let from = 0;
    const allTransactions: Transaction[] = [];

    while (true) {
      let query = supabase
        .from("transactions")
        .select(TRANSACTION_SELECT)
        .order("payment_date", { ascending: false })
        .range(from, from + TRANSACTION_MUTATION_PAGE_SIZE - 1);

      if (filters?.account_id)
        query = query.eq("account_id", filters.account_id);
      if (filters?.category_id)
        query = query.eq("category_id", filters.category_id);
      if (filters?.start_date)
        query = query.gte("payment_date", filters.start_date);
      if (filters?.end_date)
        query = query.lte("payment_date", filters.end_date);
      if (filters?.is_paid !== undefined)
        query = query.eq("is_paid", filters.is_paid);

      const { data, error } = await query;
      if (error) throw error;

      const page = (data ?? []) as Transaction[];
      allTransactions.push(...page);

      if (page.length < TRANSACTION_MUTATION_PAGE_SIZE) break;
      from += TRANSACTION_MUTATION_PAGE_SIZE;
    }

    return allTransactions;
  },

  async getRecent(limit = 6) {
    const { data, error } = await supabase
      .from("transactions")
      .select(TRANSACTION_SELECT)
      .order("payment_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Transaction[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, bank_account:account_id(name), to_bank_account:to_account_id(name), category:category_id(name, color, icon), credit_card:card_id(name, color)",
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async update(id: string, updates: Partial<Transaction>) {
    const { data: oldTransactionRaw, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const oldTransaction = oldTransactionRaw as Transaction;
    const { data: updatedRaw, error: updateError } = await supabase
      .from("transactions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const updatedTransaction = updatedRaw as Transaction;

    const oldAnchorDateKey = getTransactionAnchorDateKey(oldTransaction);
    const newAnchorDateKey = getTransactionAnchorDateKey(updatedTransaction);
    const anchorDateChanged = oldAnchorDateKey !== newAnchorDateKey;
    const cardChanged = oldTransaction.card_id !== updatedTransaction.card_id;

    if (cardChanged || anchorDateChanged) {
      if (oldTransaction.invoice_id) {
        const { error: clearInvoiceError } = await supabase
          .from("transactions")
          .update({ invoice_id: null })
          .eq("id", id);
        if (clearInvoiceError) throw clearInvoiceError;

        await recalculateInvoiceTotal(oldTransaction.invoice_id);
        updatedTransaction.invoice_id = null;
      }

      await linkTransactionToInvoice(updatedTransaction);
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
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    const transaction = transactionRaw as Transaction;

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    if (transaction.invoice_id) {
      await recalculateInvoiceTotal(transaction.invoice_id);
    }
  },

  async getFirstTransactionDate() {
    const { data, error } = await supabase
      .from("transactions")
      .select("payment_date")
      .order("payment_date", { ascending: true })
      .limit(1)
      .single();

    if (error) return null;
    return data?.payment_date || null;
  },
};
