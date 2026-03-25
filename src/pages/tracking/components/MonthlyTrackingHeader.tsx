import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface MonthlyTrackingHeaderProps {
  monthName: string;
  totalAmount: number;
  isSettled: boolean;
  settledText: string;
  pendingText: string;
  formatCurrency: (value: number) => string;
}

export function MonthlyTrackingHeader({
  monthName,
  totalAmount,
  isSettled,
  settledText,
  pendingText,
  formatCurrency,
}: MonthlyTrackingHeaderProps) {
  return (
    <Container unstyled className="mb-1.5 flex items-center justify-between">
      <Container unstyled className="flex min-w-0 items-center gap-1.5">
        <Text className="text-[1.1rem] font-bold capitalize text-[var(--color-text-primary)]">
          {monthName}
        </Text>
        <Text
          className={`text-sm font-bold ${
            isSettled
              ? "text-[var(--color-success)]"
              : "text-[var(--color-primary)]"
          }`}
        >
          {formatCurrency(totalAmount || 0)}
        </Text>
      </Container>

      <Text
        as="span"
        className={`inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-bold ${
          isSettled
            ? "border-[var(--overlay-success-35)] bg-[var(--color-greenBg)] text-[var(--color-success)]"
            : "border-[var(--overlay-warning-35)] bg-[var(--color-yellowBg)] text-[var(--color-warning)]"
        }`}
      >
        {isSettled ? settledText : pendingText}
      </Text>
    </Container>
  );
}
