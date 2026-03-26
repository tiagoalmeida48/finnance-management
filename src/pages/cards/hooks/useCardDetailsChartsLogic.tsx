import { useCallback, useMemo } from 'react';
import type {
  CardCategoryPoint,
  CardHistoryChartPoint,
} from '@/shared/interfaces/card-details.interface';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import { messages } from '@/shared/i18n/messages';
import { colors } from '@/shared/theme';

const CATEGORY_COLORS = [colors.yellow, colors.purple, colors.green, colors.red, colors.blue];

interface UseCardDetailsChartsLogicParams {
  chartData: CardHistoryChartPoint[];
  categoryData: CardCategoryPoint[];
}

interface PieTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CardCategoryPoint }>;
}

import { formatCurrency } from '@/shared/utils/currency';

const formatCompact = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return `R$ ${value}`;
};

const formatPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

const getPaletteClassByFill = (fill?: string) => {
  if (fill === colors.yellow) return 'text-[var(--color-warning)]';
  if (fill === colors.purple) return 'text-[var(--color-secondary)]';
  if (fill === colors.green) return 'text-[var(--color-success)]';
  if (fill === colors.red) return 'text-[var(--color-error)]';
  if (fill === colors.blue) return 'text-[var(--color-blue)]';
  return 'text-[var(--color-accent)]';
};

export function useCardDetailsChartsLogic({
  chartData,
  categoryData,
}: UseCardDetailsChartsLogicParams) {
  const chartMessages = messages.cards.detailsCharts;

  const average = useMemo(
    () =>
      chartData.length > 0
        ? chartData.reduce((sum, item) => sum + (item.total || 0), 0) / chartData.length
        : 0,
    [chartData],
  );

  const totalCategoryValue = useMemo(
    () => categoryData.reduce((sum, item) => sum + (item.value || 0), 0),
    [categoryData],
  );

  const chartCategories = useMemo(
    () =>
      categoryData.map((category, index) => ({
        ...category,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage: totalCategoryValue > 0 ? (category.value / totalCategoryValue) * 100 : 0,
      })),
    [categoryData, totalCategoryValue],
  );

  const setCategoryProgressRef = useCallback(
    (node: HTMLDivElement | null, percentage: number, index: number) => {
      if (!node) return;
      node.style.setProperty('width', `${percentage}%`);
      node.style.setProperty('transition-delay', `${index * 100}ms`);
    },
    [],
  );

  const renderPieTooltip = useCallback(({ active, payload }: PieTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0]?.payload;
    if (!item) return null;
    const colorClass = getPaletteClassByFill(item.fill);

    return (
      <Container
        unstyled
        className={`min-w-[170px] rounded-xl border border-[var(--overlay-white-16)] bg-[color:color-mix(in_srgb,var(--color-card-elevated)_96%,transparent)] p-[10px_12px] shadow-[0_14px_34px_var(--overlay-black-50)] backdrop-blur-[16px] ${colorClass}`}
      >
        <Container unstyled className="mb-1 flex items-center gap-1">
          <Container unstyled className="h-2 w-2 rounded-full bg-current" />
          <Text className="text-xs font-semibold text-[var(--color-text-secondary)]">
            {item.name}
          </Text>
        </Container>
        <Container unstyled className="flex items-center justify-between gap-1.5">
          <Text className="text-sm font-bold text-[var(--color-text-primary)]">
            {formatCurrency(item.value)}
          </Text>
          <Container
            unstyled
            className="rounded-full border border-[var(--overlay-white-14)] bg-white/5 px-1 py-[1px] text-[11px] font-bold text-current"
          >
            {formatPercent(item.percentage || 0)}
          </Container>
        </Container>
      </Container>
    );
  }, []);

  return {
    chartMessages,
    average,
    totalCategoryValue,
    chartCategories,
    setCategoryProgressRef,
    renderPieTooltip,
    formatCurrency,
    formatCompact,
    formatPercent,
    getPaletteClassByFill,
  };
}
