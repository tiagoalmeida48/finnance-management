import { Card, CardContent } from "@/shared/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRightLeft, Clock } from "lucide-react";
import { messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/components/layout/Container";
import { Text } from "@/shared/components/ui/Text";

interface TransactionsSummaryProps {
  summaries: {
    income: number;
    expense: number;
    balance: number;
    pending: number;
  };
  isLoading: boolean;
}

export function TransactionsSummary({
  summaries,
  isLoading,
}: TransactionsSummaryProps) {
  const formatBRL = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const summaryCards = [
    {
      title: messages.transactions.summary.income,
      value: summaries.income,
      icon: TrendingUp,
      iconClass: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
      textClass: "text-[var(--color-success)]",
    },
    {
      title: messages.transactions.summary.expense,
      value: summaries.expense,
      icon: TrendingDown,
      iconClass: "bg-[var(--color-error)]/15 text-[var(--color-error)]",
      textClass: "text-[var(--color-error)]",
    },
    {
      title: messages.transactions.summary.balance,
      value: summaries.balance,
      icon: ArrowRightLeft,
      iconClass:
        summaries.balance >= 0
          ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
          : "bg-[var(--color-error)]/15 text-[var(--color-error)]",
      textClass:
        summaries.balance >= 0
          ? "text-[var(--color-success)]"
          : "text-[var(--color-error)]",
    },
    {
      title: messages.transactions.summary.pending,
      value: summaries.pending,
      icon: Clock,
      iconClass: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
      textClass: "text-[var(--color-warning)]",
    },
  ];

  return (
    <Container
      unstyled
      className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
    >
      {summaryCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="group relative cursor-default overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bgSecondary)]/95 shadow-md shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-border)] hover:bg-[var(--color-bgSecondary)] hover:shadow-xl hover:shadow-black/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="relative p-4 md:p-5">
              <Container unstyled className="flex flex-col gap-3">
                <Container
                  unstyled
                  className="flex items-center justify-between"
                >
                  <Text className="text-xs font-medium text-[var(--color-text-secondary)] md:text-[13px]">
                    {card.title}
                  </Text>
                  <Container
                    unstyled
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <Icon size={16} />
                  </Container>
                </Container>

                <Container unstyled>
                  {isLoading ? (
                    <Container
                      unstyled
                      className="h-8 w-2/3 animate-pulse rounded-lg bg-white/5"
                    />
                  ) : (
                    <Text
                      className={`text-xl font-bold tracking-tight md:text-2xl [font-family:var(--font-heading)] ${card.textClass}`}
                    >
                      {formatBRL(card.value)}
                    </Text>
                  )}
                </Container>
              </Container>
            </CardContent>
          </Card>
        );
      })}
    </Container>
  );
}
