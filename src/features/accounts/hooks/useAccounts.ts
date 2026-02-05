import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accounts.service';

const ACCOUNTS_QUERY_KEY = ['accounts'];

export function useAccounts() {
    return useQuery({
        queryKey: ACCOUNTS_QUERY_KEY,
        queryFn: accountsService.getAll,
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: accountsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
        },
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: any }) =>
            accountsService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
        },
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: accountsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
        },
    });
}
