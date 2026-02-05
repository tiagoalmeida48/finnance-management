import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService, CreateTransactionData, Transaction } from '../services/transactions.service';

export function useTransactions(filters?: Parameters<typeof transactionsService.getAll>[0]) {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => transactionsService.getAll(filters),
    });
}

export function useFirstTransactionDate() {
    return useQuery({
        queryKey: ['transactions', 'first-date'],
        queryFn: () => transactionsService.getFirstTransactionDate(),
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTransactionData) => transactionsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useBatchCreateTransactions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (transactions: Partial<Transaction>[]) => transactionsService.batchCreate(transactions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) =>
            transactionsService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useTogglePaymentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, currentStatus }: { id: string; currentStatus: boolean }) =>
            transactionsService.togglePaymentStatus(id, currentStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useBatchPayTransactions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ids, accountId, paymentDate }: { ids: string[]; accountId: string; payment_date?: string; paymentDate?: string }) => {
            // Support both naming conventions for flexibility
            const actualDate = paymentDate || (arguments[0] as any).payment_date;
            return transactionsService.batchPay(ids, accountId, actualDate);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useBatchUnpayTransactions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => transactionsService.batchUnpay(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useBatchDeleteTransactions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => transactionsService.batchDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => transactionsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useDeleteTransactionGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, type }: { groupId: string; type: 'installment' | 'recurring' }) =>
            transactionsService.deleteGroup(groupId, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function useUpdateTransactionGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, type, updates }: { groupId: string; type: 'installment' | 'recurring'; updates: Partial<Transaction> }) =>
            transactionsService.updateGroup(groupId, type, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
}

export function usePayBill() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { cardId: string; transactionIds: string[]; accountId: string; paymentDate: string; amount: number; description: string }) =>
            transactionsService.payBill(data.cardId, data.transactionIds, data.accountId, data.paymentDate, data.amount, data.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['cards'] });
        },
    });
}
