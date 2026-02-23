import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

const batchChangeDayMessages = messages.transactions.batchChangeDayModal;
const commonMessages = messages.common;

const batchChangeDaySchema = z.object({
  day: z
    .number()
    .int()
    .min(1, batchChangeDayMessages.dayValidation)
    .max(31, batchChangeDayMessages.dayValidation),
});

type BatchChangeDayValues = z.infer<typeof batchChangeDaySchema>;

interface BatchChangeDayModalProps {
  open: boolean;
  selectedCount: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (day: number) => void | Promise<void>;
}

export function BatchChangeDayModal({
  open,
  selectedCount,
  loading = false,
  onClose,
  onConfirm,
}: BatchChangeDayModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchChangeDayValues>({
    resolver: zodResolver(
      batchChangeDaySchema,
    ) as Resolver<BatchChangeDayValues>,
    defaultValues: {
      day: new Date().getDate(),
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({ day: new Date().getDate() });
  }, [open, reset]);

  const handleConfirm = (values: BatchChangeDayValues) => {
    onConfirm(values.day);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle className="font-bold">
        {batchChangeDayMessages.title}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleConfirm)}>
        <DialogContent>
          <Container unstyled className="mt-1 flex flex-col gap-2">
            <Text className="text-sm text-white/70">
              {batchChangeDayMessages.description(selectedCount)}
            </Text>
            <Container unstyled className="space-y-1">
              <Label htmlFor="batch-change-day">
                {batchChangeDayMessages.dayFieldLabel}
              </Label>
              <Input
                id="batch-change-day"
                type="number"
                min={1}
                max={31}
                aria-invalid={!!errors.day}
                {...register("day", { valueAsNumber: true })}
              />
              {errors.day?.message && (
                <Text className="text-xs text-red-400">
                  {errors.day.message}
                </Text>
              )}
            </Container>
          </Container>
        </DialogContent>
        <DialogActions className="p-3">
          <Button onClick={onClose} color="inherit">
            {commonMessages.actions.cancel}
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading
              ? commonMessages.states.applying
              : commonMessages.actions.apply}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
