import { apiClient } from '@/config/http';
import type {
  BankAccountOption,
  CreditCard,
  CreditCardCreateInput,
  CreditCardInvoice,
  CreditCardStats,
  CreditCardUpdateInput,
  PayBillInput,
  StatementCycle,
  StatementCycleCreateInput,
  StatementCycleUpdateInput,
  Transaction,
} from '../types/cards.types';

export const cardsService = {
  list: (): Promise<CreditCard[]> => apiClient.get<CreditCard[]>('/credit-card/list'),

  get: (creditCard: number): Promise<CreditCard> =>
    apiClient.get<CreditCard>('/credit-card/get', { creditCard }),

  create: (input: CreditCardCreateInput): Promise<number> =>
    apiClient.post<number>('/credit-card/create', input),

  update: (input: CreditCardUpdateInput): Promise<boolean> =>
    apiClient.put<boolean>('/credit-card/update', input),

  remove: (creditCard: number): Promise<boolean> =>
    apiClient.delete<boolean>('/credit-card/delete', creditCard),

  stats: (creditCard: number): Promise<CreditCardStats> =>
    apiClient.get<CreditCardStats>('/credit-card/stats', { creditCard }),

  allStats: (): Promise<CreditCardStats[]> =>
    apiClient.get<CreditCardStats[]>('/credit-card/all-stats'),
};

export const cyclesService = {
  getByCard: (card: number): Promise<StatementCycle[]> =>
    apiClient.get<StatementCycle[]>('/credit-card-statement-cycle/get-by-card', { card }),

  create: (input: StatementCycleCreateInput): Promise<number> =>
    apiClient.post<number>('/credit-card-statement-cycle/create', input),

  insertCycle: (input: StatementCycleCreateInput): Promise<number> =>
    apiClient.post<number>('/credit-card-statement-cycle/insert-cycle', input),

  updateStart: (cycle: number, dateStart: string): Promise<boolean> => {
    const query = new URLSearchParams({ cycle: String(cycle), dateStart }).toString();
    return apiClient.put<boolean>(`/credit-card-statement-cycle/update-start?${query}`);
  },

  updateEnd: (cycle: number, dateEnd: string): Promise<boolean> => {
    const query = new URLSearchParams({ cycle: String(cycle), dateEnd }).toString();
    return apiClient.put<boolean>(`/credit-card-statement-cycle/update-end?${query}`);
  },

  updateCycle: (input: StatementCycleUpdateInput): Promise<boolean> =>
    apiClient.put<boolean>('/credit-card-statement-cycle/update-cycle', input),

  remove: (cycle: number): Promise<boolean> => {
    const query = new URLSearchParams({ cycle: String(cycle) }).toString();
    return apiClient.delete<boolean>(`/credit-card-statement-cycle/delete?${query}`);
  },
};

export const invoicesService = {
  getByCard: (card: number, year?: number): Promise<CreditCardInvoice[]> =>
    apiClient.get<CreditCardInvoice[]>('/credit-card-invoice/get-by-card', { card, year }),

  getByMonth: (card: number, monthKey: string): Promise<CreditCardInvoice> =>
    apiClient.get<CreditCardInvoice>('/credit-card-invoice/get-by-month', { card, monthKey }),

  transactions: (invoice: number): Promise<Transaction[]> =>
    apiClient.post<Transaction[]>('/transaction/list', { invoice, sortAsc: false, limit: 200 }),

  recalculate: (invoice: number): Promise<boolean> =>
    apiClient.post<boolean>('/credit-card-invoice/recalculate', invoice),

  reprocess: (card: number, fromDate: string): Promise<boolean> => {
    const query = new URLSearchParams({ card: String(card), fromDate }).toString();
    return apiClient.post<boolean>(`/credit-card-invoice/reprocess?${query}`);
  },

  payBill: (input: PayBillInput): Promise<boolean> =>
    apiClient.post<boolean>('/transaction/pay-bill', input),
};

export const bankAccountLookupService = {
  list: (): Promise<BankAccountOption[]> => apiClient.get<BankAccountOption[]>('/bank-account/list'),
};
