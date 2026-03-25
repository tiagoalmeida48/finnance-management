import { Button } from "@/shared/components/ui/button";
import { FormDialog } from "@/shared/components/composite/FormDialog";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Text } from "@/shared/components/ui/Text";
import {
  usePaymentConfirmModalLogic,
  type ConfirmPaymentValues,
} from "@/pages/transactions/hooks/usePaymentConfirmModalLogic";
import { Container } from "@/shared/components/layout/Container";

interface PaymentConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmPaymentValues) => void;
  title?: string;
  loading?: boolean;
}

export function PaymentConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  loading = false,
}: PaymentConfirmModalProps) {
  const {
    paymentConfirmMessages,
    commonMessages,
    accounts,
    register,
    errors,
    onSubmit,
  } = usePaymentConfirmModalLogic({ onConfirm });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      title={title ?? paymentConfirmMessages.title}
      titleClassName="font-bold"
      onSubmit={onSubmit}
      actionsClassName="p-3 pt-0"
      actions={
        <>
          <Button type="button" onClick={onClose} color="inherit">
            {commonMessages.actions.cancel}
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading
              ? commonMessages.states.confirming
              : paymentConfirmMessages.confirmButton}
          </Button>
        </>
      }
    >
      <Container unstyled className="mt-1 flex flex-col gap-3">
        <Text className="text-sm text-white/70">
          {paymentConfirmMessages.description}
        </Text>
        <FormField
          htmlFor="payment-confirm-account"
          label={paymentConfirmMessages.accountLabel}
          errorMessage={errors.account_id?.message}
        >
          <Select
            id="payment-confirm-account"
            {...register("account_id")}
            defaultValue=""
          >
            <option value="">
              {paymentConfirmMessages.accountPlaceholder}
            </option>
            {accounts?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          htmlFor="payment-confirm-date"
          label={paymentConfirmMessages.dateLabel}
          errorMessage={errors.payment_date?.message}
        >
          <Input
            id="payment-confirm-date"
            type="date"
            {...register("payment_date")}
          />
        </FormField>
      </Container>
    </FormDialog>
  );
}
