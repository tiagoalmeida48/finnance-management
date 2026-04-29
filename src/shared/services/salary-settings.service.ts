import { z } from 'zod';
import { format, isValid, parseISO, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { CreateSalarySettingInput, SalarySetting, UpdateSalarySettingInput } from '../interfaces';
import { SalarySettingSchema } from '../schemas';

const OPEN_DATE_END = '9999-12-31';

const normalizeDate = (value: string) => {
  const parsed = parseISO(value);
<<<<<<< HEAD
  if (!isValid(parsed)) throw new Error('Data de inicio invalida.');
=======
  if (!isValid(parsed)) {
    throw new Error('Data de inicio invalida.');
  }
>>>>>>> finnance-management/main
  return format(parsed, 'yyyy-MM-dd');
};

const hasDateOverlap = (
  candidateStart: string,
  candidateEnd: string,
  rowStart: string,
  rowEnd: string,
) => candidateStart <= rowEnd && candidateEnd >= rowStart;

const formatDate = (value: Date) => format(value, 'yyyy-MM-dd');

export const salarySettingsService = {
  async getHistory() {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('get_salary_history');
=======
    const { data, error } = await supabase
      .from('settings_salary')
      .select('*')
      .order('date_start', { ascending: false });

>>>>>>> finnance-management/main
    if (error) throw error;
    return z.array(SalarySettingSchema).parse(data ?? []);
  },

  async getCurrent() {
<<<<<<< HEAD
    const { data, error } = await supabase.rpc('get_salary_current');
    if (error && (error as { code?: string }).code !== 'PGRST116') throw error;
=======
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
>>>>>>> finnance-management/main
    return data ? SalarySettingSchema.parse(data) : null;
  },

  async createSettingWithValidity(input: CreateSalarySettingInput) {
<<<<<<< HEAD
    const normalizedStartDate = normalizeDate(input.date_start);

    const { data: openData, error: openError } = await supabase.rpc('get_salary_open');
    if (openError && (openError as { code?: string }).code !== 'PGRST116') throw openError;

    const currentOpenSetting = openData ? SalarySettingSchema.parse(openData) : null;

=======
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

    const currentOpenSetting = openSetting ? SalarySettingSchema.parse(openSetting) : null;

>>>>>>> finnance-management/main
    if (currentOpenSetting && normalizedStartDate <= currentOpenSetting.date_start) {
      throw new Error(`A data de inicio deve ser maior que ${currentOpenSetting.date_start}.`);
    }

    let closedPrevious = false;
    try {
      if (currentOpenSetting) {
        const previousEndDate = formatDate(subDays(parseISO(normalizedStartDate), 1));
<<<<<<< HEAD
        const { error: closeError } = await supabase.rpc('close_salary_setting', {
          p_date_start: currentOpenSetting.date_start,
          p_original_end: OPEN_DATE_END,
          p_new_end: previousEndDate,
        });
=======
        const { error: closeError } = await supabase
          .from('settings_salary')
          .update({ date_end: previousEndDate })
          .eq('user_id', user.id)
          .eq('date_start', currentOpenSetting.date_start)
          .eq('date_end', OPEN_DATE_END);

>>>>>>> finnance-management/main
        if (closeError) throw closeError;
        closedPrevious = true;
      }

<<<<<<< HEAD
      const { data, error } = await supabase.rpc('create_salary_setting', {
        p_date_start: normalizedStartDate,
        p_date_end: OPEN_DATE_END,
        p_hourly_rate: Number(input.hourly_rate),
        p_base_salary: Number(input.base_salary),
        p_inss_discount_percentage: Number(input.inss_discount_percentage),
        p_admin_fee_percentage: Number(input.admin_fee_percentage),
      });
=======
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

>>>>>>> finnance-management/main
      if (error) throw error;
      return SalarySettingSchema.parse(data);
    } catch (error) {
      if (closedPrevious && currentOpenSetting) {
<<<<<<< HEAD
        await supabase.rpc('close_salary_setting', {
          p_date_start: currentOpenSetting.date_start,
          p_original_end: formatDate(subDays(parseISO(normalizedStartDate), 1)),
          p_new_end: OPEN_DATE_END,
        });
=======
        await supabase
          .from('settings_salary')
          .update({ date_end: OPEN_DATE_END })
          .eq('user_id', user.id)
          .eq('date_start', currentOpenSetting.date_start);
>>>>>>> finnance-management/main
      }
      throw error;
    }
  },

  async updateSetting(input: UpdateSalarySettingInput) {
<<<<<<< HEAD
=======
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error('Not authenticated');

>>>>>>> finnance-management/main
    const originalStartDate = normalizeDate(input.original_date_start);
    const originalEndDate = normalizeDate(input.original_date_end);
    const normalizedStartDate = normalizeDate(input.date_start);
    const normalizedEndDate = normalizeDate(input.date_end);

    if (normalizedStartDate > normalizedEndDate) {
      throw new Error('A data inicial nao pode ser maior que a data final.');
    }

<<<<<<< HEAD
    const { data: rows, error: rowsError } = await supabase.rpc('get_salary_rows_by_user');
    if (rowsError) throw rowsError;

    const hasOverlap = (rows ?? []).some((row: { date_start: string; date_end: string }) => {
=======
    const { data: rows, error: rowsError } = await supabase
      .from('settings_salary')
      .select('date_start, date_end')
      .eq('user_id', user.id);

    if (rowsError) throw rowsError;

    const hasOverlap = (rows ?? []).some((row) => {
>>>>>>> finnance-management/main
      const isSameRow = row.date_start === originalStartDate && row.date_end === originalEndDate;
      if (isSameRow) return false;
      return hasDateOverlap(normalizedStartDate, normalizedEndDate, row.date_start, row.date_end);
    });

    if (hasOverlap) {
      throw new Error('A vigencia informada sobrepoe outro periodo ja existente.');
    }

<<<<<<< HEAD
    const { data, error } = await supabase.rpc('update_salary_setting', {
      p_original_start: originalStartDate,
      p_original_end: originalEndDate,
      p_date_start: normalizedStartDate,
      p_date_end: normalizedEndDate,
      p_hourly_rate: Number(input.hourly_rate),
      p_base_salary: Number(input.base_salary),
      p_inss_discount_percentage: Number(input.inss_discount_percentage),
      p_admin_fee_percentage: Number(input.admin_fee_percentage),
    });
=======
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

>>>>>>> finnance-management/main
    if (error) throw error;
    return SalarySettingSchema.parse(data);
  },

  async deleteCurrentSettingAndRestorePrevious() {
<<<<<<< HEAD
    const { data: openData, error: currentError } = await supabase.rpc('get_salary_open');
    if (currentError && (currentError as { code?: string }).code !== 'PGRST116') throw currentError;

    const current = openData ? SalarySettingSchema.parse(openData) : null;
    if (!current) throw new Error('Nao existe vigencia atual para excluir.');

    const { data: historyData, error: historyError } = await supabase.rpc('get_salary_history');
    if (historyError) throw historyError;

    const history = z.array(SalarySettingSchema).parse(historyData ?? []);
    const previous = history.find(
      (s) => s.date_start < current.date_start && s.date_end !== OPEN_DATE_END,
    ) ?? null;

    if (!previous) throw new Error('Nao existe vigencia anterior para restaurar.');
=======
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

    const current = currentOpenSetting ? SalarySettingSchema.parse(currentOpenSetting) : null;
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

    const previous = previousSetting ? SalarySettingSchema.parse(previousSetting) : null;
    if (!previous) {
      throw new Error('Nao existe vigencia anterior para restaurar.');
    }
>>>>>>> finnance-management/main

    let deletedCurrent = false;
    let reopenedPrevious = false;
    try {
<<<<<<< HEAD
      const { data: deletedRows, error: deleteError } = await supabase.rpc(
        'delete_salary_setting',
        { p_date_start: current.date_start, p_date_end: OPEN_DATE_END },
      );
      if (deleteError) throw deleteError;
      if (!deletedRows || (deletedRows as unknown[]).length === 0) {
        throw new Error('Nao foi possivel excluir a vigencia atual.');
      }
      deletedCurrent = true;

      const { data: stillOpen } = await supabase.rpc('get_salary_open');
      if (stillOpen) {
        throw new Error('Ainda existe uma vigencia aberta. Nao foi possivel restaurar a anterior.');
      }

      const { data: reopenedRows, error: reopenError } = await supabase.rpc(
        'reopen_salary_setting',
        { p_date_start: previous.date_start, p_date_end: previous.date_end },
      );
      if (reopenError) throw reopenError;
      if (!reopenedRows || (reopenedRows as unknown[]).length === 0) {
=======
      const { data: deletedRows, error: deleteError } = await supabase
        .from('settings_salary')
        .delete()
        .eq('user_id', user.id)
        .eq('date_start', current.date_start)
        .eq('date_end', OPEN_DATE_END)
        .select('date_start, date_end');

      if (deleteError) throw deleteError;
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error(
          'Nao foi possivel excluir a vigencia atual. Verifique a policy DELETE da tabela settings_salary.',
        );
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
        throw new Error(
          'Ainda existe uma vigencia aberta. Nao foi possivel restaurar a anterior com seguranca.',
        );
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
>>>>>>> finnance-management/main
        throw new Error('Nao foi possivel restaurar a vigencia anterior.');
      }
      reopenedPrevious = true;

<<<<<<< HEAD
      return { ...previous, date_end: OPEN_DATE_END } satisfies SalarySetting;
    } catch (error) {
      if (deletedCurrent && !reopenedPrevious) {
        await supabase.rpc('create_salary_setting', {
          p_date_start: current.date_start,
          p_date_end: current.date_end,
          p_hourly_rate: current.hourly_rate,
          p_base_salary: current.base_salary,
          p_inss_discount_percentage: current.inss_discount_percentage,
          p_admin_fee_percentage: current.admin_fee_percentage,
        });
=======
      return {
        ...previous,
        date_end: OPEN_DATE_END,
      } satisfies SalarySetting;
    } catch (error) {
      if (deletedCurrent && !reopenedPrevious) {
        await supabase.from('settings_salary').insert(current);
>>>>>>> finnance-management/main
      }
      throw error;
    }
  },
};
