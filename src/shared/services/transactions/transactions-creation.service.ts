import { supabase } from "@/lib/supabase/client";
import type { Transaction, CreateTransactionData } from "../../interfaces";
import {
  shiftDateByMonths,
  stripInstallmentSuffix,
  toDateKeyIgnoringTime,
} from "@/shared/utils/transactionsGroup.utils";
import { linkTransactionToInvoice } from "../invoice-reconciliation.service";
import { transactionsCoreService } from "./transactions-core.service";
import {
  buildSingleTransactionCreatePayload,
  normalizeToPositiveInteger,
  requireAuthenticatedUserId,
  sanitizeCreatePayload,
  syncBalance,
} from "./transactions-utils.service";

const createSingleTransaction = async (
  userId: string,
  transaction: CreateTransactionData,
) => {
  const payload = sanitizeCreatePayload({
    ...transaction,
    user_id: userId,
    is_paid: Boolean(transaction.is_paid),
    is_fixed: Boolean(transaction.is_fixed),
    recurring_group_id: transaction.is_fixed
      ? (transaction.recurring_group_id ?? null)
      : null,
  });

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  const createdTransaction = data as Transaction;
  await syncBalance(createdTransaction, "add");
  await linkTransactionToInvoice(createdTransaction);

  return createdTransaction;
};

const createInstallmentTransactions = async (
  userId: string,
  transaction: CreateTransactionData,
  totalInstallments: number,
) => {
  const installmentGroupId = crypto.randomUUID();
  const transactionsToCreate: Array<Record<string, unknown>> = [];

  for (
    let installmentIndex = 1;
    installmentIndex <= totalInstallments;
    installmentIndex += 1
  ) {
    const installmentDescription = `${transaction.description} (${installmentIndex.toString().padStart(2, "0")}/${totalInstallments.toString().padStart(2, "0")})`;
    const installmentAmount =
      transaction.installment_amounts?.[installmentIndex - 1] ??
      transaction.amount;

    transactionsToCreate.push(
      sanitizeCreatePayload({
        ...transaction,
        user_id: userId,
        description: installmentDescription,
        amount: installmentAmount,
        payment_date:
          shiftDateByMonths(transaction.payment_date, installmentIndex - 1) ??
          toDateKeyIgnoringTime(transaction.payment_date) ??
          transaction.payment_date,
        purchase_date:
          shiftDateByMonths(
            transaction.purchase_date ?? undefined,
            installmentIndex - 1,
          ) ??
          toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ??
          transaction.purchase_date ??
          undefined,
        installment_group_id: installmentGroupId,
        installment_number: installmentIndex,
        total_installments: totalInstallments,
        recurring_group_id: null,
        is_paid: false,
        is_fixed: false,
      }),
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionsToCreate)
    .select("*");

  if (error) throw error;

  const createdTransactions = (data ?? []) as Transaction[];
  for (const createdTransaction of createdTransactions) {
    await syncBalance(createdTransaction, "add");
    await linkTransactionToInvoice(createdTransaction);
  }

  return createdTransactions[0] ?? null;
};

const createRecurringTransactions = async (
  userId: string,
  transaction: CreateTransactionData,
  repeatCount: number,
) => {
  const recurringGroupId = crypto.randomUUID();
  const transactionsToCreate: Array<Record<string, unknown>> = [];

  for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
    transactionsToCreate.push(
      sanitizeCreatePayload({
        ...transaction,
        user_id: userId,
        payment_date:
          shiftDateByMonths(transaction.payment_date, repeatIndex) ??
          toDateKeyIgnoringTime(transaction.payment_date) ??
          transaction.payment_date,
        purchase_date:
          shiftDateByMonths(
            transaction.purchase_date ?? undefined,
            repeatIndex,
          ) ??
          toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ??
          transaction.purchase_date ??
          undefined,
        recurring_group_id: recurringGroupId,
        installment_group_id: null,
        installment_number: null,
        total_installments: 1,
        is_paid: false,
      }),
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionsToCreate)
    .select("*");

  if (error) throw error;

  const createdTransactions = (data ?? []) as Transaction[];
  for (const createdTransaction of createdTransactions) {
    await syncBalance(createdTransaction, "add");
    await linkTransactionToInvoice(createdTransaction);
  }

  return createdTransactions[0] ?? null;
};

export const transactionsCreationService = {
  async create(transaction: CreateTransactionData) {
    const totalInstallments = normalizeToPositiveInteger(
      transaction.total_installments ?? 1,
      1,
    );
    const repeatCount = transaction.is_fixed
      ? normalizeToPositiveInteger(transaction.repeat_count ?? 1, 1)
      : 1;
    const isInstallment =
      Boolean(transaction.is_installment) || totalInstallments > 1;
    const userId = await requireAuthenticatedUserId();

    if (isInstallment && totalInstallments > 1) {
      return await createInstallmentTransactions(
        userId,
        transaction,
        totalInstallments,
      );
    }

    if (transaction.is_fixed && repeatCount > 1) {
      return await createRecurringTransactions(
        userId,
        transaction,
        repeatCount,
      );
    }

    return await createSingleTransaction(userId, transaction);
  },

  async duplicate(id: string) {
    const transaction = await transactionsCoreService.getById(id);
    const baseDescription =
      stripInstallmentSuffix(transaction.description) ||
      transaction.description;

    const duplicatePayload = buildSingleTransactionCreatePayload(transaction, {
      description: `${baseDescription} (copia)`,
      payment_date:
        toDateKeyIgnoringTime(transaction.payment_date) ??
        transaction.payment_date,
      purchase_date:
        toDateKeyIgnoringTime(transaction.purchase_date ?? undefined) ??
        transaction.purchase_date ??
        undefined,
    });

    return await this.create(duplicatePayload);
  },
};
