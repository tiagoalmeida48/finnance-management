import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsService } from '../services/cards.service';
import type { CreditCardDetails } from '../interfaces/card-details.interface';
import {
    CreateCreditCardStatementCycleInput,
    UpdateCreditCardInput,
    UpdateCreditCardStatementCycleInput,
} from '../interfaces';
import { queryKeys } from '../constants/queryKeys';

export function useCreditCards() {
    return useQuery({
        queryKey: queryKeys.cards.all,
        queryFn: () => cardsService.getAll(),
    });
}

export function useCreateCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cardsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
        },
    });
}

export function useUpdateCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateCreditCardInput }) => cardsService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
        },
    });
}

export function useDeleteCreditCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cardsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
        },
    });
}

export function useCreditCardDetails(id: string) {
    return useQuery<CreditCardDetails>({
        queryKey: queryKeys.cards.details(id),
        queryFn: () => cardsService.getCardDetails(id),
        enabled: !!id,
    });
}

export function useCardStatementCycles(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.cards.statementCycles(id),
        queryFn: () => cardsService.getStatementCycles(id),
        enabled: !!id && enabled,
    });
}

export function useCreateCardStatementCycle(cardId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: Omit<CreateCreditCardStatementCycleInput, 'card_id'>) =>
            cardsService.createStatementCycle({ ...input, card_id: cardId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.details(cardId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.statementCycles(cardId) });
        },
    });
}

export function useUpdateCardStatementCycle(cardId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateCreditCardStatementCycleInput }) =>
            cardsService.updateStatementCycle(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.details(cardId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.statementCycles(cardId) });
        },
    });
}

export function useDeleteCardStatementCycle(cardId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cardsService.deleteStatementCycle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.details(cardId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.statementCycles(cardId) });
        },
    });
}

