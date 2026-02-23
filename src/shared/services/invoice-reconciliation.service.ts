import { format } from "date-fns";
import { supabase } from "@/lib/supabase/client";
import type { CreditCardStatementCycle, Transaction } from "../interfaces";
import {
  normalizeDateKey,
  resolveStatementCycleForDate,
  resolveStatementMonth,
  sortStatementCyclesAsc,
} from "@/shared/utils/card-statement-cycle.utils";

type StatementCycleLike = Pick<
  CreditCardStatementCycle,
  "date_start" | "date_end" | "closing_day" | "due_day"
>;

type StatementCycleFallback = {
  closing_day: number;
  due_day: number;
};

type InvoiceTransaction = Pick<
  Transaction,
  | "id"
  | "user_id"
  | "card_id"
  | "invoice_id"
  | "amount"
  | "type"
  | "is_paid"
  | "payment_date"
  | "purchase_date"
>;

const requireAuthenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  if (!data.user) {
    throw new Error("Not authenticated");
  }

  return data.user.id;
};

const buildClosingAndDueDate = (
  monthKey: string,
  closingDayInput: number,
  dueDayInput: number,
) => {
  const baseDate = new Date(`${monthKey}-01T12:00:00`);
  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(`Invalid month_key: ${monthKey}`);
  }

  const dueYear = baseDate.getFullYear();
  const dueMonth = baseDate.getMonth();
  const closingDay = Math.max(1, Number(closingDayInput));
  const dueDay = Math.max(1, Number(dueDayInput));

  const lastDayDue = new Date(dueYear, dueMonth + 1, 0).getDate();
  const clampedDue = Math.min(dueDay, lastDayDue);
  const dueDate = format(new Date(dueYear, dueMonth, clampedDue), "yyyy-MM-dd");

  const closingBase =
    closingDay >= dueDay
      ? new Date(dueYear, dueMonth - 1, 1)
      : new Date(dueYear, dueMonth, 1);

  const closingYear = closingBase.getFullYear();
  const closingMonth = closingBase.getMonth();
  const lastDayClosing = new Date(closingYear, closingMonth + 1, 0).getDate();
  const clampedClosing = Math.min(closingDay, lastDayClosing);
  const closingDate = format(
    new Date(closingYear, closingMonth, clampedClosing),
    "yyyy-MM-dd",
  );

  return { closingDate, dueDate };
};

const getFallbackCycleForDate = (
  cycles: StatementCycleLike[],
  referenceDate: string,
  fallback: StatementCycleFallback,
) => {
  const cycleForReference = resolveStatementCycleForDate(cycles, referenceDate);
  if (cycleForReference) {
    return {
      closing_day: Number(cycleForReference.closing_day),
      due_day: Number(cycleForReference.due_day),
    };
  }

  const ordered = sortStatementCyclesAsc(cycles);
  const openCycle = ordered.find((cycle) => cycle.date_end === "9999-12-31");
  if (!openCycle) return fallback;

  return {
    closing_day: Number(openCycle.closing_day),
    due_day: Number(openCycle.due_day),
  };
};

const toUniqueInvoiceIds = (
  transactions: Array<{ invoice_id?: string | null }>,
) =>
  Array.from(
    new Set(
      transactions
        .map((transaction) => transaction.invoice_id)
        .filter(Boolean) as string[],
    ),
  );

