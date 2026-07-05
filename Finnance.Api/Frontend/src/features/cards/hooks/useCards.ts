import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { transactionsService } from '@/features/transactions';
import type { TransactionUpdateInput } from '@/features/transactions';
import {
  bankAccountLookupService,
  cardsService,
  invoicesService,
} from '../services/cardsService';
import type {
  CreditCardCreateInput,
  CreditCardUpdateInput,
  PayBillInput,
} from '../types/cards.types';

export const cardsKeys = {
  all: ['cards'] as const,
  list: ['cards', 'list'] as const,
  allStats: ['cards', 'all-stats'] as const,
  card: (card: number) => ['cards', 'card', card] as const,
  stats: (card: number) => ['cards', 'stats', card] as const,
  invoices: (card: number, year: number, offset: number) =>
    ['cards', 'invoices', card, year, offset] as const,
  invoiceTransactions: (invoice: number, sortField: string, sortAsc: boolean) =>
    ['cards', 'invoice-transactions', invoice, sortField, sortAsc] as const,
  bankAccounts: ['cards', 'bank-accounts'] as const,
};

export function useCards() {
  return useQuery({
    queryKey: cardsKeys.list,
    queryFn: cardsService.list,
  });
}

export function useCard(card: number | null) {
  return useQuery({
    queryKey: cardsKeys.card(card ?? 0),
    queryFn: () => cardsService.get(card as number),
    enabled: card !== null,
  });
}

export function useCardsStats() {
  return useQuery({
    queryKey: cardsKeys.allStats,
    queryFn: cardsService.allStats,
  });
}

export function useCardStats(card: number | null) {
  return useQuery({
    queryKey: cardsKeys.stats(card ?? 0),
    queryFn: () => cardsService.stats(card as number),
    enabled: card !== null,
  });
}

export function useBankAccountsLookup() {
  return useQuery({
    queryKey: cardsKeys.bankAccounts,
    queryFn: bankAccountLookupService.list,
    staleTime: 300000,
  });
}

export function useCardInvoices(card: number | null, year: number, limit: number, offset: number) {
  return useQuery({
    queryKey: cardsKeys.invoices(card ?? 0, year, offset),
    queryFn: () => invoicesService.getByCard(card as number, year, limit, offset),
    enabled: card !== null,
    placeholderData: (previous) => previous,
  });
}

export function useInvoiceTransactions(invoice: number | null, sortField: string, sortAsc: boolean) {
  return useQuery({
    queryKey: cardsKeys.invoiceTransactions(invoice ?? 0, sortField, sortAsc),
    queryFn: () => invoicesService.transactions(invoice as number, sortField, sortAsc),
    enabled: invoice !== null,
    placeholderData: (previous) => previous,
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

export function usePayBill() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (input: PayBillInput) => invoicesService.payBill(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cardsKeys.all });
      addToast('Fatura paga.', 'success');
    },
    onError: () => addToast('Não foi possível pagar a fatura.', 'error'),
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

function useInvalidateInvoiceItems() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: cardsKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useUpdateInvoiceTransaction() {
  const { addToast } = useToast();
  const invalidate = useInvalidateInvoiceItems();
  return useMutation({
    mutationFn: (input: TransactionUpdateInput) => transactionsService.update(input),
    onSuccess: () => {
      invalidate();
      addToast('Lançamento atualizado com sucesso.', 'success');
    },
    onError: () => addToast('Não foi possível atualizar o lançamento.', 'error'),
  });
}

export function useDeleteInvoiceTransaction() {
  const { addToast } = useToast();
  const invalidate = useInvalidateInvoiceItems();
  return useMutation({
    mutationFn: (transaction: number) => transactionsService.delete(transaction),
    onSuccess: () => {
      invalidate();
      addToast('Lançamento excluído.', 'success');
    },
    onError: () => addToast('Não foi possível excluir o lançamento.', 'error'),
  });
}
