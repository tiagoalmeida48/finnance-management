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
  OPEN_CYCLE_END,
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
    const [cards, stats] = await Promise.all([
      supabase.rpc('get_cards'),
      supabase.rpc('get_all_card_stats'),
    ]);

    if (cards.error) throw cards.error;
    if (stats.error) throw stats.error;

    const allCycles: CreditCardStatementCycle[] = [];
    const cardRows = z.array(CreditCardSchema).parse(cards.data ?? []);

    await Promise.all(
      cardRows.map(async (card) => {
        const { data } = await supabase.rpc('get_cycles_by_card', { p_card_id: card.id });
        const cycles = z.array(CreditCardStatementCycleSchema).parse(data ?? []);
        allCycles.push(...cycles);
      }),
    );

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
      const s = statsMap.get(card.id);
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
    const { data, error } = await supabase.rpc('create_card', {
      p_bank_account_id: card.bank_account_id,
      p_name: card.name,
      p_color: card.color,
      p_credit_limit: card.credit_limit,
      p_notes: card.notes ?? null,
    });
    if (error) throw error;

    const createdCard = CreditCardSchema.parse(data);
    const dateStart = format(new Date(), 'yyyy-MM-dd');

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
    return {
      ...createdCard,
      statement_cycles: [createdCycle],
      current_statement_cycle: createdCycle,
    } as CreditCard;
  },

  async update(id: string, updates: UpdateCreditCardInput) {
    if ('closing_day' in updates || 'due_day' in updates) {
      throw new Error(
        'Alteracoes de vencimento e fechamento devem ser feitas pelo historico de ciclo da fatura.',
      );
    }
    const { data, error } = await supabase.rpc('update_card', {
      p_id: id,
      p_name: updates.name ?? null,
      p_color: updates.color ?? null,
      p_credit_limit: updates.credit_limit ?? null,
      p_bank_account_id: updates.bank_account_id ?? null,
      p_notes: updates.notes ?? null,
      p_is_active: updates.is_active ?? null,
    });
    if (error) throw error;
    return CreditCardSchema.parse(data);
  },

  async delete(id: string) {
    const { error } = await supabase.rpc('delete_card', { p_id: id });
    if (error) throw error;
  },

  async getStatementCycles(cardId: string) {
    const { data, error } = await supabase.rpc('get_cycles_by_card', { p_card_id: cardId });
    if (error) throw error;
    return z.array(CreditCardStatementCycleSchema).parse(data ?? []);
  },

  async createStatementCycle(input: CreateCreditCardStatementCycleInput) {
    const normalizedStartDate = normalizeDateKey(input.date_start);
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
    }

    const firstCycle = cycleRows[0];

    if (normalizedStartDate < firstCycle.date_start) {
      const newEnd = format(subDays(parseISO(firstCycle.date_start), 1), 'yyyy-MM-dd');

      const { error: insertError } = await supabase.rpc('create_credit_card_statement_cycle', {
        p_card_id: input.card_id,
        p_date_start: normalizedStartDate,
        p_closing_day: input.closing_day,
        p_due_day: input.due_day,
        p_notes: input.notes?.trim() || null,
      });
      if (insertError) throw insertError;

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
    if (!inserted) throw new Error('Nao foi possivel criar a nova vigencia.');

    await invoicesService.reprocessInvoicesFromDate(input.card_id, normalizedStartDate);
    return CreditCardStatementCycleSchema.parse(inserted);
  },

  async updateStatementCycle(id: string, updates: UpdateCreditCardStatementCycleInput) {
    const { data: cycleData, error: fetchError } = await supabase.rpc('get_cycle_by_id', {
      p_id: id,
    });
    if (fetchError) throw fetchError;
    if (!cycleData) throw new Error('Vigencia nao encontrada.');

    const cycle = CreditCardStatementCycleSchema.parse(cycleData);
    const closingDayChanged = Number(cycle.closing_day) !== updates.closing_day;
    const dueDayChanged = Number(cycle.due_day) !== updates.due_day;

    const { data: updated, error } = await supabase.rpc('update_cycle', {
      p_id: id,
      p_closing_day: updates.closing_day,
      p_due_day: updates.due_day,
      p_notes: updates.notes?.trim() || null,
    });
    if (error) throw error;

    if (closingDayChanged || dueDayChanged) {
      await invoicesService.reprocessInvoicesFromDate(cycle.card_id, cycle.date_start);
    }

    return CreditCardStatementCycleSchema.parse(updated);
  },

  async deleteStatementCycle(id: string) {
    const { data: cycleData, error: fetchError } = await supabase.rpc('get_cycle_by_id', {
      p_id: id,
    });
    if (fetchError) throw fetchError;
    if (!cycleData) throw new Error('Vigencia nao encontrada.');

    const cycle = CreditCardStatementCycleSchema.parse(cycleData);
    const { data: allData, error: cyclesError } = await supabase.rpc('get_cycles_by_card', {
      p_card_id: cycle.card_id,
    });
    if (cyclesError) throw cyclesError;

    const orderedCycles = z.array(CreditCardStatementCycleSchema).parse(allData ?? []);
    if (orderedCycles.length <= 1) {
      throw new Error('Nao e possivel deletar a unica vigencia do cartao.');
    }

    const cycleIndex = orderedCycles.findIndex((c) => c.id === id);

    if (cycleIndex === 0) {
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
    if (deleteError) throw deleteError;

    await invoicesService.reprocessInvoicesFromDate(cycle.card_id, cycle.date_start);
  },

  async getCardDetails(id: string) {
    const [cardResult, statsResult] = await Promise.all([
      supabase.rpc('get_card_by_id', { p_id: id }),
      supabase.rpc('get_card_stats', { p_card_id: id }),
    ]);

    if (cardResult.error) throw cardResult.error;
    if (statsResult.error) throw statsResult.error;

    let offset = 0;
    const cardTransactions: Transaction[] = [];

    while (true) {
      const { data, error } = await supabase.rpc('get_transactions_paginated', {
        p_card_id: id,
        p_limit: TRANSACTIONS_PAGE_SIZE,
        p_offset: offset,
        p_sort_asc: false,
      });
      if (error) throw error;

      const page = z.array(TransactionSchema).parse(data ?? []);
      cardTransactions.push(...page);
      if (page.length < TRANSACTIONS_PAGE_SIZE) break;
      offset += TRANSACTIONS_PAGE_SIZE;
    }

    const [invoicesResult, cyclesResult] = await Promise.all([
      supabase.rpc('get_invoices_by_card', { p_card_id: id }),
      supabase.rpc('get_cycles_by_card', { p_card_id: id }),
    ]);

    if (invoicesResult.error) throw invoicesResult.error;
    if (cyclesResult.error) throw cyclesResult.error;

    const cardRow = CreditCardSchema.parse(cardResult.data);
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
