import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import {
  bankAccountLookupService,
  cardsService,
  invoicesService,
} from '../services/cardsService';
import type {
  CreditCardCreateInput,
  CreditCardUpdateInput,
} from '../types/cards.types';

export const cardsKeys = {
  all: ['cards'] as const,
  list: ['cards', 'list'] as const,
  allStats: ['cards', 'all-stats'] as const,
  invoices: (card: number, year: number) => ['cards', 'invoices', card, year] as const,
  bankAccounts: ['cards', 'bank-accounts'] as const,
};

export function useCards() {
  return useQuery({
    queryKey: cardsKeys.list,
    queryFn: cardsService.list,
  });
}

export function useCardsStats() {
  return useQuery({
    queryKey: cardsKeys.allStats,
    queryFn: cardsService.allStats,
  });
}

export function useBankAccountsLookup() {
  return useQuery({
    queryKey: cardsKeys.bankAccounts,
    queryFn: bankAccountLookupService.list,
    staleTime: 300000,
  });
}

export function useCardInvoices(card: number | null, year: number) {
  return useQuery({
    queryKey: cardsKeys.invoices(card ?? 0, year),
    queryFn: () => invoicesService.getByCard(card as number, year),
    enabled: card !== null,
  });
}

function useInvalidateCards() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: cardsKeys.all });
  };
}

export function useCreateCard() {
  const { addToast } = useToast();
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: (input: CreditCardCreateInput) => cardsService.create(input),
    onSuccess: () => {
      invalidate();
      addToast('Cartão criado com sucesso.', 'success');
    },
    onError: () => addToast('Não foi possível criar o cartão.', 'error'),
  });
}

export function useUpdateCard() {
  const { addToast } = useToast();
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: (input: CreditCardUpdateInput) => cardsService.update(input),
    onSuccess: () => {
      invalidate();
      addToast('Cartão atualizado com sucesso.', 'success');
    },
    onError: () => addToast('Não foi possível atualizar o cartão.', 'error'),
  });
}

export function useDeleteCard() {
  const { addToast } = useToast();
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: (creditCard: number) => cardsService.remove(creditCard),
    onSuccess: () => {
      invalidate();
      addToast('Cartão removido.', 'success');
    },
    onError: () => addToast('Não foi possível remover o cartão.', 'error'),
  });
}

export function useRecalculateInvoice() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (invoice: number) => invoicesService.recalculate(invoice),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cardsKeys.all });
      addToast('Fatura recalculada.', 'success');
    },
    onError: () => addToast('Não foi possível recalcular a fatura.', 'error'),
  });
}
