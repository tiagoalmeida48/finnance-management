import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/feedback';
import { ApiError } from '@/shared/types/api.types';
import { salaryService } from '../services/salaryService';
import type {
  SalarySettingCloseInput,
  SalarySettingCreateInput,
  SalarySettingUpdateInput,
} from '../types/salary.types';

export const salaryKeys = {
  all: ['salary'] as const,
  history: ['salary', 'history'] as const,
  current: ['salary', 'current'] as const,
  open: ['salary', 'open'] as const,
};

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useSalaryHistory() {
  return useQuery({
    queryKey: salaryKeys.history,
    queryFn: salaryService.history,
  });
}

export function useCurrentSalary() {
  return useQuery({
    queryKey: salaryKeys.current,
    queryFn: salaryService.current,
  });
}

export function useOpenSalary() {
  return useQuery({
    queryKey: salaryKeys.open,
    queryFn: salaryService.open,
  });
}

export function useCreateSalarySetting() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: SalarySettingCreateInput) => salaryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
      addToast('Vigência salarial criada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Erro ao criar vigência salarial.'), 'error');
    },
  });
}

export function useUpdateSalarySetting() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: SalarySettingUpdateInput) => salaryService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
      addToast('Vigência salarial atualizada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Erro ao atualizar vigência salarial.'), 'error');
    },
  });
}

export function useCloseSalarySetting() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: SalarySettingCloseInput) => salaryService.close(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
      addToast('Vigência salarial encerrada com sucesso.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Erro ao encerrar vigência salarial.'), 'error');
    },
  });
}

export function useDeleteCurrentSalarySetting() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: () => salaryService.deleteCurrent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
      addToast('Vigência atual excluída e vigência anterior restaurada.', 'success');
    },
    onError: (error: unknown) => {
      addToast(resolveErrorMessage(error, 'Erro ao excluir vigência salarial.'), 'error');
    },
  });
}
