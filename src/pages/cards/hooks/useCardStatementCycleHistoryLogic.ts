import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  useCardStatementCycles,
  useCreateCardStatementCycle,
  useDeleteCardStatementCycle,
  useUpdateCardStatementCycle,
} from '@/shared/hooks/api/useCreditCards';
import type { CreditCardStatementCycle } from '@/shared/interfaces';
import { OPEN_CYCLE_END } from '@/shared/utils/card-statement-cycle.utils';
import { messages } from '@/shared/i18n/messages';

const cycleHistoryMessages = messages.cards.cycleHistory;

const cycleSchema = z.object({
  date_start: z.string().optional(),
  closing_day: z
    .number()
    .min(1, cycleHistoryMessages.errors.invalidDay)
    .max(31, cycleHistoryMessages.errors.invalidDay),
  due_day: z
    .number()
    .min(1, cycleHistoryMessages.errors.invalidDay)
    .max(31, cycleHistoryMessages.errors.invalidDay),
  notes: z.string().optional(),
});

type CycleFormValues = z.infer<typeof cycleSchema>;
type CycleDialogMode = 'create' | 'edit' | null;

interface UseCardStatementCycleHistoryLogicParams {
  cardId: string;
  fallbackClosingDay: number;
  fallbackDueDay: number;
  open: boolean;
  onClose: () => void;
}

const formatDateBR = (value: string) => format(new Date(`${value}T12:00:00`), 'dd/MM/yyyy');

const formatCycleRange = (cycle: CreditCardStatementCycle) => {
  const start = formatDateBR(cycle.date_start);
  if (cycle.date_end === OPEN_CYCLE_END) {
    return cycleHistoryMessages.dateOnward(start);
  }
  return cycleHistoryMessages.dateUntil(start, formatDateBR(cycle.date_end));
};

export function useCardStatementCycleHistoryLogic({
  cardId,
  fallbackClosingDay,
  fallbackDueDay,
  open,
  onClose,
}: UseCardStatementCycleHistoryLogicParams) {
  const { data: cycles = [], isLoading } = useCardStatementCycles(cardId, open);
  const createCycle = useCreateCardStatementCycle(cardId);
  const updateCycle = useUpdateCardStatementCycle(cardId);
  const deleteCycle = useDeleteCardStatementCycle(cardId);

  const [dialogMode, setDialogMode] = useState<CycleDialogMode>(null);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isMutating = createCycle.isPending || updateCycle.isPending || deleteCycle.isPending;

  const orderedCycles = useMemo(
    () => [...cycles].sort((a, b) => b.date_start.localeCompare(a.date_start)),
    [cycles],
  );

  const currentCycle = useMemo(
    () => orderedCycles.find((cycle) => cycle.date_end === OPEN_CYCLE_END) || null,
    [orderedCycles],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      date_start: format(new Date(), 'yyyy-MM-dd'),
      closing_day: fallbackClosingDay,
      due_day: fallbackDueDay,
      notes: '',
    },
  });

  const handleOpenCreate = useCallback(() => {
    setFormError(null);
    reset({
      date_start: format(new Date(), 'yyyy-MM-dd'),
      closing_day: currentCycle?.closing_day ?? fallbackClosingDay,
      due_day: currentCycle?.due_day ?? fallbackDueDay,
      notes: '',
    });
    setDialogMode('create');
  }, [currentCycle, fallbackClosingDay, fallbackDueDay, reset]);

  const handleOpenEdit = useCallback(
    (cycle: CreditCardStatementCycle) => {
      setFormError(null);
      setEditingCycleId(cycle.id);
      reset({
        closing_day: cycle.closing_day,
        due_day: cycle.due_day,
        notes: cycle.notes || '',
      });
      setDialogMode('edit');
    },
    [reset],
  );

  const closeFormDialog = useCallback(() => {
    if (isMutating) return;
    setDialogMode(null);
    setEditingCycleId(null);
  }, [isMutating]);

  const closeHistoryDialog = useCallback(() => {
    if (isMutating) return;
    setDialogMode(null);
    setEditingCycleId(null);
    setDeleteConfirmId(null);
    setFormError(null);
    onClose();
  }, [isMutating, onClose]);

  const requestDelete = useCallback((cycleId: string) => {
    setDeleteConfirmId(cycleId);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (isMutating) return;
    setDeleteConfirmId(null);
    setFormError(null);
  }, [isMutating]);

  const submitForm = handleSubmit(async (values) => {
    setFormError(null);

    try {
      if (dialogMode === 'create') {
        await createCycle.mutateAsync({
          date_start: values.date_start || format(new Date(), 'yyyy-MM-dd'),
          closing_day: values.closing_day,
          due_day: values.due_day,
          notes: values.notes?.trim() || undefined,
        });
      } else if (dialogMode === 'edit' && editingCycleId) {
        await updateCycle.mutateAsync({
          id: editingCycleId,
          updates: {
            closing_day: values.closing_day,
            due_day: values.due_day,
            notes: values.notes?.trim() || undefined,
          },
        });
      }

      setDialogMode(null);
      setEditingCycleId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : cycleHistoryMessages.errors.saveFailed;
      setFormError(message);
    }
  });

  const handleDelete = useCallback(async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteCycle.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : cycleHistoryMessages.errors.deleteFailed;
      setFormError(message);
    }
  }, [deleteConfirmId, deleteCycle]);

  return {
    cycleHistoryMessages,
    orderedCycles,
    isLoading,
    isMutating,
    dialogMode,
    deleteConfirmId,
    formError,
    register,
    errors,
    submitForm,
    handleOpenCreate,
    handleOpenEdit,
    closeFormDialog,
    closeHistoryDialog,
    closeDeleteDialog,
    requestDelete,
    handleDelete,
    formatCycleRange,
    isDeleting: deleteCycle.isPending,
  };
}
