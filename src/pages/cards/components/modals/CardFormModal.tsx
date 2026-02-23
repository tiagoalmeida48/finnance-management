import { Button } from "@/shared/components/ui/button";
import { ColorPickerField } from "@/shared/components/forms/ColorPickerField";
import { FormDialog } from "@/shared/components/composite/FormDialog";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Row } from "@/shared/components/layout/Row";
import { Stack } from "@/shared/components/layout/Stack";
import { Text } from "@/shared/components/ui/Text";
import { TextareaField } from "@/shared/components/forms/TextareaField";
import { useCardFormModalLogic } from "@/pages/cards/hooks/useCardFormModalLogic";
import type { CreditCard } from "@/shared/interfaces/credit-card.interface";
import { messages } from "@/shared/i18n/messages";
import { CardLinkedAccountSelect } from "./cardFormFields";
import { Container } from "@/shared/components/layout/Container";

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
  card?: CreditCard;
}

export function CardFormModal({ open, onClose, card }: CardFormModalProps) {
  const {
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
    isEditing,
    isSaving,
    activeClosingDay,
    activeDueDay,
    cyclePeriodLabel,
    cancelLabel,
  } = useCardFormModalLogic({ open, onClose, card });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="max-w-[540px] rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)]"
      title={
        isEditing
          ? formMessages.modal.editTitle
          : formMessages.modal.createTitle
      }
      titleClassName="font-heading pb-1 text-[20px] font-bold text-[var(--color-text-primary)]"
      onSubmit={onSubmit}
      contentClassName="pb-3 pt-2"
      actionsClassName="gap-1 p-3 pt-0"
      actions={
        <>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="default"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            variant="default"
            size="default"
            className="shadow-[0_2px_8px_var(--overlay-primary-25)] hover:-translate-y-px hover:shadow-[0_4px_16px_var(--overlay-primary-30)] active:translate-y-0"
          >
            {isSaving && (
              <Text
                as="span"
                className="mr-1.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-background)] border-r-transparent"
              />
            )}
            {formMessages.actions.save}
          </Button>
        </>
      }
    >
      <Stack className="gap-2.5">
        <Row className="flex-col gap-2 sm:flex-row">
          <FormField
            label={formMessages.fields.cardName}
            errorMessage={errors.name?.message}
            className="flex-1"
          >
            <Input
              placeholder={formMessages.fields.cardNamePlaceholder}
              {...register("name")}
            />
          </FormField>

          <FormField
            label={formMessages.fields.linkedAccount}
            errorMessage={errors.bank_account_id?.message}
            className="flex-1"
          >
            <CardLinkedAccountSelect
              accounts={accounts}
              value={selectedAccountId}
              onChange={setBankAccountId}
              errorMessage={errors.bank_account_id?.message}
            />
          </FormField>
        </Row>

        <FormField label={formMessages.fields.creditLimit}>
          <Container unstyled className="relative">
            <Text
              as="span"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
            >
              R$
            </Text>
            <Input
              placeholder={formMessages.fields.creditLimitPlaceholder}
              className="pr-3 text-right"
              value={creditLimitDisplayValue}
              onChange={handleMoneyInput}
            />
          </Container>
        </FormField>

        {!isEditing ? (
          <Row className="gap-2">
            <FormField
              label={formMessages.fields.closingDay}
              className="flex-1"
            >
              <Input
                type="number"
                min={1}
                max={31}
                {...register("closing_day", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label={formMessages.fields.dueDay} className="flex-1">
              <Input
                type="number"
                min={1}
                max={31}
                {...register("due_day", { valueAsNumber: true })}
              />
            </FormField>
          </Row>
        ) : (
          <StatementCycleNotice
            closingDay={activeClosingDay}
            dueDay={activeDueDay}
            cyclePeriodLabel={cyclePeriodLabel}
          />
        )}

        <FormField label={formMessages.fields.notes}>
          <TextareaField
            rows={2}
            placeholder={formMessages.fields.notesPlaceholder}
            {...register("notes")}
          />
        </FormField>

        <Stack className="gap-1">
          <Label>{formMessages.fields.colorLabel}</Label>
          <ColorPickerField
            value={currentColor}
            onChange={setCardColor}
            title={formMessages.colorPicker.title}
            description={formMessages.colorPicker.description}
            className="rounded-[10px] border-[var(--overlay-white-06)] bg-[var(--overlay-white-03)] py-1"
          />
        </Stack>
      </Stack>
    </FormDialog>
  );
}

interface StatementCycleNoticeProps {
  closingDay: number | string;
  dueDay: number | string;
  cyclePeriodLabel: string | null;
}

function StatementCycleNotice({
  closingDay,
  dueDay,
  cyclePeriodLabel,
}: StatementCycleNoticeProps) {
  const cycleMessages = messages.cards.form.cycleNotice;

  return (
    <Stack className="rounded-[10px] border border-[var(--color-border)] bg-[var(--overlay-primary-08)] p-1.5">
      <Text className="mb-1 text-xs text-[var(--color-text-secondary)]">
        {cycleMessages.title}
      </Text>
      <Row className="mb-1 flex-col gap-1 sm:flex-row">
        <Text
          as="span"
          className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
        >
          {cycleMessages.closingDay(closingDay)}
        </Text>
        <Text
          as="span"
          className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
        >
          {cycleMessages.dueDay(dueDay)}
        </Text>
      </Row>
      <Text className="text-[11px] text-[var(--color-text-muted)]">
        {cyclePeriodLabel
          ? cycleMessages.period(cyclePeriodLabel)
          : cycleMessages.periodFallback}
      </Text>
      <Text className="mt-0.75 text-[11px] text-[var(--color-text-muted)]">
        {cycleMessages.hint}
      </Text>
    </Stack>
  );
}
