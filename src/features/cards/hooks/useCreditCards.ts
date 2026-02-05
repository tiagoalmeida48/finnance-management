import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsService } from '../services/cards.service';

const CARDS_QUERY_KEY = ['credit_cards'];

export function useCreditCards() {
    return useQuery({
        queryKey: CARDS_QUERY_KEY,
        queryFn: () => cardsService.getAll(),
    });
}

export function useCreateCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cardsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
        },
    });
}

export function useUpdateCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: any }) => cardsService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
        },
    });
}

export function useDeleteCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cardsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY });
        },
    });
}

export function useCreditCardDetails(id: string) {
    return useQuery({
        queryKey: [...CARDS_QUERY_KEY, id, 'details'],
        queryFn: () => cardsService.getCardDetails(id),
        enabled: !!id,
    });
}
