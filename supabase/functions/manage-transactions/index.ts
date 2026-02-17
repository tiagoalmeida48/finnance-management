/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { addMonths, format, isValid, parseISO, startOfMonth } from 'npm:date-fns';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type StatementCycleLike = {
  date_start: string;
  date_end: string;
  closing_day: number;
  due_day: number;
};

type StatementCycleFallback = {
  closing_day: number;
  due_day: number;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { action, payload } = await req.json();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return jsonResponse({ error: 'Not authenticated' }, 401);

    if (action === 'create') return await handleCreate(supabaseClient, user, payload);
    if (action === 'update') return await handleUpdate(supabaseClient, payload);
    if (action === 'delete') return await handleDelete(supabaseClient, payload);
    if (action === 'delete-group') return await handleDeleteGroup(supabaseClient, payload);
    if (action === 'batch-pay') return await handleBatchPay(supabaseClient, payload);
    if (action === 'batch-unpay') return await handleBatchUnpay(supabaseClient, payload);
    if (action === 'batch-change-day') return await handleBatchChangeDay(supabaseClient, payload);

    return jsonResponse({ error: 'Action not found' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Not authenticated' ? 401 : 400;
    return jsonResponse({ error: message }, status);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

async function handleCreate(supabase: any, user: any, transactionData: any) {
  const { is_installment, total_installments, is_fixed, repeat_count } = transactionData;

  const parsedTotalInstallments = Number(total_installments ?? 1);
  const finalTotalInstallments = Number.isFinite(parsedTotalInstallments)
    ? Math.max(1, Math.trunc(parsedTotalInstallments))
    : 1;

  const finalRepeatCount = is_fixed ? Number(repeat_count ?? 1) : 1;
  const isActuallyInstallment = Boolean(is_installment) || finalTotalInstallments > 1;

  let result;
  if (isActuallyInstallment && finalTotalInstallments > 1) {
    result = await createInstallmentTransactions(supabase, user, transactionData, finalTotalInstallments);
  } else if (is_fixed && finalRepeatCount > 1) {
    result = await createRecurringTransactions(supabase, user, transactionData, finalRepeatCount);
  } else {
    result = await createSingleTransaction(supabase, user, transactionData);
  }

  return jsonResponse(result);
}

async function handleUpdate(supabase: any, payload: any) {
  const { id, updates } = payload;

  const { data: oldTransaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { data: updated, error } = await supabase
    .from('transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await syncBalance(supabase, oldTransaction, 'remove');
  await syncBalance(supabase, updated, 'add');

  const oldAnchorDateKey = getTransactionAnchorDateKey(oldTransaction);
  const newAnchorDateKey = getTransactionAnchorDateKey(updated);
  const anchorDateChanged = oldAnchorDateKey !== newAnchorDateKey;
  const cardChanged = oldTransaction.card_id !== updated.card_id;

  if (cardChanged || anchorDateChanged) {
    if (oldTransaction.invoice_id) {
      await supabase.from('transactions').update({ invoice_id: null }).eq('id', id);
      await recalculateInvoiceTotal(supabase, oldTransaction.invoice_id);
    }

    await linkTransactionToInvoice(supabase, updated);
  } else if (
    updated.invoice_id &&
    (
      Number(oldTransaction.amount) !== Number(updated.amount) ||
      oldTransaction.type !== updated.type ||
      Boolean(oldTransaction.is_paid) !== Boolean(updated.is_paid)
    )
  ) {
    await recalculateInvoiceTotal(supabase, updated.invoice_id);
  }

  return jsonResponse(updated);
}

async function handleDelete(supabase: any, payload: any) {
  const { id } = payload;

  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  await syncBalance(supabase, transaction, 'remove');

  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;

  if (transaction.invoice_id) {
    await recalculateInvoiceTotal(supabase, transaction.invoice_id);
  }

  return jsonResponse({ success: true });
}

async function handleDeleteGroup(supabase: any, payload: any) {
  const { groupId, type } = payload;
  const column = type === 'installment' ? 'installment_group_id' : 'recurring_group_id';

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq(column, groupId);

  if (fetchError) throw fetchError;

  for (const transaction of (transactions ?? [])) {
    await syncBalance(supabase, transaction, 'remove');
  }

  const { error } = await supabase.from('transactions').delete().eq(column, groupId);
  if (error) throw error;

  const affectedInvoiceIds = new Set(
    (transactions ?? []).map((t: any) => t.invoice_id).filter(Boolean)
  );

  await Promise.all(Array.from(affectedInvoiceIds).map((invoiceId) => recalculateInvoiceTotal(supabase, invoiceId)));

  return jsonResponse({ success: true });
}

async function handleBatchPay(supabase: any, payload: any) {
  const { ids, accountId, paymentDate } = payload;
  const updates = { is_paid: true, payment_date: paymentDate, account_id: accountId };

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .in('id', ids);

  if (fetchError) throw fetchError;

  const { data: updatedTransactions, error } = await supabase
    .from('transactions')
    .update(updates)
    .in('id', ids)
    .select();

  if (error) throw error;

  for (const oldTx of (transactions ?? [])) {
    await syncBalance(supabase, oldTx, 'remove');
  }
  for (const newTx of (updatedTransactions ?? [])) {
    await syncBalance(supabase, newTx, 'add');
  }

  const affectedInvoiceIds = new Set(
    [...(transactions ?? []), ...(updatedTransactions ?? [])]
      .map((t: any) => t.invoice_id)
      .filter(Boolean)
  );
  await Promise.all(Array.from(affectedInvoiceIds).map((invoiceId) => recalculateInvoiceTotal(supabase, invoiceId)));

  return jsonResponse(updatedTransactions ?? []);
}

async function handleBatchUnpay(supabase: any, payload: any) {
  const { ids } = payload;

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .in('id', ids);

  if (fetchError) throw fetchError;

  const { data: updatedTransactions, error } = await supabase
    .from('transactions')
    .update({ is_paid: false })
    .in('id', ids)
    .select();

  if (error) throw error;

  for (const oldTx of (transactions ?? [])) {
    await syncBalance(supabase, oldTx, 'remove');
  }

  const affectedInvoiceIds = new Set(
    [...(transactions ?? []), ...(updatedTransactions ?? [])]
      .map((t: any) => t.invoice_id)
      .filter(Boolean)
  );
  await Promise.all(Array.from(affectedInvoiceIds).map((invoiceId) => recalculateInvoiceTotal(supabase, invoiceId)));

  return jsonResponse(updatedTransactions ?? []);
}

async function handleBatchChangeDay(supabase: any, payload: any) {
  const idsInput = Array.isArray(payload?.ids) ? payload.ids : [];
  const ids = idsInput.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
  if (ids.length === 0) return jsonResponse([]);

  const targetDay = normalizeTargetDay(payload?.day);

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .in('id', ids);

  if (fetchError) throw fetchError;
  if (!transactions || transactions.length === 0) return jsonResponse([]);

  const updatesById = new Map<string, { payment_date?: string; purchase_date?: string }>();

  for (const transaction of transactions) {
    const updates: { payment_date?: string; purchase_date?: string } = {};

    const currentPaymentDate = toDateKeyIgnoringTime(transaction.payment_date);
    const currentPurchaseDate = toDateKeyIgnoringTime(transaction.purchase_date);
    const nextPaymentDate = replaceDateDayPreservingMonth(transaction.payment_date, targetDay);
    const nextPurchaseDate = replaceDateDayPreservingMonth(transaction.purchase_date, targetDay);

    if (currentPaymentDate && nextPaymentDate && nextPaymentDate !== currentPaymentDate) {
      updates.payment_date = nextPaymentDate;
    }

    if (currentPurchaseDate && nextPurchaseDate && nextPurchaseDate !== currentPurchaseDate) {
      updates.purchase_date = nextPurchaseDate;
    }

    if (Object.keys(updates).length > 0) {
      updatesById.set(transaction.id, updates);
    }
  }

  if (updatesById.size === 0) return jsonResponse([]);

  const oldTransactionsById = new Map((transactions ?? []).map((tx: any) => [tx.id, tx]));
  const updatedTransactions: any[] = [];

  for (const [id, updates] of updatesById.entries()) {
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;
    updatedTransactions.push(updatedTransaction);
  }

  const affectedOldInvoiceIds = new Set<string>();

  for (const updatedTransaction of updatedTransactions) {
    const oldTransaction = oldTransactionsById.get(updatedTransaction.id);
    if (!oldTransaction) continue;

    const oldAnchorDateKey = getTransactionAnchorDateKey(oldTransaction);
    const newAnchorDateKey = getTransactionAnchorDateKey(updatedTransaction);
    const anchorDateChanged = oldAnchorDateKey !== newAnchorDateKey;
    const cardChanged = oldTransaction.card_id !== updatedTransaction.card_id;

    if (!anchorDateChanged && !cardChanged) continue;

    if (oldTransaction.invoice_id) {
      const { error: clearInvoiceError } = await supabase
        .from('transactions')
        .update({ invoice_id: null })
        .eq('id', updatedTransaction.id);

      if (clearInvoiceError) throw clearInvoiceError;
      affectedOldInvoiceIds.add(oldTransaction.invoice_id);
    }

    await linkTransactionToInvoice(supabase, updatedTransaction);
  }

  await Promise.all(Array.from(affectedOldInvoiceIds).map((invoiceId) => recalculateInvoiceTotal(supabase, invoiceId)));

  return jsonResponse(updatedTransactions);
}

async function createSingleTransaction(supabase: any, user: any, data: any) {
  const payload = sanitizePayload({
    ...data,
    user_id: user.id,
    is_paid: Boolean(data.is_paid),
  });

  if (!payload.is_fixed) payload.recurring_group_id = null;
  delete payload.installment_amounts;
  delete payload.repeat_count;
  delete payload.is_installment;

  const { data: created, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  await syncBalance(supabase, created, 'add');
  await linkTransactionToInvoice(supabase, created);

  return created;
}

async function createInstallmentTransactions(
  supabase: any,
  user: any,
  transaction: any,
  totalInstallments: number
) {
  const installmentGroupId = crypto.randomUUID();
  const transactionsToCreate = [];

  for (let i = 1; i <= totalInstallments; i++) {
    const installmentDescription = `${transaction.description} (${i.toString().padStart(2, '0')}/${totalInstallments.toString().padStart(2, '0')})`;
    const currentAmount = transaction.installment_amounts?.[i - 1] ?? transaction.amount;

    const payload = sanitizePayload({
      ...transaction,
      user_id: user.id,
      description: installmentDescription,
      amount: currentAmount,
      payment_date: shiftDateKey(transaction.payment_date, i - 1),
      purchase_date: shiftDateKey(transaction.purchase_date, i - 1),
      recurring_group_id: null,
      installment_group_id: installmentGroupId,
      installment_number: i,
      total_installments: totalInstallments,
      is_paid: false,
    });

    delete payload.installment_amounts;
    delete payload.repeat_count;
    delete payload.is_installment;

    transactionsToCreate.push(payload);
  }

  const { data, error } = await supabase.from('transactions').insert(transactionsToCreate).select();
  if (error) throw error;

  for (const item of (data ?? [])) {
    await syncBalance(supabase, item, 'add');
    await linkTransactionToInvoice(supabase, item);
  }

  return data?.[0] ?? null;
}

async function createRecurringTransactions(
  supabase: any,
  user: any,
  transaction: any,
  repeatCount: number
) {
  const recurringGroupId = crypto.randomUUID();
  const transactionsToCreate = [];

  for (let i = 0; i < repeatCount; i++) {
    const payload = sanitizePayload({
      ...transaction,
      user_id: user.id,
      payment_date: shiftDateKey(transaction.payment_date, i),
      purchase_date: shiftDateKey(transaction.purchase_date, i),
      recurring_group_id: recurringGroupId,
      is_paid: false,
    });

    delete payload.installment_amounts;
    delete payload.repeat_count;
    delete payload.is_installment;

    transactionsToCreate.push(payload);
  }

  const { data, error } = await supabase.from('transactions').insert(transactionsToCreate).select();
  if (error) throw error;

  for (const item of (data ?? [])) {
    await syncBalance(supabase, item, 'add');
    await linkTransactionToInvoice(supabase, item);
  }

  return data?.[0] ?? null;
}

function sanitizePayload(data: any) {
  const uuidFields = ['category_id', 'account_id', 'to_account_id', 'card_id', 'installment_group_id', 'recurring_group_id'];
  const sanitized = { ...data };

  for (const field of uuidFields) {
    if (sanitized[field] === '') sanitized[field] = null;
  }

  return sanitized;
}

async function syncBalance(supabase: any, transaction: any, action: 'add' | 'remove') {
  if (!transaction?.account_id) return;
  if (!transaction?.is_paid) return;

  const multiplier = action === 'add' ? 1 : -1;
  const amount = Number(transaction.amount) || 0;
  let delta = 0;

  if (transaction.type === 'income') {
    delta = amount * multiplier;
  } else if (transaction.type === 'expense') {
    delta = -amount * multiplier;
  } else if (transaction.type === 'transfer') {
    delta = -amount * multiplier;

    if (transaction.to_account_id) {
      await adjustBalance(supabase, transaction.to_account_id, amount * multiplier);
    }
  }

  if (delta !== 0) {
    await adjustBalance(supabase, transaction.account_id, delta);
  }
}

async function adjustBalance(supabase: any, accountId: string, delta: number) {
  const { error } = await supabase.rpc('increment_account_balance', {
    p_account_id: accountId,
    p_amount: delta,
  });

  if (error) {
    console.error('Error adjusting balance:', error);
  }
}

async function linkTransactionToInvoice(supabase: any, transaction: any) {
  if (!transaction?.card_id) return;

  const { data: card, error: cardError } = await supabase
    .from('credit_cards')
    .select('closing_day, due_day')
    .eq('id', transaction.card_id)
    .single();

  if (cardError || !card) throw cardError ?? new Error('Card not found');

  const { data: cycles, error: cyclesError } = await supabase
    .from('credit_card_statement_cycles')
    .select('*')
    .eq('card_id', transaction.card_id)
    .order('date_start', { ascending: true });

  if (cyclesError) throw cyclesError;

  const resolved = resolveStatementMonth(
    transaction,
    (cycles ?? []) as StatementCycleLike[],
    { closing_day: Number(card.closing_day), due_day: Number(card.due_day) }
  );

  if (!resolved) return;

  const monthKey = resolved.statementMonthKey;
  const cycle = resolved.cycle;

  const { data: existingInvoice, error: findError } = await supabase
    .from('credit_card_invoices')
    .select('*')
    .eq('card_id', transaction.card_id)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (findError) throw findError;

  let invoice = existingInvoice;
  if (!invoice) {
    const { closingDate, dueDate } = buildClosingAndDueDate(
      monthKey,
      Number(cycle.closing_day),
      Number(cycle.due_day)
    );

    const { data: createdInvoice, error: createError } = await supabase
      .from('credit_card_invoices')
      .insert({
        user_id: transaction.user_id,
        card_id: transaction.card_id,
        month_key: monthKey,
        closing_date: closingDate,
        due_date: dueDate,
      })
      .select()
      .single();

    if (createError) throw createError;
    invoice = createdInvoice;
  }

  if (!invoice) return;

  await supabase
    .from('transactions')
    .update({ invoice_id: invoice.id })
    .eq('id', transaction.id);

  await recalculateInvoiceTotal(supabase, invoice.id);
}

async function recalculateInvoiceTotal(supabase: any, invoiceId: string) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, is_paid')
    .eq('invoice_id', invoiceId);

  let totalAmount = 0;
  let paidAmount = 0;

  for (const tx of (transactions ?? [])) {
    const amount = Number(tx.amount) || 0;
    const effectiveAmount = tx.type === 'income' ? -amount : amount;

    totalAmount += effectiveAmount;
    if (tx.is_paid) paidAmount += effectiveAmount;
  }

  let status = 'open';
  if (paidAmount >= totalAmount && totalAmount > 0) {
    status = 'paid';
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    status = 'partial';
  }

  await supabase
    .from('credit_card_invoices')
    .update({
      total_amount: totalAmount,
      paid_amount: paidAmount,
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', invoiceId);
}

function toDateKeyIgnoringTime(value?: string | null) {
  if (!value) return null;

  const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDateMatch) return directDateMatch[1];

  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;

  return format(parsed, 'yyyy-MM-dd');
}

function normalizeTargetDay(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
    throw new Error('Dia inválido. Use um valor entre 1 e 31.');
  }

  return parsed;
}

function replaceDateDayPreservingMonth(value: string | null | undefined, targetDay: number) {
  const dateKey = toDateKeyIgnoringTime(value);
  if (!dateKey) return null;

  const [yearRaw, monthRaw] = dateKey.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  const maxDay = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(targetDay, maxDay);

  return `${yearRaw}-${monthRaw}-${clampedDay.toString().padStart(2, '0')}`;
}

function getTransactionAnchorDateKey(transaction: { purchase_date?: string | null; payment_date?: string | null }) {
  return toDateKeyIgnoringTime(transaction.purchase_date)
    || toDateKeyIgnoringTime(transaction.payment_date)
    || null;
}

function sortStatementCyclesAsc(cycles: StatementCycleLike[]) {
  return [...cycles].sort((a, b) => a.date_start.localeCompare(b.date_start));
}

function resolveStatementCycleForDate(cycles: StatementCycleLike[], dateKey: string) {
  const ordered = sortStatementCyclesAsc(cycles);
  return ordered.find((cycle) => dateKey >= cycle.date_start && dateKey <= cycle.date_end) ?? null;
}

function resolveStatementMonth(
  transaction: { purchase_date?: string | null; payment_date?: string | null },
  cycles: StatementCycleLike[],
  fallbackCycle?: StatementCycleFallback
) {
  const anchorDateKey = getTransactionAnchorDateKey(transaction);
  if (!anchorDateKey) return null;

  const anchorDate = new Date(`${anchorDateKey}T12:00:00`);
  if (Number.isNaN(anchorDate.getTime())) return null;

  const cycle = resolveStatementCycleForDate(cycles, anchorDateKey) ?? fallbackCycle;
  if (!cycle) return null;

  const closingMonthShift = anchorDate.getDate() > Number(cycle.closing_day) ? 1 : 0;
  const dueMonthShift = Number(cycle.closing_day) >= Number(cycle.due_day) ? 1 : 0;
  const statementDate = addMonths(startOfMonth(anchorDate), closingMonthShift + dueMonthShift);
  const statementMonthKey = format(statementDate, 'yyyy-MM');

  return { statementMonthKey, cycle, anchorDateKey };
}

function buildClosingAndDueDate(monthKey: string, closingDayInput: number, dueDayInput: number) {
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
  const dueDate = format(new Date(dueYear, dueMonth, clampedDue), 'yyyy-MM-dd');

  const closingBase = closingDay >= dueDay
    ? new Date(dueYear, dueMonth - 1, 1)
    : new Date(dueYear, dueMonth, 1);

  const closingYear = closingBase.getFullYear();
  const closingMonth = closingBase.getMonth();
  const lastDayClosing = new Date(closingYear, closingMonth + 1, 0).getDate();
  const clampedClosing = Math.min(closingDay, lastDayClosing);
  const closingDate = format(new Date(closingYear, closingMonth, clampedClosing), 'yyyy-MM-dd');

  return { closingDate, dueDate };
}

function shiftDateKey(value: string | null | undefined, monthOffset: number) {
  const dateKey = toDateKeyIgnoringTime(value);
  if (!dateKey) return undefined;

  const dateAtNoon = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(dateAtNoon.getTime())) return undefined;

  return format(addMonths(dateAtNoon, monthOffset), 'yyyy-MM-dd');
}
