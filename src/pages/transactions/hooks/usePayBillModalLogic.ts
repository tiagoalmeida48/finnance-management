import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAccounts } from "@/shared/hooks/api/useAccounts";
import { usePayBill } from "@/shared/hooks/api/useTransactions";
import { messages } from "@/shared/i18n/messages";

const payBillSchema = z.object({
  bank_account_id: z
    .string()
    .min(1, messages.cards.payBill.validation.accountRequired),
  payment_date: z
    .string()
    .min(1, messages.cards.payBill.validation.dateRequired),
});

export type PayBillFormValues = z.infer<typeof payBillSchema>;

interface UsePayBillModalLogicParams {
  onClose: () => void;
  cardId: string;
  cardName: string;
  statementMonth: string;
  transactionIds: string[];
  totalAmount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function usePayBillModalLogic({
  onClose,
  cardId,
  cardName,
  statementMonth,
  transactionIds,
  totalAmount,
}: UsePayBillModalLogicParams) {
  const payBillMessages = messages.cards.payBill;
  const commonMessages = messages.common;
  const { data: accounts } = useAccounts();
  const payBill = usePayBill();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PayBillFormValues>({
    resolver: zodResolver(payBillSchema),
    defaultValues: {
      bank_account_id: "",
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await payBill.mutateAsync({
        cardId,
        transactionIds,
        accountId: values.bank_account_id,
        paymentDate: values.payment_date,
        amount: totalAmount,
        description: payBillMessages.paymentDescription(
          cardName,
          statementMonth,
        ),
      });
      handleClose();
    } catch (error) {
      console.error("Error paying bill:", error);
    }
  });

  return {
    payBillMessages,
    commonMessages,
    accounts,
    formatCurrency,
    register,
    errors,
    onSubmit,
    handleClose,
    isSubmitting: payBill.isPending,
    totalAmountLabel: formatCurrency(totalAmount),
  };
}
