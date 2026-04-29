import { Card, CardContent } from '@/shared/components/ui/card';
<<<<<<< HEAD
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
=======
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
>>>>>>> finnance-management/main
import { messages } from '@/shared/i18n/messages';
import { Text } from '@/shared/components/ui/Text';
import { Heading } from '@/shared/components/ui/Heading';
import { Container } from '@/shared/components/layout/Container';
import { formatCurrency } from '@/shared/utils/currency';

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

  const cards = [
    {
      title: summaryMessages.totalBalance,
      value: stats?.totalBalance || 0,
      icon: Wallet,
      iconClass: 'bg-[var(--color-accentGlow)] text-[var(--color-accent)]',
      topClass: 'bg-[linear-gradient(90deg,var(--color-accent),transparent)]',
<<<<<<< HEAD
=======
    },
    {
      title: summaryMessages.availableLimit,
      value: stats?.totalLimit || 0,
      icon: CreditCard,
      iconClass: 'bg-[var(--overlay-secondary-10)] text-[var(--color-secondary)]',
      topClass: 'bg-[linear-gradient(90deg,var(--color-secondary),transparent)]',
>>>>>>> finnance-management/main
    },
    {
      title: summaryMessages.income,
      value: stats?.monthlyIncome || 0,
      icon: TrendingUp,
      iconClass: 'bg-[var(--color-greenBg)] text-[var(--color-success)]',
      topClass: 'bg-[linear-gradient(90deg,var(--color-success),transparent)]',
    },
    {
      title: summaryMessages.expense,
      value: stats?.monthlyExpenses || 0,
      icon: TrendingDown,
      iconClass: 'bg-[var(--color-redBg)] text-[var(--color-error)]',
      topClass: 'bg-[linear-gradient(90deg,var(--color-error),transparent)]',
      isNegative: true,
    },
  ];

  return (
    <Container unstyled className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Container unstyled key={idx}>
            <Card className="group relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <Container
                unstyled
                className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100 ${card.topClass}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.025] to-transparent" />
              <CardContent className="relative p-3 sm:p-5">
                <Container unstyled className="flex flex-col gap-2 sm:gap-4">
                  <Container
                    unstyled
                    className={`flex h-8 w-8 items-center justify-center rounded-[10px] sm:h-10 sm:w-10 ${card.iconClass}`}
                  >
                    <Icon size={16} className="sm:hidden" />
                    <Icon size={20} className="hidden sm:block" />
                  </Container>
                  <Container unstyled>
                    <Text className="mb-0.5 text-[11px] font-medium text-[var(--color-text-muted)] sm:text-[13px]">
                      {card.title}
                    </Text>
                    {isLoading ? (
                      <Container
                        unstyled
                        className="h-6 w-[80px] animate-pulse rounded bg-white/5 sm:h-8 sm:w-[120px]"
                      />
                    ) : (
                      <Heading
                        level={3}
<<<<<<< HEAD
                        className={`font-heading text-base font-bold tracking-[-0.03em] sm:text-2xl ${card.isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}
=======
                        className={`font-heading text-2xl font-bold tracking-[-0.03em] ${card.isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}
>>>>>>> finnance-management/main
                      >
                        {formatCurrency(card.value)}
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
