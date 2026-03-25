import { CustomSelect } from "@/shared/components/ui/custom-select";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import type {
  Account,
  Category,
  CreditCard,
  Transaction,
} from "@/shared/interfaces";
import type { TransactionFormValues } from "@/pages/transactions/hooks/useTransactionFormLogic";
import { TransactionDateField } from "./TransactionDateField";
import { messages } from "@/shared/i18n/messages";
import {
  Banknote,
  CreditCard as CreditCardIcon,
  ScanBarcode,
  ArrowRightLeft,
} from "lucide-react";
import { getCategoryIcon } from "@/pages/categories/components/categoryIcons";
import { getAccountTypeIcon } from "@/shared/constants/accountTypes";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface TransactionPaymentSectionProps {
  isMobile: boolean;
  transaction?: Transaction;
  paymentMethod?: string;
  register: UseFormRegister<TransactionFormValues>;
  control: Control<TransactionFormValues>;
  watch: UseFormWatch<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  categories: Category[];
  filteredCategories: Category[];
  accounts: Account[];
  cards: CreditCard[];
}

export function TransactionPaymentSection({
  isMobile,
  control,
  watch,
  errors,
  filteredCategories,
  accounts,
  cards,
}: TransactionPaymentSectionProps) {
  const labelClass =
    "mb-1 block text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]";

  const paymentMethod = watch("payment_method");

  const paymentGridClass = isMobile
    ? "grid-cols-1"
    : paymentMethod === "credit"
      ? "grid-cols-3"
      : "grid-cols-2";

  const paymentMethodOptions = [
    {
      value: "money",
      label: messages.transactions.form.payment.methodMoney,
      icon: <Banknote size={16} />,
    },
    {
      value: "debit",
      label: messages.transactions.form.payment.methodDebit,
      icon: <CreditCardIcon size={16} />,
    },
    {
      value: "credit",
      label: messages.transactions.form.payment.methodCredit,
      icon: <CreditCardIcon size={16} />,
    },
    {
      value: "pix",
      label: messages.transactions.form.payment.methodPix,
      icon: <ArrowRightLeft size={16} />,
    },
    {
      value: "bill_payment",
      label: messages.transactions.form.payment.methodBillPayment,
      icon: <ScanBarcode size={16} />,
    },
  ];

  return (
    <Container unstyled className="mb-2">
      <Text className="mb-1.5 border-b border-[var(--overlay-white-04)] pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
        {messages.transactions.form.payment.sectionTitle}
      </Text>

      <Container
        unstyled
        className={`mb-2 flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}
      >
        <Container unstyled className="flex-[1.5]">
          <label className={labelClass}>
            {messages.transactions.form.payment.paymentMethodLabel}
          </label>
          <Controller
            name="payment_method"
            control={control}
            defaultValue="debit"
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={paymentMethodOptions}
              />
            )}
          />
        </Container>

        <Container unstyled className="flex-1">
          <label className={labelClass}>
            {messages.transactions.form.payment.categoryLabel}
          </label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => {
              const categoryOptions = filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return {
                  value: category.id,
                  label: category.name,
                  icon: <Icon size={16} />,
                  color: category.color,
                };
              });

              return (
                <CustomSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={categoryOptions}
                  placeholder={
                    messages.transactions.form.payment.selectPlaceholder
                  }
                />
              );
            }}
          />
        </Container>
      </Container>

      <Container unstyled className={`grid gap-2 ${paymentGridClass}`}>
        <Container unstyled>
          <label className={labelClass}>
            {messages.transactions.form.payment.accountLabel}
          </label>
          <Controller
            name="account_id"
            control={control}
            render={({ field }) => {
              const accountOptions = accounts.map((account) => {
                const Icon = getAccountTypeIcon(account.type);
                return {
                  value: account.id,
                  label: account.name,
                  icon: <Icon size={16} />,
                  color: account.color,
                };
              });

              return (
                <CustomSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={accountOptions}
                  placeholder={
                    messages.transactions.form.payment.selectWithDotsPlaceholder
                  }
                  error={!!errors.account_id}
                />
              );
            }}
          />
          {errors.account_id && (
            <Text className="mt-1 text-xs text-[var(--color-error)]">
              {String(errors.account_id.message ?? "")}
            </Text>
          )}
        </Container>

        {paymentMethod === "credit" && (
          <Container unstyled>
            <label className={labelClass}>
              {messages.transactions.form.payment.cardLabel}
            </label>
            <Controller
              name="card_id"
              control={control}
              render={({ field }) => {
                const cardOptions = cards.map((card) => ({
                  value: card.id,
                  label: card.name,
                  icon: <CreditCardIcon size={16} />,
                  color: card.color,
                }));

                return (
                  <CustomSelect
                    value={field.value || ""}
                    onChange={field.onChange}
                    options={cardOptions}
                    disabled={!watch("account_id")}
                    placeholder={
                      messages.transactions.form.payment
                        .selectWithDotsPlaceholder
                    }
                    error={!!errors.card_id}
                  />
                );
              }}
            />
          </Container>
        )}

        <Container unstyled>
          <label className={labelClass}>
            {paymentMethod === "credit"
              ? messages.transactions.form.payment.purchaseDateLabel
              : messages.transactions.form.payment.dateLabel}
          </label>
          <TransactionDateField control={control} />
        </Container>
      </Container>
    </Container>
  );
}
