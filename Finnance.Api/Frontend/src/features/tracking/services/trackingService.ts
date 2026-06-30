import { apiClient } from '@/config/http';

export interface TrackingTransaction {
  transaction: number;
  transactionType: number;
  amount: number | null;
  paymentDate: string | null;
  description: string;
  fixed: boolean;
  paid: boolean;
  account: number | null;
}

export interface TrackingAccount {
  bankAccount: number;
  name: string;
}

export interface TrackingInvoice {
  creditCardInvoice: number;
  card: number;
  invoiceStatus: number;
  monthKey: string;
  totalAmount: number;
  paidAmount: number;
}

export interface TrackingCard {
  creditCard: number;
  bankAccount: number;
  name: string;
}

interface TrackingFilter {
  startDate: string;
  endDate: string;
}

export const trackingService = {
  listTransactions: (filter: TrackingFilter): Promise<TrackingTransaction[]> =>
    apiClient.post<TrackingTransaction[]>('/transaction/list', {
      account: 0,
      category: 0,
      startDate: filter.startDate,
      endDate: filter.endDate,
      isPaid: null,
      onlyFixed: true,
      hideCreditCards: true,
      sortAsc: true,
      limit: 5000,
      offset: 0,
    }),

  listAccounts: (): Promise<TrackingAccount[]> =>
    apiClient.get<TrackingAccount[]>('/bank-account/list'),

  listInvoices: (year: number): Promise<TrackingInvoice[]> =>
    apiClient.get<TrackingInvoice[]>('/credit-card-invoice/list', { year }),

  listCards: (): Promise<TrackingCard[]> =>
    apiClient.get<TrackingCard[]>('/credit-card/list'),

  togglePaid: (transaction: number): Promise<boolean> =>
    apiClient.put<boolean>('/transaction/toggle-paid', transaction),

  pay: (transaction: number, account: number): Promise<boolean> =>
    apiClient.put<boolean>('/transaction/update', { transaction, paid: true, account }),

  payBill: (invoice: number, account: number, paymentDate: string): Promise<boolean> =>
    apiClient.post<boolean>('/transaction/pay-bill', { invoice, account, paymentDate }),
};
