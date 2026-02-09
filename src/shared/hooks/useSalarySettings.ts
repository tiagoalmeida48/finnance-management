import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateSalarySettingInput, UpdateSalarySettingInput } from '../interfaces';
import { salarySettingsService } from '../services/salary-settings.service';
import { queryKeys } from '../constants/queryKeys';

export function useSalarySettingsHistory() {
    return useQuery({
        queryKey: queryKeys.salary.history,
        queryFn: salarySettingsService.getHistory,
    });
}

export function useSalaryCurrentSetting() {
    return useQuery({
        queryKey: queryKeys.salary.current,
        queryFn: salarySettingsService.getCurrent,
    });
}

export function useCreateSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateSalarySettingInput) => salarySettingsService.createSettingWithValidity(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.history });
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.current });
        },
    });
}

export function useUpdateSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateSalarySettingInput) => salarySettingsService.updateSetting(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.history });
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.current });
        },
    });
}

export function useDeleteCurrentSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salarySettingsService.deleteCurrentSettingAndRestorePrevious,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.history });
            queryClient.invalidateQueries({ queryKey: queryKeys.salary.current });
        },
    });
}
