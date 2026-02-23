import { supabase } from "@/lib/supabase/client";
import type { Transaction, CreateTransactionData } from "../../interfaces";
import {
  replaceDateDayPreservingMonth,
  toDateKeyIgnoringTime,
} from "@/shared/utils/transactionsGroup.utils";
import {
  linkTransactionToInvoice,
  recalculateInvoiceTotal,
  recalculateInvoicesForTransactions,
} from "../invoice-reconciliation.service";
import { transactionsCoreService } from "./transactions-core.service";
import { transactionsCreationService } from "./transactions-creation.service";
import { getTransactionAnchorDateKey } from "@/shared/utils/card-statement-cycle.utils";
import {
  normalizeTargetDay,
  normalizeToPositiveInteger,
  requireAuthenticatedUserId,
  sanitizeCreatePayload,
  sanitizeIds,
  syncBalance,
} from "./transactions-utils.service";

export const transactionsBatchService = {
  async batchCreate(transactions: Partial<Transaction>[]) {
    const createPayloads = transactions.map(
      (transaction) => transaction as CreateTransactionData,
    );
    if (createPayloads.length === 0) return [];

    const hasComplexRules = createPayloads.some((transaction) => {
      const totalInstallments = normalizeToPositiveInteger(
        transaction.total_installments ?? 1,
        1,
      );
      const repeatCount = normalizeToPositiveInteger(
        transaction.repeat_count ?? 1,
        1,
      );
      return (
        Boolean(transaction.is_installment) ||
        totalInstallments > 1 ||
        (transaction.is_fixed && repeatCount > 1)
      );
    });

    if (hasComplexRules) {
      return await Promise.all(
        createPayloads.map((transaction) =>
          transactionsCreationService.create(transaction),
        ),
      );
    }

    const userId = await requireAuthenticatedUserId();
    const rowsToInsert = createPayloads.map((transaction) =>
      sanitizeCreatePayload({
        ...transaction,
        user_id: userId,
        is_paid: Boolean(transaction.is_paid),
        is_fixed: Boolean(transaction.is_fixed),
        recurring_group_id: transaction.is_fixed
          ? (transaction.recurring_group_id ?? null)
          : null,
        installment_group_id: transaction.installment_group_id ?? null,
        installment_number: transaction.installment_number ?? null,
        total_installments: transaction.total_installments ?? 1,
      }),
    );

    const { data, error } = await supabase
      .from("transactions")
      .insert(rowsToInsert)
      .select("*");

    if (error) throw error;

    const createdTransactions = (data ?? []) as Transaction[];
    for (const createdTransaction of createdTransactions) {
      await syncBalance(createdTransaction, "add");
      await linkTransactionToInvoice(createdTransaction);
    }

    return createdTransactions;
  },

  async batchPay(ids: string[], accountId: string, paymentDate: string) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const { data: previousTransactionsRaw, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .in("id", safeIds);

    if (fetchError) throw fetchError;

    const { data: updatedTransactionsRaw, error: updateError } = await supabase
      .from("transactions")
      .update({
        is_paid: true,
        payment_date: paymentDate,
        account_id: accountId,
        updated_at: new Date().toISOString(),
      })
      .in("id", safeIds)
      .select("*");

    if (updateError) throw updateError;

    const previousTransactions = (previousTransactionsRaw ??
      []) as Transaction[];
    const updatedTransactions = (updatedTransactionsRaw ?? []) as Transaction[];

    for (const transaction of previousTransactions) {
      await syncBalance(transaction, "remove");
    }
    for (const transaction of updatedTransactions) {
      await syncBalance(transaction, "add");
    }

    await recalculateInvoicesForTransactions([
      ...previousTransactions,
      ...updatedTransactions,
    ]);
    return updatedTransactions;
  },

  async batchUnpay(ids: string[]) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const { data: previousTransactionsRaw, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .in("id", safeIds);

    if (fetchError) throw fetchError;

    const { data: updatedTransactionsRaw, error: updateError } = await supabase
      .from("transactions")
      .update({
        is_paid: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", safeIds)
      .select("*");

    if (updateError) throw updateError;

    const previousTransactions = (previousTransactionsRaw ??
      []) as Transaction[];
    const updatedTransactions = (updatedTransactionsRaw ?? []) as Transaction[];

    for (const transaction of previousTransactions) {
      await syncBalance(transaction, "remove");
    }

    await recalculateInvoicesForTransactions([
      ...previousTransactions,
      ...updatedTransactions,
    ]);
    return updatedTransactions;
  },

  async batchDelete(ids: string[]) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return;

    const { data: transactionsRaw, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .in("id", safeIds);

    if (fetchError) throw fetchError;

    const transactions = (transactionsRaw ?? []) as Transaction[];
    for (const transaction of transactions) {
      await syncBalance(transaction, "remove");
    }

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .in("id", safeIds);

    if (deleteError) throw deleteError;

    await recalculateInvoicesForTransactions(transactions);
  },

  async batchChangeDay(ids: string[], day: number) {
    const safeIds = sanitizeIds(ids);
    if (safeIds.length === 0) return [];

    const targetDay = normalizeTargetDay(day);
    const { data: transactionsRaw, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .in("id", safeIds);

    if (fetchError) throw fetchError;

    const transactions = (transactionsRaw ?? []) as Transaction[];
    if (transactions.length === 0) return [];

    const updatesById = new Map<
      string,
      { payment_date?: string; purchase_date?: string }
    >();

    for (const transaction of transactions) {
      const updates: { payment_date?: string; purchase_date?: string } = {};

      const currentPaymentDate = toDateKeyIgnoringTime(
        transaction.payment_date,
      );
      const currentPurchaseDate = toDateKeyIgnoringTime(
        transaction.purchase_date,
      );
      const nextPaymentDate = replaceDateDayPreservingMonth(
        transaction.payment_date,
        targetDay,
      );
      const nextPurchaseDate = replaceDateDayPreservingMonth(
        transaction.purchase_date,
        targetDay,
      );

      if (
        currentPaymentDate &&
        nextPaymentDate &&
        nextPaymentDate !== currentPaymentDate
      ) {
        updates.payment_date = nextPaymentDate;
      }

      if (
        currentPurchaseDate &&
        nextPurchaseDate &&
        nextPurchaseDate !== currentPurchaseDate
      ) {
        updates.purchase_date = nextPurchaseDate;
      }

      if (Object.keys(updates).length > 0) {
        updatesById.set(transaction.id, updates);
      }
    }

    if (updatesById.size === 0) return [];

    const previousTransactionsById = new Map(
      transactions.map((transaction) => [transaction.id, transaction]),
    );
    const updatedTransactions: Transaction[] = [];

    for (const [transactionId, updates] of updatesById.entries()) {
      const { data: updatedRaw, error: updateError } = await supabase
        .from("transactions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", transactionId)
        .select("*")
        .single();

      if (updateError) throw updateError;
      updatedTransactions.push(updatedRaw as Transaction);
    }

    const affectedOldInvoiceIds = new Set<string>();

    for (const updatedTransaction of updatedTransactions) {
      const previousTransaction = previousTransactionsById.get(
        updatedTransaction.id,
      );
      if (!previousTransaction) continue;

      const previousAnchorDateKey =
        getTransactionAnchorDateKey(previousTransaction);
      const nextAnchorDateKey = getTransactionAnchorDateKey(updatedTransaction);
      const anchorDateChanged = previousAnchorDateKey !== nextAnchorDateKey;
      const cardChanged =
        previousTransaction.card_id !== updatedTransaction.card_id;

      if (!anchorDateChanged && !cardChanged) continue;

      if (previousTransaction.invoice_id) {
        const { error: clearInvoiceError } = await supabase
          .from("transactions")
          .update({ invoice_id: null })
          .eq("id", updatedTransaction.id);

        if (clearInvoiceError) throw clearInvoiceError;
        affectedOldInvoiceIds.add(previousTransaction.invoice_id);
        updatedTransaction.invoice_id = null;
      }

      await linkTransactionToInvoice(updatedTransaction);
    }

    await Promise.all(
      Array.from(affectedOldInvoiceIds).map((invoiceId) =>
        recalculateInvoiceTotal(invoiceId),
      ),
    );
    return updatedTransactions;
  },

  async payBill(
    _cardId: string,
    transactionIds: string[],
    accountId: string,
    paymentDate: string,
    amount: number,
    description: string,
  ) {
    // Keep cardId in signature for backward compatibility with current UI contract.
    const normalizedDescription = description.startsWith("Pgto Fatura:")
      ? description
      : `Pgto Fatura: ${description}`;

    const { data: existingPayment } = await supabase
      .from("transactions")
      .select("id")
      .eq("description", normalizedDescription)
      .eq("payment_method", "bill_payment")
      .limit(1)
      .maybeSingle();

    if (existingPayment?.id) {
      await transactionsCoreService.update(existingPayment.id, {
        amount,
        type: "expense",
        account_id: accountId,
        payment_date: paymentDate,
        is_paid: true,
        is_fixed: false,
        card_id: null,
        invoice_id: null,
        category_id: null,
        payment_method: "bill_payment",
      } as Partial<Transaction>);
    } else {
      await transactionsCreationService.create({
        description: normalizedDescription,
        amount,
        type: "expense",
        account_id: accountId,
        payment_date: paymentDate,
        is_paid: true,
        is_fixed: false,
        card_id: null,
        invoice_id: null,
        category_id: null,
        payment_method: "bill_payment",
      } as CreateTransactionData);
    }

    await this.batchPay(transactionIds, accountId, paymentDate);
  },
};
