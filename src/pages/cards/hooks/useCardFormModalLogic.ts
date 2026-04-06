import { useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCreditCard, useUpdateCreditCard } from '@/shared/hooks/api/useCreditCards';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import type { CreditCard } from '@/shared/interfaces/credit-card.interface';
import { OPEN_CYCLE_END } from '@/shared/utils/card-statement-cycle.utils';
import { messages } from '@/shared/i18n/messages';

const DEFAULT_CARD_COLOR = '#c9a84c';

const cardSchema = z.object({
  name: z.string().min(3, messages.cards.form.validation.nameMin),
  bank_account_id: z.string().min(1, messages.cards.form.validation.accountRequired),
  credit_limit: z.number().min(0, messages.cards.form.validation.positiveLimit),
  closing_day: z.number().min(1).max(31),
  due_day: z.number().min(1).max(31),
  color: z.string().min(1, messages.cards.form.validation.colorRequired),
  notes: z.string().optional(),
});

export type CardFormValues = z.infer<typeof cardSchema>;

interface UseCardFormModalLogicParams {
  open: boolean;
  onClose: () => void;
  card?: CreditCard;
}

const formatCycleDateLabel = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('pt-BR');
};

const formatMoneyInputValue = (raw: string) => {
  const numericValue = parseInt(raw || '0', 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export function useCardFormModalLogic({ open, onClose, card }: UseCardFormModalLogicParams) {
  const formMessages = messages.cards.form;
  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: '',
      bank_account_id: '',
      credit_limit: 0,
      closing_day: 1,
      due_day: 10,
      color: DEFAULT_CARD_COLOR,
      notes: '',
    },
  });

  const currentColor = useWatch({
    control,
    name: 'color',
    defaultValue: DEFAULT_CARD_COLOR,
  });

  const creditLimit = useWatch({
    control,
    name: 'credit_limit',
    defaultValue: 0,
  });

  const selectedAccountId = useWatch({
    control,
    name: 'bank_account_id',
    defaultValue: '',
  });

  const currentCycle = card?.current_statement_cycle ?? null;
  const activeClosingDay = currentCycle?.closing_day ?? '-';
  const activeDueDay = currentCycle?.due_day ?? '-';

  const cyclePeriodLabel = useMemo(() => {
    if (!currentCycle) return null;
    const cycleMessages = formMessages.cycleNotice;
    const start = formatCycleDateLabel(currentCycle.date_start);
    if (currentCycle.date_end === OPEN_CYCLE_END) {
      return `${start} ${cycleMessages.onward}`;
    }
    return `${start} ${cycleMessages.until(formatCycleDateLabel(currentCycle.date_end))}`;
  }, [currentCycle, formMessages.cycleNotice]);

  useEffect(() => {
    if (!open) return;
    const cardColor = card?.color || DEFAULT_CARD_COLOR;
    const limitValue = Number(card?.credit_limit) || 0;
    reset({
      name: card?.name || '',
      bank_account_id: card?.bank_account_id || '',
      credit_limit: limitValue,
      closing_day: card?.closing_day ?? currentCycle?.closing_day ?? 1,
      due_day: card?.due_day ?? currentCycle?.due_day ?? 10,
      color: cardColor,
      notes: card?.notes || '',
    });
  }, [card, currentCycle?.closing_day, currentCycle?.due_day, open, reset]);

  const setBankAccountId = (value: string) => {
    setValue('bank_account_id', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const setCardColor = (value: string) => {
    setValue('color', value, { shouldDirty: true });
  };

  const handleMoneyInput = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '');
    const numericValue = parseInt(digits || '0', 10) / 100;
    setValue('credit_limit', numericValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const creditLimitDisplayValue = formatMoneyInputValue(
    String(Math.round(Number(creditLimit || 0) * 100)),
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (card) {
        await updateCard.mutateAsync({
          id: card.id,
          updates: {
            name: values.name,
            bank_account_id: values.bank_account_id,
            credit_limit: values.credit_limit,
            color: values.color,
            notes: values.notes,
          },
        });
      } else {
        await createCard.mutateAsync({
          ...values,
          is_active: true,
        });
      }
      onClose();
    } catch {
      //
    }
  });

  return {
    formMessages,
    accounts,
    register,
    errors,
    selectedAccountId,
    setBankAccountId,
    currentColor,
    setCardColor,
    creditLimitDisplayValue,
    handleMoneyInput,
    onSubmit,
    isEditing: Boolean(card),
    isSaving: createCard.isPending || updateCard.isPending,
    activeClosingDay,
    activeDueDay,
    cyclePeriodLabel,
    cancelLabel: messages.common.actions.cancel,
  };
}
