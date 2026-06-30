import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { trackingService } from '../services/trackingService';

export const trackingKeys = {
  all: ['tracking'] as const,
  transactions: (startDate: string, endDate: string) =>
    ['tracking', 'transactions', startDate, endDate] as const,
  invoices: (year: number) => ['tracking', 'invoices', year] as const,
  accounts: ['tracking', 'accounts'] as const,
  cards: ['tracking', 'cards'] as const,
};

const ACCOUNTS_STALE_TIME = 5 * 60 * 1000;

export function useTrackingTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: trackingKeys.transactions(startDate, endDate),
    queryFn: () => trackingService.listTransactions({ startDate, endDate }),
  });
}

export function useTrackingInvoices(year: number) {
  return useQuery({
    queryKey: trackingKeys.invoices(year),
    queryFn: () => trackingService.listInvoices(year),
  });
}

export function useTrackingAccounts() {
  return useQuery({
    queryKey: trackingKeys.accounts,
    queryFn: trackingService.listAccounts,
    staleTime: ACCOUNTS_STALE_TIME,
  });
}

export function useTrackingCards() {
  return useQuery({
    queryKey: trackingKeys.cards,
    queryFn: trackingService.listCards,
    staleTime: ACCOUNTS_STALE_TIME,
  });
}

export function useTrackingPayMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: trackingKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    void queryClient.invalidateQueries({ queryKey: ['cards'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['transactions'] });
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

  const pay = useMutation({
    mutationFn: ({ id, account }: { id: number; account: number }) =>
      trackingService.pay(id, account),
    onSuccess: () => {
      invalidate();
      addToast('Pagamento registrado.', 'success');
    },
    onError,
  });

  const payBill = useMutation({
    mutationFn: ({ invoice, account, paymentDate }: { invoice: number; account: number; paymentDate: string }) =>
      trackingService.payBill(invoice, account, paymentDate),
    onSuccess: () => {
      invalidate();
      addToast('Fatura paga.', 'success');
    },
    onError,
  });

  return { togglePaid, pay, payBill };
}
