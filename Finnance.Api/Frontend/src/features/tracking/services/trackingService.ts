import { apiClient } from '@/config/http';
import type { StatementCycleLike } from '../types/tracking.types';

export interface TrackingTransaction {
  transaction: number;
  transactionType: number;
  amount: number | null;
  paymentDate: string | null;
  purchaseDate: string | null;
  description: string;
  card: number | null;
  fixed: boolean;
  paid: boolean;
}

export interface TrackingCard {
  creditCard: number;
  name: string;
}

export interface TrackingAccount {
  bankAccount: number;
  name: string;
}

interface TrackingFilter {
  startDate: string;
  endDate: string;
}

export interface BatchPayPayload {
  ids: number[];
  account: number;
  paymentDate: string;
}

export const trackingService = {
  listTransactions: (filter: TrackingFilter): Promise<TrackingTransaction[]> =>
    apiClient.post<TrackingTransaction[]>('/transaction/list', {
      account: 0,
      category: 0,
      startDate: filter.startDate,
      endDate: filter.endDate,
      isPaid: null,
      sortAsc: true,
      limit: 5000,
      offset: 0,
    }),

  listCards: (): Promise<TrackingCard[]> => apiClient.get<TrackingCard[]>('/credit-card/list'),

  listAccounts: (): Promise<TrackingAccount[]> =>
    apiClient.get<TrackingAccount[]>('/bank-account/list'),

  cyclesByCard: (card: number): Promise<StatementCycleLike[]> =>
    apiClient.get<StatementCycleLike[]>('/credit-card-statement-cycle/get-by-card', { card }),

  togglePaid: (transaction: number): Promise<boolean> =>
    apiClient.put<boolean>('/transaction/toggle-paid', transaction),

  batchPay: (payload: BatchPayPayload): Promise<boolean> =>
    apiClient.post<boolean>('/transaction/batch-pay', payload),
};
