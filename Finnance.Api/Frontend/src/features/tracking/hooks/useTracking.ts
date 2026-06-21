import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import {
  trackingService,
  type BatchPayPayload,
  type TrackingCard,
} from '../services/trackingService';
import type { StatementCycleLike } from '../types/tracking.types';

export const trackingKeys = {
  all: ['tracking'] as const,
  transactions: (startDate: string, endDate: string) =>
    ['tracking', 'transactions', startDate, endDate] as const,
  cards: ['tracking', 'cards'] as const,
  accounts: ['tracking', 'accounts'] as const,
  cycles: (card: number) => ['tracking', 'cycles', card] as const,
};

const CYCLE_STALE_TIME = 5 * 60 * 1000;

export function useTrackingTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: trackingKeys.transactions(startDate, endDate),
    queryFn: () => trackingService.listTransactions({ startDate, endDate }),
  });
}

export function useTrackingCards() {
  return useQuery({
    queryKey: trackingKeys.cards,
    queryFn: trackingService.listCards,
  });
}

export function useTrackingAccounts() {
  return useQuery({
    queryKey: trackingKeys.accounts,
    queryFn: trackingService.listAccounts,
    staleTime: CYCLE_STALE_TIME,
  });
}

export function useCardCycles(cards: TrackingCard[] | undefined) {
  const results = useQueries({
    queries: (cards ?? []).map((card) => ({
      queryKey: trackingKeys.cycles(card.creditCard),
      queryFn: () => trackingService.cyclesByCard(card.creditCard),
      staleTime: CYCLE_STALE_TIME,
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const dataSignature = results.map((result) => result.dataUpdatedAt).join('|');

  const cyclesByCard = useMemo(() => {
    const map = new Map<number, StatementCycleLike[]>();
    (cards ?? []).forEach((card, index) => {
      map.set(card.creditCard, results[index]?.data ?? []);
    });
    return map;
  }, [cards, dataSignature]);

  return { cyclesByCard, isLoading };
}

export function useTrackingPayMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: trackingKeys.all });
  };

  const onError = () => addToast('Erro ao registrar pagamento.', 'error');

  const togglePaid = useMutation({
    mutationFn: (transaction: number) => trackingService.togglePaid(transaction),
    onSuccess: () => {
      invalidate();
      addToast('Pagamento registrado.', 'success');
    },
    onError,
  });

  const batchPay = useMutation({
    mutationFn: (payload: BatchPayPayload) => trackingService.batchPay(payload),
    onSuccess: () => {
      invalidate();
      addToast('Pagamento registrado.', 'success');
    },
    onError,
  });

  return { togglePaid, batchPay };
}
