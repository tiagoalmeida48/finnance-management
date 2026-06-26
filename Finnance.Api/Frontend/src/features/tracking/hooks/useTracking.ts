import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { trackingService, type BatchPayPayload } from '../services/trackingService';

export const trackingKeys = {
  all: ['tracking'] as const,
  transactions: (startDate: string, endDate: string) =>
    ['tracking', 'transactions', startDate, endDate] as const,
  accounts: ['tracking', 'accounts'] as const,
};

const ACCOUNTS_STALE_TIME = 5 * 60 * 1000;

export function useTrackingTransactions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: trackingKeys.transactions(startDate, endDate),
    queryFn: () => trackingService.listTransactions({ startDate, endDate }),
  });
}

export function useTrackingAccounts() {
  return useQuery({
    queryKey: trackingKeys.accounts,
    queryFn: trackingService.listAccounts,
    staleTime: ACCOUNTS_STALE_TIME,
  });
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
