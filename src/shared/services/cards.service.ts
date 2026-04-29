import { z } from 'zod';
import { format, parseISO, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import {
  CreateCreditCardInput,
  CreateCreditCardStatementCycleInput,
  CreditCard,
  CreditCardStatementCycle,
  Transaction,
  UpdateCreditCardInput,
  UpdateCreditCardStatementCycleInput,
} from '../interfaces';
import {
  CreditCardSchema,
  CreditCardInvoiceSchema,
  CreditCardStatementCycleSchema,
  TransactionSchema,
} from '../schemas';
import type { CreditCardDetails } from '../interfaces/card-details.interface';
import {
  getCurrentStatementCycle,
  normalizeDateKey,
  planCycleInsertion,
  sortStatementCyclesAsc,
<<<<<<< HEAD
=======
  OPEN_CYCLE_END,
>>>>>>> finnance-management/main
} from '@/shared/utils/card-statement-cycle.utils';
import { invoicesService } from './invoices.service';

const TRANSACTIONS_PAGE_SIZE = 1000;

const mapCyclesByCard = (cycles: CreditCardStatementCycle[]) =>
  cycles.reduce<Record<string, CreditCardStatementCycle[]>>((acc, cycle) => {
    if (!acc[cycle.card_id]) acc[cycle.card_id] = [];
    acc[cycle.card_id].push(cycle);
    return acc;
  }, {});

export const cardsService = {
  async getAll() {
<<<<<<< HEAD
    const [cards, stats] = await Promise.all([
      supabase.rpc('get_cards'),
      supabase.rpc('get_all_card_stats'),
    ]);
=======
    const { data: cards, error } = await supabase
      .from('credit_cards')
      .select('*, bank_account:bank_account_id(name)')
      .is('deleted_at', null)
      .order('name');
>>>>>>> finnance-management/main

    if (cards.error) throw cards.error;
    if (stats.error) throw stats.error;

<<<<<<< HEAD
    const allCycles: CreditCardStatementCycle[] = [];
    const cardRows = z.array(CreditCardSchema).parse(cards.data ?? []);
=======
    const { data: invoices, error: invError } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .order('month_key', { ascending: false });
>>>>>>> finnance-management/main

    await Promise.all(
      cardRows.map(async (card) => {
        const { data } = await supabase.rpc('get_cycles_by_card', { p_card_id: card.id });
        const cycles = z.array(CreditCardStatementCycleSchema).parse(data ?? []);
        allCycles.push(...cycles);
      }),
    );

<<<<<<< HEAD
=======
    const { data: cycles, error: cyclesError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .order('date_start', { ascending: true });

    if (cyclesError) throw cyclesError;

    const now = new Date();
    const currentMonthKey = format(now, 'yyyy-MM');

    const cardRows = z.array(CreditCardSchema).parse(cards ?? []);
    const allInvoices = z.array(CreditCardInvoiceSchema).parse(invoices ?? []);
    const allCycles = z.array(CreditCardStatementCycleSchema).parse(cycles ?? []);

    const invoicesByCard = mapByCard(allInvoices);
>>>>>>> finnance-management/main
    const cyclesByCard = mapCyclesByCard(allCycles);
    const statsMap = new Map(
      ((stats.data ?? []) as Array<{
        card_id: string;
        usage: number;
        current_invoice: number;
        available_limit: number;
      }>).map((s) => [s.card_id, s]),
    );

    return cardRows.map((card) => {
      const cardCycles = sortStatementCyclesAsc(cyclesByCard[card.id] ?? []);
      const currentCycle = getCurrentStatementCycle(cardCycles);
<<<<<<< HEAD
      const s = statsMap.get(card.id);
=======

      const unpaidInvoices = cardInvoices.filter((inv) => inv.status !== 'paid');
      const totalUsage = unpaidInvoices.reduce(
        (acc, inv) => acc + (Number(inv.total_amount) - Number(inv.paid_amount)),
        0,
      );

      const currentInvoiceData = cardInvoices.find((inv) => inv.month_key === currentMonthKey);
      const currentInvoice = currentInvoiceData
        ? Number(currentInvoiceData.total_amount) - Number(currentInvoiceData.paid_amount)
        : 0;

>>>>>>> finnance-management/main
      return {
        ...card,
        statement_cycles: cardCycles,
        current_statement_cycle: currentCycle,
        usage: Number(s?.usage ?? 0),
        current_invoice: Number(s?.current_invoice ?? 0),
        available_limit: Number(s?.available_limit ?? card.credit_limit),
      };
    });
  },

  async create(card: CreateCreditCardInput) {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('create_card', {
      p_bank_account_id: card.bank_account_id,
      p_name: card.name,
      p_color: card.color,
      p_credit_limit: card.credit_limit,
      p_notes: card.notes ?? null,
    });
=======
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards')
      .insert({ ...card, user_id: user.id })
      .select()
      .single();

>>>>>>> finnance-management/main
    if (error) throw error;

    const createdCard = CreditCardSchema.parse(data);
    const dateStart = format(new Date(), 'yyyy-MM-dd');

<<<<<<< HEAD
    const { data: cycleData, error: cycleError } = await supabase.rpc(
      'create_credit_card_statement_cycle',
      {
        p_card_id: createdCard.id,
        p_date_start: dateStart,
        p_closing_day: card.closing_day,
        p_due_day: card.due_day,
        p_notes: null,
      },
    );

    if (cycleError) {
      await supabase.rpc('delete_card', { p_id: createdCard.id });
      throw cycleError;
    }

    const inserted = Array.isArray(cycleData) ? cycleData[0] : cycleData;
    const createdCycle = CreditCardStatementCycleSchema.parse(inserted);
=======
    const { data: cycleData, error: cycleError } = await supabase
      .from('credit_card_statement_cycles')
      .insert({
        user_id: user.id,
        card_id: createdCard.id,
        date_start: dateStart,
        date_end: OPEN_CYCLE_END,
        closing_day: card.closing_day,
        due_day: card.due_day,
        notes: 'Vigencia inicial criada no cadastro do cartao.',
      })
      .select('*')
      .single();

    if (cycleError) {
      await supabase.from('credit_cards').delete().eq('id', createdCard.id);
      throw cycleError;
    }

    const createdCycle = CreditCardStatementCycleSchema.parse(cycleData);
>>>>>>> finnance-management/main
    return {
      ...createdCard,
      statement_cycles: [createdCycle],
      current_statement_cycle: createdCycle,
    } as CreditCard;
  },

  async update(id: string, updates: UpdateCreditCardInput) {
<<<<<<< HEAD
    if ('closing_day' in updates || 'due_day' in updates) {
=======
    const payload = { ...updates } as Record<string, unknown>;
    if ('closing_day' in payload || 'due_day' in payload) {
>>>>>>> finnance-management/main
      throw new Error(
        'Alteracoes de vencimento e fechamento devem ser feitas pelo historico de ciclo da fatura.',
      );
    }
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('update_card', {
      p_id: id,
      p_name: updates.name ?? null,
      p_color: updates.color ?? null,
      p_credit_limit: updates.credit_limit ?? null,
      p_bank_account_id: updates.bank_account_id ?? null,
      p_notes: updates.notes ?? null,
      p_is_active: updates.is_active ?? null,
    });
=======

    const { data, error } = await supabase
      .from('credit_cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

>>>>>>> finnance-management/main
    if (error) throw error;
    return CreditCardSchema.parse(data);
  },

  async delete(id: string) {
<<<<<<< HEAD
    const { error } = await supabase.rpc('delete_card', { p_id: id });
=======
    const { error } = await supabase
      .from('credit_cards')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);

>>>>>>> finnance-management/main
    if (error) throw error;
  },

  async getStatementCycles(cardId: string) {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('get_cycles_by_card', { p_card_id: cardId });
=======
    const { data, error } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('card_id', cardId)
      .order('date_start', { ascending: false });

>>>>>>> finnance-management/main
    if (error) throw error;
    return z.array(CreditCardStatementCycleSchema).parse(data ?? []);
  },

  async createStatementCycle(input: CreateCreditCardStatementCycleInput) {
    const normalizedStartDate = normalizeDateKey(input.date_start);
<<<<<<< HEAD
    const { data: existingData, error: cyclesError } = await supabase.rpc('get_cycles_by_card', {
      p_card_id: input.card_id,
    });
    if (cyclesError) throw cyclesError;

    const cycleRows = z.array(CreditCardStatementCycleSchema).parse(existingData ?? []);

    if (cycleRows.length === 0) {
      const { data, error } = await supabase.rpc('create_credit_card_statement_cycle', {
        p_card_id: input.card_id,
        p_date_start: normalizedStartDate,
        p_closing_day: input.closing_day,
        p_due_day: input.due_day,
        p_notes: input.notes?.trim() || null,
      });
      if (error) throw error;
      const inserted = Array.isArray(data) ? data[0] : data;
      return CreditCardStatementCycleSchema.parse(inserted);
=======

    const { data: existingCycles, error: cyclesError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('card_id', input.card_id)
      .order('date_start', { ascending: true });

    if (cyclesError) throw cyclesError;

    const cycleRows = z.array(CreditCardStatementCycleSchema).parse(existingCycles ?? []);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error('Not authenticated');

    if (cycleRows.length === 0) {
      const { data: seededCycle, error: seedError } = await supabase
        .from('credit_card_statement_cycles')
        .insert({
          user_id: user.id,
          card_id: input.card_id,
          date_start: normalizedStartDate,
          date_end: OPEN_CYCLE_END,
          closing_day: input.closing_day,
          due_day: input.due_day,
          notes: input.notes?.trim() ? input.notes.trim() : 'Vigencia inicial criada manualmente.',
        })
        .select('*')
        .single();

      if (seedError) throw seedError;
      return CreditCardStatementCycleSchema.parse(seededCycle);
>>>>>>> finnance-management/main
    }

    const firstCycle = cycleRows[0];

    if (normalizedStartDate < firstCycle.date_start) {
      const newEnd = format(subDays(parseISO(firstCycle.date_start), 1), 'yyyy-MM-dd');

<<<<<<< HEAD
      const { error: insertError } = await supabase.rpc('create_credit_card_statement_cycle', {
        p_card_id: input.card_id,
        p_date_start: normalizedStartDate,
        p_closing_day: input.closing_day,
        p_due_day: input.due_day,
        p_notes: input.notes?.trim() || null,
      });
      if (insertError) throw insertError;
=======
      const { data: inserted, error: insertError } = await supabase
        .from('credit_card_statement_cycles')
        .insert({
          user_id: user.id,
          card_id: input.card_id,
          date_start: normalizedStartDate,
          date_end: newEnd,
          closing_day: input.closing_day,
          due_day: input.due_day,
          notes: input.notes?.trim() ? input.notes.trim() : null,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      await invoicesService.reprocessInvoicesFromDate(input.card_id, normalizedStartDate);
      return CreditCardStatementCycleSchema.parse(inserted);
    }

    planCycleInsertion(cycleRows, normalizedStartDate);

    const { data, error } = await supabase.rpc('create_credit_card_statement_cycle', {
      p_card_id: input.card_id,
      p_date_start: normalizedStartDate,
      p_closing_day: input.closing_day,
      p_due_day: input.due_day,
      p_notes: input.notes?.trim() ? input.notes.trim() : null,
    });
>>>>>>> finnance-management/main

      await supabase.rpc('update_cycle_date_end', {
        p_id: firstCycle.id,
        p_date_end: newEnd,
      });

      await invoicesService.reprocessInvoicesFromDate(input.card_id, normalizedStartDate);

      const { data: freshData } = await supabase.rpc('get_cycles_by_card', {
        p_card_id: input.card_id,
      });
      const fresh = z.array(CreditCardStatementCycleSchema).parse(freshData ?? []);
      return fresh.find((c) => c.date_start === normalizedStartDate)!;
    }

    planCycleInsertion(cycleRows, normalizedStartDate);

    const { data, error } = await supabase.rpc('create_credit_card_statement_cycle', {
      p_card_id: input.card_id,
      p_date_start: normalizedStartDate,
      p_closing_day: input.closing_day,
      p_due_day: input.due_day,
      p_notes: input.notes?.trim() || null,
    });
    if (error) throw error;

    const inserted = Array.isArray(data) ? data[0] : data;
<<<<<<< HEAD
    if (!inserted) throw new Error('Nao foi possivel criar a nova vigencia.');

    await invoicesService.reprocessInvoicesFromDate(input.card_id, normalizedStartDate);
=======
    if (!inserted) {
      throw new Error('Nao foi possivel criar a nova vigencia.');
    }

    await invoicesService.reprocessInvoicesFromDate(input.card_id, normalizedStartDate);

>>>>>>> finnance-management/main
    return CreditCardStatementCycleSchema.parse(inserted);
  },

  async updateStatementCycle(id: string, updates: UpdateCreditCardStatementCycleInput) {
<<<<<<< HEAD
    const { data: cycleData, error: fetchError } = await supabase.rpc('get_cycle_by_id', {
      p_id: id,
    });
    if (fetchError) throw fetchError;
    if (!cycleData) throw new Error('Vigencia nao encontrada.');
=======
    const { data: cycle, error: fetchError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!cycle) throw new Error('Vigencia nao encontrada.');
>>>>>>> finnance-management/main

    const cycle = CreditCardStatementCycleSchema.parse(cycleData);
    const closingDayChanged = Number(cycle.closing_day) !== updates.closing_day;
    const dueDayChanged = Number(cycle.due_day) !== updates.due_day;

<<<<<<< HEAD
    const { data: updated, error } = await supabase.rpc('update_cycle', {
      p_id: id,
      p_closing_day: updates.closing_day,
      p_due_day: updates.due_day,
      p_notes: updates.notes?.trim() || null,
    });
=======
    const { error } = await supabase
      .from('credit_card_statement_cycles')
      .update({
        closing_day: updates.closing_day,
        due_day: updates.due_day,
        notes: updates.notes?.trim() || null,
      })
      .eq('id', id);

>>>>>>> finnance-management/main
    if (error) throw error;

    if (closingDayChanged || dueDayChanged) {
      await invoicesService.reprocessInvoicesFromDate(cycle.card_id, cycle.date_start);
    }

<<<<<<< HEAD
=======
    const { data: updated } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('id', id)
      .single();

>>>>>>> finnance-management/main
    return CreditCardStatementCycleSchema.parse(updated);
  },

  async deleteStatementCycle(id: string) {
<<<<<<< HEAD
    const { data: cycleData, error: fetchError } = await supabase.rpc('get_cycle_by_id', {
      p_id: id,
    });
    if (fetchError) throw fetchError;
    if (!cycleData) throw new Error('Vigencia nao encontrada.');
=======
    const { data: cycle, error: fetchError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!cycle) throw new Error('Vigencia nao encontrada.');

    const { data: allCycles, error: cyclesError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('card_id', cycle.card_id)
      .order('date_start', { ascending: true });
>>>>>>> finnance-management/main

    const cycle = CreditCardStatementCycleSchema.parse(cycleData);
    const { data: allData, error: cyclesError } = await supabase.rpc('get_cycles_by_card', {
      p_card_id: cycle.card_id,
    });
    if (cyclesError) throw cyclesError;

<<<<<<< HEAD
    const orderedCycles = z.array(CreditCardStatementCycleSchema).parse(allData ?? []);
=======
    const orderedCycles = z.array(CreditCardStatementCycleSchema).parse(allCycles ?? []);
>>>>>>> finnance-management/main
    if (orderedCycles.length <= 1) {
      throw new Error('Nao e possivel deletar a unica vigencia do cartao.');
    }

    const cycleIndex = orderedCycles.findIndex((c) => c.id === id);

    if (cycleIndex === 0) {
<<<<<<< HEAD
      await supabase.rpc('update_cycle_date_start', {
        p_id: orderedCycles[1].id,
        p_date_start: cycle.date_start,
      });
    } else {
      await supabase.rpc('update_cycle_date_end', {
        p_id: orderedCycles[cycleIndex - 1].id,
        p_date_end: cycle.date_end,
      });
    }

    const { error: deleteError } = await supabase.rpc('delete_cycle', { p_id: id });
=======
      const nextCycle = orderedCycles[1];
      await supabase
        .from('credit_card_statement_cycles')
        .update({ date_start: cycle.date_start })
        .eq('id', nextCycle.id);
    } else {
      const prevCycle = orderedCycles[cycleIndex - 1];
      await supabase
        .from('credit_card_statement_cycles')
        .update({ date_end: cycle.date_end })
        .eq('id', prevCycle.id);
    }

    const { error: deleteError } = await supabase
      .from('credit_card_statement_cycles')
      .delete()
      .eq('id', id);

>>>>>>> finnance-management/main
    if (deleteError) throw deleteError;

    await invoicesService.reprocessInvoicesFromDate(cycle.card_id, cycle.date_start);
  },

  async getCardDetails(id: string) {
<<<<<<< HEAD
    const [cardResult, statsResult] = await Promise.all([
      supabase.rpc('get_card_by_id', { p_id: id }),
      supabase.rpc('get_card_stats', { p_card_id: id }),
    ]);
=======
    const { data: card, error: cardError } = await supabase
      .from('credit_cards')
      .select('*, bank_account:bank_account_id(name)')
      .eq('id', id)
      .single();
>>>>>>> finnance-management/main

    if (cardResult.error) throw cardResult.error;
    if (statsResult.error) throw statsResult.error;

    let offset = 0;
    const cardTransactions: Transaction[] = [];

    while (true) {
<<<<<<< HEAD
      const { data, error } = await supabase.rpc('get_transactions_paginated', {
        p_card_id: id,
        p_limit: TRANSACTIONS_PAGE_SIZE,
        p_offset: offset,
        p_sort_asc: false,
      });
      if (error) throw error;

      const normalized = (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        bank_account: row.bank_account_name ? { name: row.bank_account_name } : null,
        to_bank_account: row.to_bank_account_name ? { name: row.to_bank_account_name } : null,
        category: row.category_name
          ? { name: row.category_name, color: row.category_color ?? '', icon: row.category_icon ?? '' }
          : null,
        credit_card: row.credit_card_name
          ? { name: row.credit_card_name, color: row.credit_card_color ?? null }
          : null,
      }));
      const page = z.array(TransactionSchema).parse(normalized);
=======
      const { data, error: transError } = await supabase
        .from('transactions')
        .select('*, category:category_id(name, color, icon)')
        .eq('card_id', id)
        .order('payment_date', { ascending: false })
        .range(from, from + TRANSACTIONS_PAGE_SIZE - 1);

      if (transError) throw transError;

      const page = z.array(TransactionSchema).parse(data ?? []);
>>>>>>> finnance-management/main
      cardTransactions.push(...page);
      if (page.length < TRANSACTIONS_PAGE_SIZE) break;
      offset += TRANSACTIONS_PAGE_SIZE;
    }

<<<<<<< HEAD
    const [invoicesResult, cyclesResult] = await Promise.all([
      supabase.rpc('get_invoices_by_card', { p_card_id: id }),
      supabase.rpc('get_cycles_by_card', { p_card_id: id }),
    ]);
=======
    const { data: invoices, error: invError } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('card_id', id)
      .order('month_key', { ascending: false });
>>>>>>> finnance-management/main

    if (invoicesResult.error) throw invoicesResult.error;
    if (cyclesResult.error) throw cyclesResult.error;

<<<<<<< HEAD
    const cardDataRaw = Array.isArray(cardResult.data) ? cardResult.data[0] : cardResult.data;
    if (!cardDataRaw) throw new Error('Cartão não encontrado');
    const cardRow = CreditCardSchema.parse(cardDataRaw);
    const cardCycles = sortStatementCyclesAsc(
      z.array(CreditCardStatementCycleSchema).parse(cyclesResult.data ?? []),
    );
    const cardInvoices = z.array(CreditCardInvoiceSchema).parse(invoicesResult.data ?? []);
    const currentCycle = getCurrentStatementCycle(cardCycles);

    const s = statsResult.data as {
      usage: number;
      current_invoice: number;
      available_limit: number;
    } | null;
=======
    const { data: cycles, error: cyclesError } = await supabase
      .from('credit_card_statement_cycles')
      .select('*')
      .eq('card_id', id)
      .order('date_start', { ascending: true });

    if (cyclesError) throw cyclesError;

    const cardRow = CreditCardSchema.parse(card);
    const cardCycles = sortStatementCyclesAsc(
      z.array(CreditCardStatementCycleSchema).parse(cycles ?? []),
    );
    const cardInvoices = z.array(CreditCardInvoiceSchema).parse(invoices ?? []);
    const currentCycle = getCurrentStatementCycle(cardCycles);

    const now = new Date();
    const currentMonthKey = format(now, 'yyyy-MM');

    const unpaidInvoices = cardInvoices.filter((inv) => inv.status !== 'paid');
    const totalUsage = unpaidInvoices.reduce(
      (acc, inv) => acc + (Number(inv.total_amount) - Number(inv.paid_amount)),
      0,
    );

    const currentInvoiceData = cardInvoices.find((inv) => inv.month_key === currentMonthKey);
    const currentInvoice = currentInvoiceData
      ? Number(currentInvoiceData.total_amount) - Number(currentInvoiceData.paid_amount)
      : 0;
>>>>>>> finnance-management/main

    return {
      ...cardRow,
      transactions: cardTransactions,
      invoices: cardInvoices,
      statement_cycles: cardCycles,
      current_statement_cycle: currentCycle,
      usage: Number(s?.usage ?? 0),
      current_invoice: Number(s?.current_invoice ?? 0),
      available_limit: Number(s?.available_limit ?? cardRow.credit_limit),
    } as CreditCardDetails;
  },
};
