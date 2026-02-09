import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accounts.service';
import { Account } from '../interfaces';
import { queryKeys } from '../constants/queryKeys';

export function useAccounts() {
    return useQuery({
        queryKey: queryKeys.accounts.all,
        queryFn: () => accountsService.getAll(),
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => accountsService.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
    });
}

export function useUpdateAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) => accountsService.update(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => accountsService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
    });
}
