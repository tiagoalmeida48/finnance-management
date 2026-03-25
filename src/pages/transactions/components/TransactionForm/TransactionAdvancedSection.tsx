import { colors } from "@/shared/theme";
import type { Transaction } from "@/shared/interfaces";
import type { TransactionFormValues } from "@/pages/transactions/hooks/useTransactionFormLogic";
import type { UseFormRegister } from "react-hook-form";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { toggleConfig } from "./transactionFormStyles";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";
import { Circle, CheckCircle2 } from "lucide-react";

interface TransactionAdvancedSectionProps {
  isFixed: boolean;
  isInstallment: boolean;
  amount: number;
  totalInstallments: number;
  transaction?: Transaction;
  applyToGroup: boolean;
  setApplyToGroup: (value: boolean) => void;
  register: UseFormRegister<TransactionFormValues>;
}

export function TransactionAdvancedSection({
  isFixed,
  isInstallment,
  amount,
  totalInstallments,
  transaction,
  applyToGroup,
  setApplyToGroup,
  register,
}: TransactionAdvancedSectionProps) {
  const RecurringIcon = toggleConfig.recurring.icon;
  const InstallmentIcon = toggleConfig.installment.icon;

  return (
    <Container unstyled>
      <Container unstyled className="mb-2 flex gap-1.5">
        <Container
          unstyled
          className={`flex-1 rounded-[10px] border bg-white/[0.03] p-1.5 transition-all duration-200 hover:bg-white/[0.05] ${
            isFixed
              ? "border-[var(--color-blue)]"
              : "border-[var(--overlay-white-06)]"
          }`}
        >
          <Container
            unstyled
            className="flex items-center justify-between relative group"
          >
            <Container unstyled className="flex items-center gap-1.5">
              <RecurringIcon
                size={16}
                color={
                  isFixed
                    ? toggleConfig.recurring.activeColor
                    : colors.textMuted
                }
              />
              <Text
                className={`text-[13px] font-medium ${isFixed ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
              >
                {toggleConfig.recurring.label}
              </Text>
            </Container>
            <Container
              unstyled
              className="relative flex items-center justify-center p-0.5"
            >
              <input
                {...register("is_fixed")}
                type="checkbox"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {isFixed ? (
                <CheckCircle2
                  size={16}
                  className="text-[var(--color-warning)] transition-colors group-hover:brightness-90"
                />
              ) : (
                <Circle
                  size={16}
                  className="text-[var(--overlay-white-30)] transition-colors group-hover:text-[var(--overlay-white-50)]"
                />
              )}
            </Container>
          </Container>
        </Container>

        <Container
          unstyled
          className={`flex-1 rounded-[10px] border bg-white/[0.03] p-1.5 transition-all duration-200 hover:bg-white/[0.05] ${
            isInstallment
              ? "border-[var(--color-secondary)]"
              : "border-[var(--overlay-white-06)]"
          }`}
        >
          <Container
            unstyled
            className="flex items-center justify-between relative group"
          >
            <Container unstyled className="flex items-center gap-1.5">
              <InstallmentIcon
                size={16}
                color={
                  isInstallment
                    ? toggleConfig.installment.activeColor
                    : colors.textMuted
                }
              />
              <Text
                className={`text-[13px] font-medium ${isInstallment ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
              >
                {toggleConfig.installment.label}
              </Text>
            </Container>
            <Container
              unstyled
              className="relative flex items-center justify-center p-0.5"
            >
              <input
                {...register("is_installment")}
                type="checkbox"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {isInstallment ? (
                <CheckCircle2
                  size={16}
                  className="text-[var(--color-warning)] transition-colors group-hover:brightness-90"
                />
              ) : (
                <Circle
                  size={16}
                  className="text-[var(--overlay-white-30)] transition-colors group-hover:text-[var(--overlay-white-50)]"
                />
              )}
            </Container>
          </Container>
        </Container>
      </Container>

      {isFixed && !isInstallment && !transaction && (
        <Container unstyled className="mb-2">
          <Label className="mb-0.75 block text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
            {messages.transactions.form.advanced.repeatMonthsLabel}
          </Label>
          <Input
            type="number"
            placeholder={messages.transactions.form.advanced.repeatPlaceholder}
            {...register("repeat_count")}
          />
        </Container>
      )}

      {isInstallment && (
        <Container unstyled className="mb-2 space-y-2">
          <Container unstyled>
            <Label className="mb-0.75 block text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
              {messages.transactions.form.advanced.totalInstallmentsLabel}
            </Label>
            <Input
              type="number"
              placeholder={
                messages.transactions.form.advanced.repeatPlaceholder
              }
              {...register("total_installments")}
            />
            {amount > 0 && totalInstallments > 0 && (
              <Text className="mt-0.5 text-xs text-[var(--color-accent)]">
                {messages.transactions.form.advanced.installmentsSummary(
                  totalInstallments,
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(amount / totalInstallments),
                )}
              </Text>
            )}
          </Container>
        </Container>
      )}

      {transaction &&
        (transaction.installment_group_id ||
          transaction.recurring_group_id) && (
          <Container
            unstyled
            className="mb-2 flex items-center justify-between group relative"
          >
            <Text className="text-[13px] text-[var(--color-text-secondary)]">
              {messages.transactions.form.advanced.applyToGroupLabel}
            </Text>
            <Container
              unstyled
              className="relative flex items-center justify-center p-0.5"
            >
              <input
                checked={applyToGroup}
                onChange={(event) => setApplyToGroup(event.target.checked)}
                type="checkbox"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {applyToGroup ? (
                <CheckCircle2
                  size={16}
                  className="text-[var(--color-warning)] transition-colors group-hover:brightness-90"
                />
              ) : (
                <Circle
                  size={16}
                  className="text-[var(--overlay-white-30)] transition-colors group-hover:text-[var(--overlay-white-50)]"
                />
              )}
            </Container>
          </Container>
        )}
    </Container>
  );
}
