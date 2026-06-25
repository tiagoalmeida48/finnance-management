import { useCallback, useMemo, useState } from 'react';
import {
  useCardCycles,
  useCreateCycle,
  useDeleteCycle,
  useInsertCycle,
  useUpdateCycle,
  useUpdateCycleEnd,
  useUpdateCycleStart,
} from './useCardCycles';
import type { StatementCycle } from '../types/cards.types';

export interface CycleFormValues {
  dateStart: string;
  dateEnd: string;
  closingDay: number;
  dueDay: number;
  notes: string;
}

type FormMode = 'create' | 'edit' | null;

const emptyForm: CycleFormValues = {
  dateStart: new Date().toISOString().slice(0, 10),
  dateEnd: '',
  closingDay: 1,
  dueDay: 10,
  notes: '',
};

export function useCardCyclesLogic(card: number, fallbackClosingDay: number, fallbackDueDay: number) {
  const cyclesQuery = useCardCycles(card);
  const createCycle = useCreateCycle(card);
  const insertCycle = useInsertCycle(card);
  const updateStart = useUpdateCycleStart(card);
  const updateEnd = useUpdateCycleEnd(card);
  const updateCycle = useUpdateCycle(card);
  const deleteCycle = useDeleteCycle(card);

  const [mode, setMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<StatementCycle | null>(null);
  const [form, setForm] = useState<CycleFormValues>(emptyForm);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<StatementCycle | null>(null);

  const cycles = useMemo<StatementCycle[]>(() => {
    const data = cyclesQuery.data ?? [];
    return [...data].sort((a, b) => b.dateStart.localeCompare(a.dateStart));
  }, [cyclesQuery.data]);

  const hasCycles = cycles.length > 0;
  const isMutating =
    createCycle.isPending ||
    insertCycle.isPending ||
    updateStart.isPending ||
    updateEnd.isPending ||
    updateCycle.isPending;

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({
      ...emptyForm,
      dateStart: new Date().toISOString().slice(0, 10),
      closingDay: fallbackClosingDay || 1,
      dueDay: fallbackDueDay || 10,
    });
    setError('');
    setMode('create');
  }, [fallbackClosingDay, fallbackDueDay]);

  const openEdit = useCallback((cycle: StatementCycle) => {
    setEditing(cycle);
    setForm({
      dateStart: cycle.dateStart.slice(0, 10),
      dateEnd: cycle.dateEnd ? cycle.dateEnd.slice(0, 10) : '',
      closingDay: cycle.closingDay,
      dueDay: cycle.dueDay,
      notes: cycle.notes ?? '',
    });
    setError('');
    setMode('edit');
  }, []);

  const closeForm = useCallback(() => setMode(null), []);

  const updateForm = useCallback(
    (patch: Partial<CycleFormValues>) => setForm((prev) => ({ ...prev, ...patch })),
    [],
  );

  const validate = (): boolean => {
    if (form.closingDay < 1 || form.closingDay > 31) {
      setError('O dia de fechamento deve estar entre 1 e 31.');
      return false;
    }
    if (form.dueDay < 1 || form.dueDay > 31) {
      setError('O dia de vencimento deve estar entre 1 e 31.');
      return false;
    }
    if (mode === 'create' && !form.dateStart) {
      setError('Informe a data inicial da vigência.');
      return false;
    }
    setError('');
    return true;
  };

  const submit = useCallback(() => {
    if (!validate()) return;

    if (mode === 'create') {
      const payload = {
        card,
        dateStart: form.dateStart,
        closingDay: form.closingDay,
        dueDay: form.dueDay,
        notes: form.notes,
      };
      const mutation = hasCycles ? insertCycle : createCycle;
      mutation.mutate(payload, { onSuccess: () => setMode(null) });
      return;
    }

    if (mode === 'edit' && editing) {
      const target = editing;
      const detailsChanged =
        target.closingDay !== form.closingDay ||
        target.dueDay !== form.dueDay ||
        (target.notes ?? '') !== form.notes;

      const finishEdit = () => {
        if (!detailsChanged) {
          setMode(null);
          return;
        }
        updateCycle.mutate(
          {
            creditCardStatementCycle: target.creditCardStatementCycle,
            closingDay: form.closingDay,
            dueDay: form.dueDay,
            notes: form.notes,
          },
          { onSuccess: () => setMode(null) },
        );
      };

      updateStart.mutate(
        { cycle: target.creditCardStatementCycle, dateStart: form.dateStart },
        {
          onSuccess: () => {
            if (form.dateEnd) {
              updateEnd.mutate(
                { cycle: target.creditCardStatementCycle, dateEnd: form.dateEnd },
                { onSuccess: finishEdit },
              );
            } else {
              finishEdit();
            }
          },
        },
      );
    }
  }, [card, createCycle, editing, form, hasCycles, insertCycle, mode, updateCycle, updateEnd, updateStart]);

  const requestDelete = useCallback((cycle: StatementCycle) => setPendingDelete(cycle), []);

  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteCycle.mutate(pendingDelete.creditCardStatementCycle, {
      onSuccess: () => setPendingDelete(null),
    });
  }, [pendingDelete, deleteCycle]);

  return {
    cycles,
    isLoading: cyclesQuery.isLoading,
    mode,
    editing,
    form,
    error,
    isMutating,
    pendingDelete,
    isDeleting: deleteCycle.isPending,
    openCreate,
    openEdit,
    closeForm,
    updateForm,
    submit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
