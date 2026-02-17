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

    if (action === 'recalculate') {
      await recalculateInvoiceTotal(supabaseClient, payload.invoiceId);
      return jsonResponse({ success: true });
    }

    if (action === 'reprocess') {
      await reprocessInvoicesFromDate(supabaseClient, user, payload.cardId, payload.fromDate);
      return jsonResponse({ success: true });
    }

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

async function reprocessInvoicesFromDate(
  supabase: any,
  user: any,
  cardId: string,
  fromDateInput: string
) {
  const normalizedFromDate = normalizeDateKey(fromDateInput);

  const [{ data: cardData, error: cardError }, { data: cycles, error: cyclesError }, { data: transactions, error: txError }, { data: existingInvoices, error: invoicesError }] = await Promise.all([
    supabase
      .from('credit_cards')
      .select('closing_day, due_day')
      .eq('id', cardId)
      .single(),
    supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('card_id', cardId)
      .order('date_start', { ascending: true }),
    supabase
      .from('transactions')
      .select('id, user_id, card_id, amount, type, is_paid, payment_date, purchase_date, invoice_id')
      .eq('card_id', cardId)
      .or(`payment_date.gte.${normalizedFromDate},purchase_date.gte.${normalizedFromDate}`),
    supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('card_id', cardId),
  ]);

  if (cardError) throw cardError;
  if (cyclesError) throw cyclesError;
  if (txError) throw txError;
  if (invoicesError) throw invoicesError;
  if (!cardData) return;
  if (!transactions || transactions.length === 0) return;

  const cycleRows = (cycles ?? []) as StatementCycleLike[];
  const fallbackCycle = getFallbackCycleForDate(
    cycleRows,
    normalizedFromDate,
    {
      closing_day: Number(cardData.closing_day),
      due_day: Number(cardData.due_day),
    }
  );

  const invoicesByMonthKey = new Map<string, any>();
  for (const invoice of (existingInvoices ?? [])) {
    invoicesByMonthKey.set(invoice.month_key, invoice);
  }

  const txToMonthKey = new Map<string, string>();
  const neededInvoicesByMonthKey = new Map<string, { closing_day: number; due_day: number }>();

  for (const tx of transactions) {
    const resolved = resolveStatementMonth(
      { purchase_date: tx.purchase_date, payment_date: tx.payment_date },
      cycleRows,
      fallbackCycle
    );

    if (!resolved) continue;

    txToMonthKey.set(tx.id, resolved.statementMonthKey);
    if (!invoicesByMonthKey.has(resolved.statementMonthKey) && !neededInvoicesByMonthKey.has(resolved.statementMonthKey)) {
      neededInvoicesByMonthKey.set(resolved.statementMonthKey, {
        closing_day: Number(resolved.cycle.closing_day),
        due_day: Number(resolved.cycle.due_day),
      });
    }
  }

  for (const [monthKey, cycle] of neededInvoicesByMonthKey.entries()) {
    const { closingDate, dueDate } = buildClosingAndDueDate(monthKey, cycle.closing_day, cycle.due_day);

    const { data: created, error: createError } = await supabase
      .from('credit_card_invoices')
      .insert({
        user_id: user.id,
        card_id: cardId,
        month_key: monthKey,
        closing_date: closingDate,
        due_date: dueDate,
      })
      .select()
      .single();

    if (createError) throw createError;
    if (created) invoicesByMonthKey.set(monthKey, created);
  }

  const affectedInvoiceIds = new Set<string>();
  const txIdsByInvoiceId = new Map<string, string[]>();

  for (const tx of transactions) {
    const targetMonthKey = txToMonthKey.get(tx.id);
    if (!targetMonthKey) continue;

    const targetInvoice = invoicesByMonthKey.get(targetMonthKey);
    if (!targetInvoice) continue;

    if (tx.invoice_id === targetInvoice.id) continue;

    if (tx.invoice_id) affectedInvoiceIds.add(tx.invoice_id);
    affectedInvoiceIds.add(targetInvoice.id);

    const batch = txIdsByInvoiceId.get(targetInvoice.id) ?? [];
    batch.push(tx.id);
    txIdsByInvoiceId.set(targetInvoice.id, batch);
  }

  for (const [invoiceId, txIds] of txIdsByInvoiceId.entries()) {
    const { error } = await supabase
      .from('transactions')
      .update({ invoice_id: invoiceId })
      .in('id', txIds);

    if (error) throw error;
  }

  await Promise.all(Array.from(affectedInvoiceIds).map((invoiceId) => recalculateInvoiceTotal(supabase, invoiceId)));

  const invoiceIds = (existingInvoices ?? []).map((invoice: any) => invoice.id);
  if (invoiceIds.length === 0) return;

  const { data: invoicesWithTransactions, error: usageError } = await supabase
    .from('transactions')
    .select('invoice_id')
    .in('invoice_id', invoiceIds);

  if (usageError) throw usageError;

  const usedInvoiceIds = new Set((invoicesWithTransactions ?? []).map((row: any) => row.invoice_id));
  const emptyInvoiceIds = invoiceIds.filter((invoiceId: string) => !usedInvoiceIds.has(invoiceId));

  if (emptyInvoiceIds.length > 0) {
    const { error } = await supabase
      .from('credit_card_invoices')
      .delete()
      .in('id', emptyInvoiceIds);

    if (error) throw error;
  }
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

function normalizeDateKey(value: string) {
  const parsed = parseISO(value);
  if (!isValid(parsed)) throw new Error('Data invalida.');
  return format(parsed, 'yyyy-MM-dd');
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

function getFallbackCycleForDate(
  cycles: StatementCycleLike[],
  referenceDate: string,
  fallback: StatementCycleFallback
) {
  const cycleForReference = resolveStatementCycleForDate(cycles, referenceDate);
  if (cycleForReference) {
    return {
      closing_day: Number(cycleForReference.closing_day),
      due_day: Number(cycleForReference.due_day),
    };
  }

  const ordered = sortStatementCyclesAsc(cycles);
  const openCycle = ordered.find((cycle) => cycle.date_end === '9999-12-31');
  if (!openCycle) return fallback;

  return {
    closing_day: Number(openCycle.closing_day),
    due_day: Number(openCycle.due_day),
  };
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
