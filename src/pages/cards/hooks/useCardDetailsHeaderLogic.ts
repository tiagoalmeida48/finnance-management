import { useMemo } from "react";
import {
  CreditCard as CardIcon,
  Percent,
  TrendingDown,
  Wallet,
} from "lucide-react";

import type { NavigateFunction } from "react-router-dom";
import { useApplyElementStyles } from "@/shared/hooks/useApplyElementStyles";
import type { CreditCardDetails } from "@/shared/interfaces/card-details.interface";
import { messages } from "@/shared/i18n/messages";
import { colors } from "@/shared/theme";

interface UseCardDetailsHeaderLogicParams {
  card: CreditCardDetails;
  navigate: NavigateFunction;
  isAllTime: boolean;
  setIsAllTime: (value: boolean) => void;
}

import { formatCurrency } from "@/shared/utils/currency";

export function useCardDetailsHeaderLogic({
  card,
  navigate,
  isAllTime,
  setIsAllTime,
}: UseCardDetailsHeaderLogicParams) {
  const headerMessages = messages.cards.detailsHeader;
  const dueDay = card.current_statement_cycle?.due_day ?? card.due_day;
  const closingDay =
    card.current_statement_cycle?.closing_day ?? card.closing_day;

  const usagePercent =
    card.credit_limit > 0
      ? Math.min(((card.usage || 0) / card.credit_limit) * 100, 100)
      : 0;

  const usageColorClass =
    usagePercent >= 80
      ? "text-[var(--color-error)]"
      : usagePercent >= 50
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-success)]";

  const cardShadowColor = card.color
    ? `${card.color}40`
    : "var(--color-accentGlow)";

  const cardIconRef = useApplyElementStyles<HTMLDivElement>({
    "background-color": card.color || colors.accent,
    "box-shadow": `0 4px 16px ${cardShadowColor}`,
  });

  const metrics = useMemo<any[]>(
    () => [
      {
        key: "used",
        icon: TrendingDown,
        iconColor: "var(--color-text-muted)",
        label: headerMessages.usedLimit,
        value: formatCurrency(card.usage || 0),
        valueClass: "text-[var(--color-text-primary)]",
      },
      {
        key: "total",
        icon: CardIcon,
        iconColor: "var(--color-text-muted)",
        label: headerMessages.totalLimit,
        value: formatCurrency(card.credit_limit || 0),
        valueClass: "text-[var(--color-success)]",
      },
      {
        key: "available",
        icon: Wallet,
        iconColor: (card.available_limit || 0) < 0 ? colors.red : colors.green,
        label: headerMessages.available,
        value: formatCurrency(card.available_limit || 0),
        valueClass:
          (card.available_limit || 0) < 0
            ? "text-[var(--color-error)]"
            : "text-[var(--color-success)]",
      },
      {
        key: "utilization",
        icon: Percent,
        iconClassName: usageColorClass,
        label: headerMessages.utilization,
        value: `${usagePercent.toFixed(1)}%`,
        valueClass: usageColorClass,
        progress: usagePercent,
      },
    ],
    [
      card.available_limit,
      card.credit_limit,
      card.usage,
      headerMessages.available,
      headerMessages.totalLimit,
      headerMessages.usedLimit,
      headerMessages.utilization,
      usageColorClass,
      usagePercent,
    ],
  );

  return {
    headerMessages,
    dueDay,
    closingDay,
    cardIconRef,
    metrics,
    usageColorClass,
    isAllTime,
    cardSuffix: card.id.slice(-4),
    onBackToCards: () => navigate("/cards"),
    onSetYearlyView: () => setIsAllTime(false),
    onSetAllTimeView: () => setIsAllTime(true),
  };
}
