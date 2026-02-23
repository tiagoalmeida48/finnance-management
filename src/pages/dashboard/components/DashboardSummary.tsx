import { Card, CardContent } from "@/shared/components/ui/card";
import { Wallet, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { messages } from "@/shared/i18n/messages";
import { Text } from "@/shared/components/ui/Text";
import { Heading } from "@/shared/components/ui/Heading";
import { Container } from "@/shared/components/layout/Container";

interface DashboardSummaryProps {
  stats:
    | {
        totalBalance: number;
        totalLimit: number;
        monthlyIncome: number;
        monthlyExpenses: number;
      }
    | undefined;
  isLoading: boolean;
}

export function DashboardSummary({ stats, isLoading }: DashboardSummaryProps) {
  const summaryMessages = messages.dashboard.summary;
  const formatBRL = (val: number) => {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(Math.abs(val));
    return val < 0 ? formatted.replace("R$", "R$ -") : formatted;
  };

  const cards = [
    {
      title: summaryMessages.totalBalance,
      value: stats?.totalBalance || 0,
      icon: Wallet,
      iconClass: "bg-[var(--color-accentGlow)] text-[var(--color-accent)]",
      topClass: "bg-[linear-gradient(90deg,var(--color-accent),transparent)]",
    },
    {
      title: summaryMessages.availableLimit,
      value: stats?.totalLimit || 0,
      icon: CreditCard,
      iconClass:
        "bg-[var(--overlay-secondary-10)] text-[var(--color-secondary)]",
      topClass:
        "bg-[linear-gradient(90deg,var(--color-secondary),transparent)]",
    },
    {
      title: summaryMessages.income,
      value: stats?.monthlyIncome || 0,
      icon: TrendingUp,
      iconClass: "bg-[var(--color-greenBg)] text-[var(--color-success)]",
      topClass: "bg-[linear-gradient(90deg,var(--color-success),transparent)]",
    },
    {
      title: summaryMessages.expense,
      value: stats?.monthlyExpenses || 0,
      icon: TrendingDown,
      iconClass: "bg-[var(--color-redBg)] text-[var(--color-error)]",
      topClass: "bg-[linear-gradient(90deg,var(--color-error),transparent)]",
      isNegative: true,
    },
  ];

  return (
    <Container unstyled className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Container unstyled key={idx}>
            <Card className="group relative overflow-hidden">
              <Container
                unstyled
                className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${card.topClass}`}
              />
              <CardContent className="p-6">
                <Container unstyled className="flex flex-col gap-4">
                  <Container
                    unstyled
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${card.iconClass}`}
                  >
                    <Icon size={20} />
                  </Container>
                  <Container unstyled>
                    <Text className="mb-0.5 text-[13px] font-medium text-[var(--color-text-muted)]">
                      {card.title}
                    </Text>
                    {isLoading ? (
                      <Container
                        unstyled
                        className="h-8 w-[120px] animate-pulse rounded bg-white/5"
                      />
                    ) : (
                      <Heading
                        level={3}
                        className={`font-heading text-2xl font-bold tracking-[-0.03em] ${card.isNegative ? "text-[var(--color-error)]" : "text-[var(--color-text-primary)]"}`}
                      >
                        {formatBRL(card.value)}
                      </Heading>
                    )}
                  </Container>
                </Container>
              </CardContent>
            </Card>
          </Container>
        );
      })}
    </Container>
  );
}
