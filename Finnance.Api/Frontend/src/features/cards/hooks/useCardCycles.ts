import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { cyclesService, invoicesService } from '../services/cardsService';
import type { StatementCycleCreateInput } from '../types/cards.types';

export const cycleKeys = {
  all: ['card-cycles'] as const,
  byCard: (card: number) => ['card-cycles', card] as const,
};

export function useCardCycles(card: number | null) {
  return useQuery({
    queryKey: cycleKeys.byCard(card ?? 0),
    queryFn: () => cyclesService.getByCard(card as number),
    enabled: card !== null,
  });
}

function useInvalidateCycles(card: number) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: cycleKeys.byCard(card) });
    void queryClient.invalidateQueries({ queryKey: ['cards'] });
  };
}

export function useCreateCycle(card: number) {
  const { addToast } = useToast();
  const invalidate = useInvalidateCycles(card);
  return useMutation({
    mutationFn: (input: StatementCycleCreateInput) => cyclesService.create(input),
    onSuccess: () => {
      invalidate();
      addToast('Vigência criada com sucesso.', 'success');
    },
    onError: () => addToast('Não foi possível criar a vigência.', 'error'),
  });
}

export function useInsertCycle(card: number) {
  const { addToast } = useToast();
  const invalidate = useInvalidateCycles(card);
  return useMutation({
    mutationFn: (input: StatementCycleCreateInput) => cyclesService.insertCycle(input),
    onSuccess: () => {
      invalidate();
      addToast('Nova vigência adicionada.', 'success');
    },
    onError: () => addToast('Não foi possível adicionar a vigência.', 'error'),
  });
}

export function useUpdateCycleStart(card: number) {
  const { addToast } = useToast();
  const invalidate = useInvalidateCycles(card);
  return useMutation({
    mutationFn: (input: { cycle: number; dateStart: string }) =>
      cyclesService.updateStart(input.cycle, input.dateStart),
    onSuccess: () => {
      invalidate();
      addToast('Vigência atualizada.', 'success');
    },
    onError: () => addToast('Não foi possível atualizar a vigência.', 'error'),
  });
}

export function useUpdateCycleEnd(card: number) {
  const { addToast } = useToast();
  const invalidate = useInvalidateCycles(card);
  return useMutation({
    mutationFn: (input: { cycle: number; dateEnd: string }) =>
      cyclesService.updateEnd(input.cycle, input.dateEnd),
    onSuccess: () => {
      invalidate();
      addToast('Encerramento da vigência atualizado.', 'success');
    },
    onError: () => addToast('Não foi possível atualizar o encerramento.', 'error'),
  });
}

export function useReprocessInvoices(card: number) {
  const { addToast } = useToast();
  const invalidate = useInvalidateCycles(card);
  return useMutation({
    mutationFn: (fromDate: string) => invoicesService.reprocess(card, fromDate),
    onSuccess: () => {
      invalidate();
      addToast('Faturas reprocessadas.', 'success');
    },
    onError: () => addToast('Não foi possível reprocessar as faturas.', 'error'),
  });
}