export const recalculateInvoiceTotal = async (invoiceId: string) => {
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type, is_paid")
    .eq("invoice_id", invoiceId);

  let totalAmount = 0;
  let paidAmount = 0;

  for (const transaction of transactions ?? []) {
    const amount = Number(transaction.amount) || 0;
    const effectiveAmount = transaction.type === "income" ? -amount : amount;
    totalAmount += effectiveAmount;
    if (transaction.is_paid) paidAmount += effectiveAmount;
  }

  let status: "open" | "partial" | "paid" = "open";
  if (paidAmount >= totalAmount && totalAmount > 0) {
    status = "paid";
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    status = "partial";
  }

  const { error } = await supabase
    .from("credit_card_invoices")
    .update({
      total_amount: totalAmount,
      paid_amount: paidAmount,
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", invoiceId);

  if (error) throw error;
};

export const linkTransactionToInvoice = async (
  transaction: InvoiceTransaction,
) => {
  if (!transaction.card_id) return;

  const { data: card, error: cardError } = await supabase
    .from("credit_cards")
    .select("closing_day, due_day")
    .eq("id", transaction.card_id)
    .single();

  if (cardError || !card) {
    throw cardError ?? new Error("Card not found");
  }

  const { data: cyclesRaw, error: cyclesError } = await supabase
    .from("credit_card_statement_cycles")
    .select("*")
    .eq("card_id", transaction.card_id)
    .order("date_start", { ascending: true });

  if (cyclesError) throw cyclesError;

  const resolved = resolveStatementMonth(
    {
      purchase_date: transaction.purchase_date,
      payment_date: transaction.payment_date,
    },
    (cyclesRaw ?? []) as StatementCycleLike[],
    { closing_day: Number(card.closing_day), due_day: Number(card.due_day) },
  );

  if (!resolved) return;

  const monthKey = resolved.statementMonthKey;
  const cycle = resolved.cycle;

  const { data: existingInvoice, error: findError } = await supabase
    .from("credit_card_invoices")
    .select("*")
    .eq("card_id", transaction.card_id)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (findError) throw findError;

  let invoice = existingInvoice;
  if (!invoice) {
    const { closingDate, dueDate } = buildClosingAndDueDate(
      monthKey,
      Number(cycle.closing_day),
      Number(cycle.due_day),
    );

    const { data: createdInvoice, error: createError } = await supabase
      .from("credit_card_invoices")
      .insert({
        user_id: transaction.user_id,
        card_id: transaction.card_id,
        month_key: monthKey,
        closing_date: closingDate,
        due_date: dueDate,
      })
      .select("*")
      .single();

    if (createError) throw createError;
    invoice = createdInvoice;
  }

  if (!invoice) return;

  const { error: updateError } = await supabase
    .from("transactions")
    .update({ invoice_id: invoice.id })
    .eq("id", transaction.id);

  if (updateError) throw updateError;

  await recalculateInvoiceTotal(invoice.id);
};

export const reprocessInvoicesFromDate = async (
  cardId: string,
  fromDateInput: string,
) => {
  const normalizedFromDate = normalizeDateKey(fromDateInput);
  const userId = await requireAuthenticatedUserId();

  const [
    { data: cardData, error: cardError },
    { data: cyclesRaw, error: cyclesError },
    { data: transactionsRaw, error: txError },
    { data: existingInvoicesRaw, error: invoicesError },
  ] = await Promise.all([
    supabase
      .from("credit_cards")
      .select("closing_day, due_day")
      .eq("id", cardId)
      .single(),
    supabase
      .from("credit_card_statement_cycles")
      .select("*")
      .eq("card_id", cardId)
      .order("date_start", { ascending: true }),
    supabase
      .from("transactions")
      .select(
        "id, user_id, card_id, amount, type, is_paid, payment_date, purchase_date, invoice_id",
      )
      .eq("card_id", cardId)
      .or(
        `payment_date.gte.${normalizedFromDate},purchase_date.gte.${normalizedFromDate}`,
      ),
    supabase.from("credit_card_invoices").select("*").eq("card_id", cardId),
  ]);

  if (cardError) throw cardError;
  if (cyclesError) throw cyclesError;
  if (txError) throw txError;
  if (invoicesError) throw invoicesError;

  if (!cardData) return;

  const transactions = (transactionsRaw ?? []) as InvoiceTransaction[];
  if (transactions.length === 0) return;

  const cycles = (cyclesRaw ?? []) as StatementCycleLike[];
  const fallbackCycle = getFallbackCycleForDate(cycles, normalizedFromDate, {
    closing_day: Number(cardData.closing_day),
    due_day: Number(cardData.due_day),
  });

  const invoicesByMonthKey = new Map<string, Record<string, unknown>>();
  for (const invoice of existingInvoicesRaw ?? []) {
    invoicesByMonthKey.set(
      String(invoice.month_key),
      invoice as Record<string, unknown>,
    );
  }

  const txToMonthKey = new Map<string, string>();
  const neededInvoicesByMonthKey = new Map<
    string,
    { closing_day: number; due_day: number }
  >();

  for (const transaction of transactions) {
    const resolved = resolveStatementMonth(
      {
        purchase_date: transaction.purchase_date,
        payment_date: transaction.payment_date,
      },
      cycles,
      fallbackCycle,
    );

    if (!resolved) continue;

    txToMonthKey.set(transaction.id, resolved.statementMonthKey);

    if (
      !invoicesByMonthKey.has(resolved.statementMonthKey) &&
      !neededInvoicesByMonthKey.has(resolved.statementMonthKey)
    ) {
      neededInvoicesByMonthKey.set(resolved.statementMonthKey, {
        closing_day: Number(resolved.cycle.closing_day),
        due_day: Number(resolved.cycle.due_day),
      });
    }
  }

  for (const [monthKey, cycle] of neededInvoicesByMonthKey.entries()) {
    const { closingDate, dueDate } = buildClosingAndDueDate(
      monthKey,
      cycle.closing_day,
      cycle.due_day,
    );

    const { data: createdInvoice, error: createError } = await supabase
      .from("credit_card_invoices")
      .insert({
        user_id: userId,
        card_id: cardId,
        month_key: monthKey,
        closing_date: closingDate,
        due_date: dueDate,
      })
      .select("*")
      .single();

    if (createError) throw createError;
    if (createdInvoice)
      invoicesByMonthKey.set(
        monthKey,
        createdInvoice as Record<string, unknown>,
      );
  }

  const affectedInvoiceIds = new Set<string>();
  const transactionIdsByInvoiceId = new Map<string, string[]>();

  for (const transaction of transactions) {
    const targetMonthKey = txToMonthKey.get(transaction.id);
    if (!targetMonthKey) continue;

    const targetInvoice = invoicesByMonthKey.get(targetMonthKey);
    if (!targetInvoice) continue;

    const targetInvoiceId = String(targetInvoice.id);
    if (transaction.invoice_id === targetInvoiceId) continue;

    if (transaction.invoice_id) affectedInvoiceIds.add(transaction.invoice_id);
    affectedInvoiceIds.add(targetInvoiceId);

    const bucket = transactionIdsByInvoiceId.get(targetInvoiceId) ?? [];
    bucket.push(transaction.id);
    transactionIdsByInvoiceId.set(targetInvoiceId, bucket);
  }

  for (const [
    invoiceId,
    transactionIds,
  ] of transactionIdsByInvoiceId.entries()) {
    const { error } = await supabase
      .from("transactions")
      .update({ invoice_id: invoiceId })
      .in("id", transactionIds);

    if (error) throw error;
  }

  await Promise.all(
    Array.from(affectedInvoiceIds).map((invoiceId) =>
      recalculateInvoiceTotal(invoiceId),
    ),
  );

  const existingInvoices = (existingInvoicesRaw ?? []) as Array<{ id: string }>;
  const invoiceIds = existingInvoices.map((invoice) => invoice.id);
  if (invoiceIds.length === 0) return;

  const { data: invoicesWithTransactions, error: usageError } = await supabase
    .from("transactions")
    .select("invoice_id")
    .in("invoice_id", invoiceIds);

  if (usageError) throw usageError;

  const usedInvoiceIds = new Set(
    (invoicesWithTransactions ?? [])
      .map((row) => row.invoice_id as string | null)
      .filter(Boolean) as string[],
  );
  const emptyInvoiceIds = invoiceIds.filter(
    (invoiceId) => !usedInvoiceIds.has(invoiceId),
  );

  if (emptyInvoiceIds.length > 0) {
    const { error } = await supabase
      .from("credit_card_invoices")
      .delete()
      .in("id", emptyInvoiceIds);

    if (error) throw error;
  }
};

export const recalculateInvoicesForTransactions = async (
  transactions: Array<{ invoice_id?: string | null }>,
) => {
  const invoiceIds = toUniqueInvoiceIds(transactions);
  await Promise.all(
    invoiceIds.map((invoiceId) => recalculateInvoiceTotal(invoiceId)),
  );
};
