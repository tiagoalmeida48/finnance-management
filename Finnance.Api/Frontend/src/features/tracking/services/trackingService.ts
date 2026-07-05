import { apiClient } from '@/config/http';

export interface TrackingMonthlyItem {
  id: number;
  itemType: string;
  name: string;
  total: number;
  isPaid: boolean;
  account: number | null;
}

export interface TrackingMonthly {
  month: number;
  items: TrackingMonthlyItem[];
  totalItems: number;
  paidItems: number;
  progress: number;
  totalAmount: number;
}

export interface TrackingAccount {
  bankAccount: number;
  name: string;
  color: string;
  icon: string;
}

export const trackingService = {
  getMonthly: (year: number): Promise<TrackingMonthly[]> =>
    apiClient.get<TrackingMonthly[]>('/transaction/tracking-monthly', { year }),

  listAccounts: (): Promise<TrackingAccount[]> =>
    apiClient.get<TrackingAccount[]>('/bank-account/list'),

  togglePaid: (transaction: number): Promise<boolean> =>
    apiClient.put<boolean>('/transaction/toggle-paid', transaction),

  pay: (transaction: number, account: number): Promise<boolean> =>
    apiClient.put<boolean>('/transaction/update', { transaction, paid: true, account }),

  payBill: (invoice: number, account: number, paymentDate: string): Promise<boolean> =>
    apiClient.post<boolean>('/transaction/pay-bill', { invoice, account, paymentDate }),
};
