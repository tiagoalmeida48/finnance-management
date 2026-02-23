import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CreditCard as CardIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Container } from "@/shared/components/layout/Container";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Text } from "@/shared/components/ui/Text";
import { useCardDetailsHeaderLogic } from "@/pages/cards/hooks/useCardDetailsHeaderLogic";
import type { CreditCardDetails } from "@/shared/interfaces/card-details.interface";

interface CardDetailsHeaderProps {
  card: CreditCardDetails;
  navigate: NavigateFunction;
  isAllTime: boolean;
  setIsAllTime: (value: boolean) => void;
  selectedDate: Date;
  handlePrevYear: () => void;
  handleNextYear: () => void;
  onOpenStatementCycleHistory: () => void;
}

export function CardDetailsHeader({
  card,
  navigate,
  isAllTime,
  setIsAllTime,
  selectedDate,
  handlePrevYear,
  handleNextYear,
  onOpenStatementCycleHistory,
}: CardDetailsHeaderProps) {
  const {
    headerMessages,
    dueDay,
    closingDay,
    cardIconRef,
    metrics,
    onBackToCards,
    onSetYearlyView,
    onSetAllTimeView,
  } = useCardDetailsHeaderLogic({
    card,
    navigate,
    isAllTime,
    setIsAllTime,
  });

  return (
    <Container unstyled className="mb-6 flex flex-col gap-4">
      {/* Top Navigation */}
      <Container
        unstyled
        className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"
      >
        <Button
          startIcon={<ChevronLeft size={16} />}
          onClick={onBackToCards}
          variant="ghost"
          className="self-start text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
        >
          {headerMessages.backToCards}
        </Button>

        <Container
          unstyled
          className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
        >
          <Button
            size="small"
            startIcon={<CalendarRange size={14} />}
            onClick={onOpenStatementCycleHistory}
            variant="ghost"
            className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5 font-semibold text-[var(--color-text-secondary)] shadow-sm backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:text-white"
          >
            {headerMessages.billingCycle}
          </Button>

          <Container
            unstyled
            className="inline-flex items-center rounded-full border border-white/5 bg-white/[0.03] p-1 shadow-sm backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={onSetYearlyView}
              className={`flex flex-1 items-center justify-center rounded-full px-4 py-1 text-[13px] font-bold transition-all ${!isAllTime ? "bg-white/10 text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-white"}`}
            >
              {headerMessages.yearly}
            </button>
            <button
              type="button"
              onClick={onSetAllTimeView}
              className={`flex flex-1 items-center justify-center rounded-full px-4 py-1 text-[13px] font-bold transition-all ${isAllTime ? "bg-white/10 text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-white"}`}
            >
              {headerMessages.allTime}
            </button>
          </Container>

          <Container
            unstyled
            className={`inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 shadow-sm backdrop-blur-sm transition-opacity ${isAllTime ? "pointer-events-none opacity-40" : "pointer-events-auto opacity-100"}`}
          >
            <IconButton
              size="small"
              onClick={handlePrevYear}
              className="h-7 w-7 text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={16} />
            </IconButton>
            <Text
              as="span"
              className="min-w-[50px] text-center text-[13px] font-bold tracking-widest text-[#D4AF37]"
            >
              {selectedDate.getFullYear()}
            </Text>
            <IconButton
              size="small"
              onClick={handleNextYear}
              className="h-7 w-7 text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight size={16} />
            </IconButton>
          </Container>
        </Container>
      </Container>

      {/* Hero Card Info (Solid background without transparency) */}
      <Container
        unstyled
        className="relative overflow-hidden rounded-[24px] border border-white/5 bg-[var(--color-card)] p-6 shadow-sm"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--color-primary)] opacity-10 blur-[64px]" />

        <Container
          unstyled
          className="relative z-10 flex flex-col items-center gap-5 sm:flex-row"
        >
          {/* Estilo Mini-cartão Físico */}
          <Container
            unstyled
            ref={cardIconRef}
            className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent mix-blend-overlay" />
            {/* Simula chip do cartão */}
            <div className="absolute left-2.5 top-1/2 h-3.5 w-4.5 -translate-y-1/2 rounded-[3px] border border-black/10 bg-gradient-to-br from-[#ffd700]/40 to-[#DAA520]/20 mix-blend-color-dodge" />
            <CardIcon
              size={24}
              className="relative z-10 ml-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            />
          </Container>

          <Container unstyled className="text-center sm:text-left">
            <Text className="font-heading text-[28px] font-black tracking-tight text-white">
              {card.name}
            </Text>
            <Text className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[13px] text-[var(--color-text-secondary)] sm:justify-start">
              <span>
                {headerMessages.ending}{" "}
                <strong className="text-white">{dueDay}</strong>
              </span>
              <span>•</span>
              <span>
                {headerMessages.closing}{" "}
                <strong className="text-white">{closingDay}</strong>
              </span>
            </Text>
          </Container>
        </Container>
      </Container>

      {/* Bento Metrics */}
      <Container unstyled className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric: any) => (
          <HeaderMetricCard
            key={metric.key}
            icon={metric.icon}
            iconColor={metric.iconColor}
            iconClassName={metric.iconClassName}
            label={metric.label}
            value={metric.value}
            valueClass={metric.valueClass}
            progress={metric.progress}
          />
        ))}
      </Container>
    </Container>
  );
}

interface HeaderMetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconClassName?: string;
  label: string;
  value: string;
  valueClass: string;
  progress?: number;
}

function HeaderMetricCard({
  icon: Icon,
  iconColor,
  iconClassName,
  label,
  value,
  valueClass,
  progress,
}: HeaderMetricCardProps) {
  return (
    <Container
      unstyled
      className="group relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
    >
      <Container unstyled className="mb-3 flex items-center gap-2">
        <Container
          unstyled
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-background)]"
        >
          <Icon size={12} color={iconColor} className={iconClassName} />
        </Container>
        <Text
          as="span"
          className="text-[12px] font-bold tracking-wide text-[var(--color-text-secondary)]"
        >
          {label}
        </Text>
      </Container>
      <Text
        className={`font-heading text-[22px] font-black tracking-tight ${valueClass}`}
      >
        {value}
      </Text>

      {progress !== undefined && (
        <Container
          unstyled
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10 shadow-inner"
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              progress >= 80
                ? "bg-[var(--color-error)]"
                : progress >= 50
                  ? "bg-[var(--color-warning)]"
                  : "bg-[var(--color-success)]"
            } shadow-[0_0_10px_currentColor]`}
            style={{ width: `${progress}%` }}
          />
        </Container>
      )}
    </Container>
  );
}
