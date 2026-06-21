import { BarChart3, CreditCard as CardIcon, MoreVertical } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Grid } from '@/shared/components/layout/Grid';
import { Heading } from '@/shared/components/ui/Heading';
import { IconButton } from '@/shared/components/ui/icon-button';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { Text } from '@/shared/components/ui/Text';
import { useCreditCardCardLogic } from '@/pages/cards/hooks/useCreditCardCardLogic';
import type { CreditCard } from '@/shared/interfaces/credit-card.interface';
import { Container } from '@/shared/components/layout/Container';

interface CreditCardCardProps {
  card: CreditCard;
  navigate: NavigateFunction;
  handleOpenMenu: (event: React.MouseEvent<HTMLElement>, card: CreditCard) => void;
}

export function CreditCardCard({ card, navigate, handleOpenMenu }: CreditCardCardProps) {
  const {
    cardMessages,
    dueDay,
    closingDay,
    usagePercentLabel,
    usageLabel,
    creditLimitLabel,
    cardRootRef,
    usageBarRef,
    summaryItems,
    handleOpenDetails,
  } = useCreditCardCardLogic({
    card,
    navigate,
    onEditCard: () => {},
    onDeleteCard: () => {},
  });

  return (
    <Card
      ref={cardRootRef}
      className="cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_var(--overlay-black-20)]"
    >
      <CardContent className="p-6">
        <Row className="mb-3 items-start justify-between">
          <Row className="items-center gap-2">
            <Container
              unstyled
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:color-mix(in_oklab,var(--card-color)_20%,transparent)] text-[var(--card-color)]"
            >
              <CardIcon size={20} />
            </Container>
            <Stack>
              <Heading
                level={3}
                className="font-heading text-lg font-bold text-[var(--color-text-primary)]"
              >
                {card.name}
              </Heading>
              <Text className="text-[13px] text-[var(--color-text-secondary)]">
                {cardMessages.dueShort}:{' '}
                <Text as="span" className="font-semibold">
                  {dueDay}
                </Text>
                {' • '}
                {cardMessages.closeShort}:{' '}
                <Text as="span" className="font-semibold">
                  {closingDay}
                </Text>
              </Text>
            </Stack>
          </Row>

          <Row className="gap-0.5">
            <IconButton
              size="small"
              onClick={handleOpenDetails}
              className="h-[34px] w-[34px] rounded-[8px] text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              title={cardMessages.details}
            >
              <BarChart3 size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, card)}
              className="h-[34px] w-[34px] rounded-[8px] text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
            >
              <MoreVertical size={18} />
            </IconButton>
          </Row>
        </Row>

        <Stack className="mb-3 space-y-0">
          <Text className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
            {cardMessages.usedLimit}
          </Text>
          <Row className="mb-1 items-baseline gap-1">
            <Text className="font-heading text-[22px] font-bold text-[var(--color-text-primary)]">
              {usageLabel}
            </Text>
            <Text className="text-[13px] text-[var(--color-text-muted)]">
              {cardMessages.of} {creditLimitLabel}
            </Text>
          </Row>
          <Container unstyled className="flex items-center gap-1.5 text-[var(--progress-color)]">
            <Container unstyled className="h-2 flex-1 overflow-hidden rounded bg-white/5">
              <Container
                unstyled
                ref={usageBarRef}
                className="h-full rounded bg-current transition-all duration-300"
              />
            </Container>
            <Text className="min-w-[45px] text-right text-xs font-semibold text-current">
              {usagePercentLabel}
            </Text>
          </Container>
        </Stack>

        <Grid className="grid-cols-2 gap-1.5">
          {summaryItems.map((item) => (
            <Container
              unstyled
              key={item.key}
              className="rounded-[10px] bg-[var(--overlay-white-03)] p-[7px]"
            >
              <Text className="mb-0.5 text-[11px] font-medium uppercase text-[var(--color-text-muted)]">
                {item.label}
              </Text>
              <Text className={`font-heading text-base font-bold ${item.valueClass}`}>
                {item.value}
              </Text>
            </Container>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
