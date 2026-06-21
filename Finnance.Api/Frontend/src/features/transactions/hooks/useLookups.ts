import { useQuery } from '@tanstack/react-query';
import { lookupsService } from '../services/lookupsService';

const LOOKUP_STALE_TIME = 5 * 60 * 1000;

export const lookupKeys = {
  accounts: ['lookups', 'accounts'] as const,
  categories: ['lookups', 'categories'] as const,
  cards: ['lookups', 'cards'] as const,
  paymentMethods: ['lookups', 'payment-methods'] as const,
};

export function useAccountsLookup() {
  return useQuery({
    queryKey: lookupKeys.accounts,
    queryFn: lookupsService.accounts,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useCategoriesLookup() {
  return useQuery({
    queryKey: lookupKeys.categories,
    queryFn: lookupsService.categories,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useCardsLookup() {
  return useQuery({
    queryKey: lookupKeys.cards,
    queryFn: lookupsService.cards,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function usePaymentMethodsLookup() {
  return useQuery({
    queryKey: lookupKeys.paymentMethods,
    queryFn: lookupsService.paymentMethods,
    staleTime: LOOKUP_STALE_TIME,
  });
}
