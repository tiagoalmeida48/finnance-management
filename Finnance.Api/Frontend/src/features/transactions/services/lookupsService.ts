import { apiClient } from '@/config/http';
import type {
  BankAccountLookup,
  CategoryLookup,
  CreditCardLookup,
  PaymentMethodLookup,
} from '../types/transactions.types';

export const lookupsService = {
  accounts: async (): Promise<BankAccountLookup[]> => {
    return apiClient.get<BankAccountLookup[]>('/bank-account/list');
  },

  categories: async (): Promise<CategoryLookup[]> => {
    return apiClient.get<CategoryLookup[]>('/category/list');
  },

  cards: async (): Promise<CreditCardLookup[]> => {
    return apiClient.get<CreditCardLookup[]>('/credit-card/list');
  },

  paymentMethods: async (): Promise<PaymentMethodLookup[]> => {
    return apiClient.get<PaymentMethodLookup[]>('/payment-method/list');
  },
};
