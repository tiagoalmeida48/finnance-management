import { CalendarRange, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { CollectionState } from '@/shared/components/composite/CollectionState';
import { FormDialog } from '@/shared/components/composite/FormDialog';
import { FormField } from '@/shared/components/forms/FormField';
import { Heading } from '@/shared/components/ui/Heading';
import { Input } from '@/shared/components/ui/input';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/layout/Table';
import { Text } from '@/shared/components/ui/Text';
import { TextareaField } from '@/shared/components/forms/TextareaField';
import { useCardStatementCycleHistoryLogic } from '@/pages/cards/hooks/useCardStatementCycleHistoryLogic';
import { messages } from '@/shared/i18n/messages';
import { colors } from '@/shared/theme';
import { CardStatementCycleHistoryRow } from './CardStatementCycleHistoryRow';
import { Container } from '@/shared/components/layout/Container';
import { useReprocessInvoices } from '@/shared/hooks/api/useCreditCards';
import { useToast } from '@/shared/contexts/useToast';

interface CardStatementCycleHistoryModalProps {
  cardId: string;
  cardName: string;
  fallbackClosingDay: number;
  fallbackDueDay: number;
  open: boolean;
  onClose: () => void;
}

const ReprocessInvoicesDialog = ({
  cardId,
  onClose,
}: {
  cardId: string;
  onClose: () => void;
}) => {
  const toast = useToast();
  const reprocessInvoices = useReprocessInvoices(cardId);
  const [fromDate, setFromDate] = useState<string>(
    () => new Date().toISOString().slice(0, 7) + '-01',
  );
  const [reprocessError, setReprocessError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fromDate) return;
    setReprocessError(null);
    try {
      await reprocessInvoices.mutateAsync(fromDate);
      toast.success(cycleHistoryMessages.actions.reprocessSuccess);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : cycleHistoryMessages.reprocess.error;
      setReprocessError(message);
    }
  };

  const cycleHistoryMessages = messages.cards.cycleHistory;

  return (
    <Dialog open onClose={onClose} maxWidth="sm">
      <DialogTitle className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
        {cycleHistoryMessages.reprocess.title}
      </DialogTitle>
      <DialogContent>
        <Text className="mb-3 text-sm text-[var(--color-text-secondary)]">
          {cycleHistoryMessages.reprocess.description}
        </Text>
        <FormField label={cycleHistoryMessages.reprocess.fromDateLabel}>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </FormField>
        {reprocessError ? (
          <Text className="mt-1 text-xs text-[var(--color-error)]">{reprocessError}</Text>
        ) : null}
      </DialogContent>
      <DialogActions className="gap-2">
        <Button onClick={onClose} variant="ghost">
          {messages.common.actions.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={reprocessInvoices.isPending || !fromDate}
          startIcon={<RefreshCw size={16} />}
        >
          {reprocessInvoices.isPending
            ? cycleHistoryMessages.actions.reprocessing
            : cycleHistoryMessages.actions.reprocessInvoices}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function CardStatementCycleHistoryModal({
  cardId,
  cardName,
  fallbackClosingDay,
  fallbackDueDay,
  open,
  onClose,
}: CardStatementCycleHistoryModalProps) {
  const cycleHistoryMessages = messages.cards.cycleHistory;
  const [reprocessDialogOpen, setReprocessDialogOpen] = useState(false);

  const {
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
    isDeleting,
  } = useCardStatementCycleHistoryLogic({
    cardId,
    fallbackClosingDay,
    fallbackDueDay,
    open,
    onClose,
  });

  const handleCloseReprocess = useCallback(() => {
    setReprocessDialogOpen(false);
  }, []);

  return (
    <>
      <Dialog open={open} onClose={closeHistoryDialog} fullWidth maxWidth="xl">
        <DialogTitle className="pb-2">
          <Row className="flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <Row className="items-center gap-2">
              <CalendarRange size={18} color={colors.accent} />
              <Stack>
                <Heading
                  level={3}
                  className="font-heading text-lg font-bold text-[var(--color-text-primary)]"
                >
                  {cycleHistoryMessages.title}
                </Heading>
                <Text className="text-xs text-[var(--color-text-muted)]">{cardName}</Text>
              </Stack>
            </Row>

            <Row className="items-center">
              <Button
                startIcon={<RefreshCw size={16} />}
                onClick={() => setReprocessDialogOpen(true)}
                size="small"
                variant="text"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-warning)]"
              >
                {cycleHistoryMessages.actions.reprocessInvoices}
              </Button>
              <Button
                startIcon={<Plus size={16} />}
                onClick={handleOpenCreate}
                size="small"
                variant="text"
                className="text-[var(--color-primary)]"
              >
                {cycleHistoryMessages.newValidity}
              </Button>
            </Row>
          </Row>
        </DialogTitle>

        <DialogContent className="pt-1">
          <Text className="mb-2 text-xs text-[var(--color-text-muted)]">
            {cycleHistoryMessages.description}
          </Text>

          <CollectionState
            isLoading={isLoading}
            isEmpty={orderedCycles.length === 0}
            loadingFallback={
              <Container unstyled className="flex justify-center py-4">
                <Container
                  unstyled
                  className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-r-transparent"
                />
              </Container>
            }
            emptyFallback={
              <Container
                unstyled
                className="rounded-xl border border-[var(--color-border)] p-3 text-center text-sm text-[var(--color-text-muted)]"
              >
                {cycleHistoryMessages.empty}
              </Container>
            }
          >
            <Container
              unstyled
              className="overflow-auto rounded-xl border border-[var(--color-border)]"
            >
              <Table>
                <TableHead>
                  <TableRow className="bg-[var(--overlay-white-02)]">
                    <TableHeaderCell className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.validity}
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.closing}
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.due}
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.status}
                    </TableHeaderCell>
                    <TableHeaderCell className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.notes}
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                      {cycleHistoryMessages.columns.actions}
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderedCycles.map((cycle) => (
                    <CardStatementCycleHistoryRow
                      key={cycle.id}
                      cycle={cycle}
                      isOnlyCycle={orderedCycles.length <= 1}
                      isMutating={isMutating}
                      onEdit={() => handleOpenEdit(cycle)}
                      onDelete={() => requestDelete(cycle.id)}
                      formatCycleRange={formatCycleRange}
                    />
                  ))}
                </TableBody>
              </Table>
            </Container>
          </CollectionState>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeHistoryDialog} variant="ghost">
            {cycleHistoryMessages.close}
          </Button>
        </DialogActions>
      </Dialog>

      <FormDialog
        open={dialogMode !== null}
        onClose={closeFormDialog}
        maxWidth="md"
        title={
          dialogMode === 'edit' ? cycleHistoryMessages.editTitle : cycleHistoryMessages.createTitle
        }
        onSubmit={submitForm}
        contentClassName="pb-3 pt-2"
        actionsClassName="gap-2"
        actions={
          <>
            <Button onClick={closeFormDialog} disabled={isMutating} variant="ghost">
              {messages.common.actions.cancel}
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? cycleHistoryMessages.actions.saving : cycleHistoryMessages.actions.save}
            </Button>
          </>
        }
      >
        <Stack className="gap-2">
          <Text className="text-xs text-[var(--color-text-muted)]">
            {dialogMode === 'edit'
              ? cycleHistoryMessages.editHint
              : cycleHistoryMessages.createHint}
          </Text>

          {dialogMode === 'create' ? (
            <FormField
              label={cycleHistoryMessages.fields.startDate}
              errorMessage={errors.date_start?.message}
            >
              <Input
                type="date"
                {...register('date_start')}
                className={errors.date_start ? 'border-[var(--color-error)]' : ''}
              />
            </FormField>
          ) : null}

          <Container unstyled className="grid gap-2 sm:grid-cols-2">
            <FormField
              label={cycleHistoryMessages.fields.closingDay}
              errorMessage={errors.closing_day?.message}
            >
              <Input
                type="number"
                min={1}
                max={31}
                {...register('closing_day', { valueAsNumber: true })}
                className={errors.closing_day ? 'border-[var(--color-error)]' : ''}
              />
            </FormField>
            <FormField
              label={cycleHistoryMessages.fields.dueDay}
              errorMessage={errors.due_day?.message}
            >
              <Input
                type="number"
                min={1}
                max={31}
                {...register('due_day', { valueAsNumber: true })}
                className={errors.due_day ? 'border-[var(--color-error)]' : ''}
              />
            </FormField>
          </Container>

          <FormField label={cycleHistoryMessages.fields.notes}>
            <TextareaField rows={2} {...register('notes')} />
          </FormField>

          {formError ? (
            <Text className="text-xs text-[var(--color-error)]">{formError}</Text>
          ) : null}
        </Stack>
      </FormDialog>

      <Dialog open={deleteConfirmId !== null} onClose={closeDeleteDialog} maxWidth="xs">
        <DialogTitle className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
          {cycleHistoryMessages.actions.deleteConfirmTitle}
        </DialogTitle>
        <DialogContent>
          <Text className="text-sm text-[var(--color-text-secondary)]">
            {cycleHistoryMessages.actions.deleteConfirmDescription}
          </Text>
          {formError ? (
            <Text className="mt-1 text-xs text-[var(--color-error)]">{formError}</Text>
          ) : null}
        </DialogContent>
        <DialogActions className="gap-2">
          <Button onClick={closeDeleteDialog} disabled={isMutating} variant="ghost">
            {messages.common.actions.cancel}
          </Button>
          <Button onClick={handleDelete} disabled={isMutating} variant="contained" color="error">
            {isDeleting
              ? cycleHistoryMessages.actions.deleting
              : cycleHistoryMessages.actions.confirm}
          </Button>
        </DialogActions>
      </Dialog>

      {reprocessDialogOpen && (
        <ReprocessInvoicesDialog cardId={cardId} onClose={handleCloseReprocess} />
      )}
    </>
  );
}
