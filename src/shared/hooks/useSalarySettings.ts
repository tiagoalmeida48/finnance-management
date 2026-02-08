import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateSalarySettingInput, UpdateSalarySettingInput } from '../interfaces';
import { salarySettingsService } from '../services/salary-settings.service';

const SALARY_HISTORY_QUERY_KEY = ['salary-settings-history'];
const SALARY_CURRENT_QUERY_KEY = ['salary-settings-current'];

export function useSalarySettingsHistory() {
    return useQuery({
        queryKey: SALARY_HISTORY_QUERY_KEY,
        queryFn: salarySettingsService.getHistory,
    });
}

export function useSalaryCurrentSetting() {
    return useQuery({
        queryKey: SALARY_CURRENT_QUERY_KEY,
        queryFn: salarySettingsService.getCurrent,
    });
}

export function useCreateSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateSalarySettingInput) => salarySettingsService.createSettingWithValidity(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_HISTORY_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: SALARY_CURRENT_QUERY_KEY });
        },
    });
}

export function useUpdateSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateSalarySettingInput) => salarySettingsService.updateSetting(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_HISTORY_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: SALARY_CURRENT_QUERY_KEY });
        },
    });
}

export function useDeleteCurrentSalarySetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salarySettingsService.deleteCurrentSettingAndRestorePrevious,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALARY_HISTORY_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: SALARY_CURRENT_QUERY_KEY });
        },
    });
}
