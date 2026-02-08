import { format, isValid, parseISO, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { CreateSalarySettingInput, SalarySetting, UpdateSalarySettingInput } from '../interfaces';

const OPEN_DATE_END = '9999-12-31';

const normalizeDate = (value: string) => {
    const parsed = parseISO(value);
    if (!isValid(parsed)) {
        throw new Error('Data de inicio invalida.');
    }
    return format(parsed, 'yyyy-MM-dd');
};

const hasDateOverlap = (
    candidateStart: string,
    candidateEnd: string,
    rowStart: string,
    rowEnd: string
) => candidateStart <= rowEnd && candidateEnd >= rowStart;

const formatDate = (value: Date) => format(value, 'yyyy-MM-dd');

export const salarySettingsService = {
    async getHistory() {
        const { data, error } = await supabase
            .from('settings_salary')
            .select('*')
            .order('date_start', { ascending: false });

        if (error) throw error;
        return (data ?? []) as SalarySetting[];
    },

    async getCurrent() {
        const today = formatDate(new Date());

        const { data, error } = await supabase
            .from('settings_salary')
            .select('*')
            .lte('date_start', today)
            .gte('date_end', today)
            .order('date_start', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        return (data as SalarySetting | null) ?? null;
    },

    async createSettingWithValidity(input: CreateSalarySettingInput) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) throw new Error('Not authenticated');

        const normalizedStartDate = normalizeDate(input.date_start);

        const { data: openSetting, error: openError } = await supabase
            .from('settings_salary')
            .select('*')
            .eq('user_id', user.id)
            .eq('date_end', OPEN_DATE_END)
            .order('date_start', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (openError && openError.code !== 'PGRST116') throw openError;

        const currentOpenSetting = (openSetting as SalarySetting | null) ?? null;

        if (currentOpenSetting && normalizedStartDate <= currentOpenSetting.date_start) {
            throw new Error(`A data de inicio deve ser maior que ${currentOpenSetting.date_start}.`);
        }

        let closedPrevious = false;
        try {
            if (currentOpenSetting) {
                const previousEndDate = formatDate(subDays(parseISO(normalizedStartDate), 1));
                const { error: closeError } = await supabase
                    .from('settings_salary')
                    .update({ date_end: previousEndDate })
                    .eq('user_id', user.id)
                    .eq('date_start', currentOpenSetting.date_start)
                    .eq('date_end', OPEN_DATE_END);

                if (closeError) throw closeError;
                closedPrevious = true;
            }

            const payload: SalarySetting = {
                user_id: user.id,
                date_start: normalizedStartDate,
                date_end: OPEN_DATE_END,
                hourly_rate: Number(input.hourly_rate),
                base_salary: Number(input.base_salary),
                inss_discount_percentage: Number(input.inss_discount_percentage),
                admin_fee_percentage: Number(input.admin_fee_percentage),
            };

            const { data, error } = await supabase
                .from('settings_salary')
                .insert(payload)
                .select('*')
                .single();

            if (error) throw error;
            return data as SalarySetting;
        } catch (error) {
            if (closedPrevious && currentOpenSetting) {
                await supabase
                    .from('settings_salary')
                    .update({ date_end: OPEN_DATE_END })
                    .eq('user_id', user.id)
                    .eq('date_start', currentOpenSetting.date_start);
            }

            throw error;
        }
    },

    async updateSetting(input: UpdateSalarySettingInput) {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) throw new Error('Not authenticated');

        const originalStartDate = normalizeDate(input.original_date_start);
        const originalEndDate = normalizeDate(input.original_date_end);
        const normalizedStartDate = normalizeDate(input.date_start);
        const normalizedEndDate = normalizeDate(input.date_end);

        if (normalizedStartDate > normalizedEndDate) {
            throw new Error('A data inicial nao pode ser maior que a data final.');
        }

        const { data: rows, error: rowsError } = await supabase
            .from('settings_salary')
            .select('date_start, date_end')
            .eq('user_id', user.id);

        if (rowsError) throw rowsError;

        const hasOverlap = (rows ?? []).some((row) => {
            const isSameRow = row.date_start === originalStartDate && row.date_end === originalEndDate;
            if (isSameRow) return false;
            return hasDateOverlap(normalizedStartDate, normalizedEndDate, row.date_start, row.date_end);
        });

        if (hasOverlap) {
            throw new Error('A vigencia informada sobrepoe outro periodo ja existente.');
        }

        const { data, error } = await supabase
            .from('settings_salary')
            .update({
                date_start: normalizedStartDate,
                date_end: normalizedEndDate,
                hourly_rate: Number(input.hourly_rate),
                base_salary: Number(input.base_salary),
                inss_discount_percentage: Number(input.inss_discount_percentage),
                admin_fee_percentage: Number(input.admin_fee_percentage),
            })
            .eq('user_id', user.id)
            .eq('date_start', originalStartDate)
            .eq('date_end', originalEndDate)
            .select('*')
            .single();

        if (error) throw error;
        return data as SalarySetting;
    },

    async deleteCurrentSettingAndRestorePrevious() {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) throw new Error('Not authenticated');

        const { data: currentOpenSetting, error: currentError } = await supabase
            .from('settings_salary')
            .select('*')
            .eq('user_id', user.id)
            .eq('date_end', OPEN_DATE_END)
            .limit(1)
            .maybeSingle();

        if (currentError && currentError.code !== 'PGRST116') throw currentError;

        const current = (currentOpenSetting as SalarySetting | null) ?? null;
        if (!current) {
            throw new Error('Nao existe vigencia atual para excluir.');
        }

        const { data: previousSetting, error: previousError } = await supabase
            .from('settings_salary')
            .select('*')
            .eq('user_id', user.id)
            .lt('date_start', current.date_start)
            .order('date_start', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (previousError && previousError.code !== 'PGRST116') throw previousError;

        const previous = (previousSetting as SalarySetting | null) ?? null;
        if (!previous) {
            throw new Error('Nao existe vigencia anterior para restaurar.');
        }

        let deletedCurrent = false;
        let reopenedPrevious = false;
        try {
            const { data: deletedRows, error: deleteError } = await supabase
                .from('settings_salary')
                .delete()
                .eq('user_id', user.id)
                .eq('date_start', current.date_start)
                .eq('date_end', OPEN_DATE_END)
                .select('date_start, date_end');

            if (deleteError) throw deleteError;
            if (!deletedRows || deletedRows.length === 0) {
                throw new Error('Nao foi possivel excluir a vigencia atual. Verifique a policy DELETE da tabela settings_salary.');
            }
            deletedCurrent = true;

            const { data: stillOpenSetting, error: stillOpenError } = await supabase
                .from('settings_salary')
                .select('date_start')
                .eq('user_id', user.id)
                .eq('date_end', OPEN_DATE_END)
                .limit(1)
                .maybeSingle();

            if (stillOpenError && stillOpenError.code !== 'PGRST116') throw stillOpenError;
            if (stillOpenSetting) {
                throw new Error('Ainda existe uma vigencia aberta. Nao foi possivel restaurar a anterior com seguranca.');
            }

            const { data: reopenedRows, error: reopenError } = await supabase
                .from('settings_salary')
                .update({ date_end: OPEN_DATE_END })
                .eq('user_id', user.id)
                .eq('date_start', previous.date_start)
                .eq('date_end', previous.date_end)
                .select('date_start, date_end');

            if (reopenError) throw reopenError;
            if (!reopenedRows || reopenedRows.length === 0) {
                throw new Error('Nao foi possivel restaurar a vigencia anterior.');
            }
            reopenedPrevious = true;

            return {
                ...previous,
                date_end: OPEN_DATE_END,
            } as SalarySetting;
        } catch (error) {
            if (deletedCurrent && !reopenedPrevious) {
                await supabase
                    .from('settings_salary')
                    .insert(current);
            }

            throw error;
        }
    },
};
