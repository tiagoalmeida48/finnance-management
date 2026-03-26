import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCardDetailsChartsLogic } from '@/pages/cards/hooks/useCardDetailsChartsLogic';
import type {
  CardCategoryPoint,
  CardHistoryChartPoint,
} from '@/shared/interfaces/card-details.interface';
import { colors } from '@/shared/theme';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface CardDetailsChartsProps {
  chartData: CardHistoryChartPoint[];
  categoryData: CardCategoryPoint[];
}

export function CardDetailsCharts({ chartData, categoryData }: CardDetailsChartsProps) {
  const {
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
  } = useCardDetailsChartsLogic({
    chartData,
    categoryData,
  });

  return (
    <Container unstyled className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
      {/* Gráfico de Evolução Bento */}
      <Container
        unstyled
        className="group relative overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      >
        <Container unstyled className="mb-4 flex items-center justify-between">
          <Text className="font-heading text-lg font-bold text-white tracking-tight">
            {chartMessages.spendingEvolution}
          </Text>
          <Container
            unstyled
            className="flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1"
          >
            <Container
              unstyled
              className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]"
            />
            <Text className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {chartMessages.total}
            </Text>
          </Container>
        </Container>

        <Container unstyled className="h-[240px] min-w-0 w-full md:h-[320px] lg:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--overlay-white-04)"
              />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: colors.border }}
                tickLine={false}
                tick={{ fill: colors.textMuted, fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.textMuted, fontSize: 11 }}
                tickFormatter={formatCompact}
              />
              <Tooltip
                cursor={{ stroke: 'var(--overlay-white-10)', strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: 'var(--color-card-elevated)',
                  border: '1px solid var(--overlay-white-12)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px var(--overlay-black-50)',
                  padding: '12px 16px',
                }}
                labelStyle={{
                  color: colors.textSecondary,
                  fontSize: '12px',
                  marginBottom: 8,
                }}
                formatter={(value: number | string | undefined) => [
                  formatCurrency(Number(value) || 0),
                  chartMessages.total,
                ]}
              />
              {average > 0 ? (
                <ReferenceLine
                  y={average}
                  stroke={colors.textMuted}
                  strokeDasharray="5 5"
                  label={{
                    value: chartMessages.average,
                    fill: colors.textMuted,
                    fontSize: 10,
                    position: 'right',
                  }}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fill="url(#gradientTotal)"
                dot={{ fill: 'var(--color-primary)', r: 0, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: colors.bgPrimary,
                  stroke: 'var(--color-primary)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Container>
      </Container>

      {/* Categorias / Donut Bento */}
      <Container
        unstyled
        className="group relative overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      >
        <Text className="font-heading mb-4 text-lg font-bold text-white tracking-tight">
          {chartMessages.categories}
        </Text>

        <Container unstyled className="relative flex h-[210px] min-w-0 w-full justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                cornerRadius={8}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {chartCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={renderPieTooltip}
                cursor={false}
                offset={16}
                wrapperStyle={{ zIndex: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <Container
            unstyled
            className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
          >
            <Container unstyled className="space-y-0.5 text-center">
              <Text className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                {chartMessages.total}
              </Text>
              <Text className="font-heading text-[20px] font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                {formatCurrency(totalCategoryValue || 0)}
              </Text>
            </Container>
          </Container>
        </Container>

        <Container unstyled className="mt-4 flex flex-col gap-2.5">
          {chartCategories.slice(0, 5).map((category, index) => (
            <Container
              unstyled
              key={index}
              className={`group/pill rounded-[12px] border border-white/5 bg-white/[0.02] p-2.5 transition-all hover:bg-white/[0.05] ${getPaletteClassByFill(category.fill)}`}
            >
              <Container unstyled className="mb-1.5 flex items-center justify-between">
                <Container unstyled className="flex items-center gap-2">
                  <Container
                    unstyled
                    className="h-3 w-3 rounded-full bg-current shadow-[0_0_8px_currentColor]"
                  />
                  <Text className="text-[13px] font-bold tracking-tight text-white group-hover/pill:text-current transition-colors">
                    {category.name}
                  </Text>
                </Container>
                <Text className="text-[14px] font-black text-white">
                  {formatCurrency(category.value)}
                </Text>
              </Container>
              <Container unstyled className="flex items-center gap-3">
                <Container
                  unstyled
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5 shadow-inner"
                >
                  <Container
                    unstyled
                    ref={(node) => setCategoryProgressRef(node, category.percentage || 0, index)}
                    className="h-full rounded-full bg-current shadow-[0_0_8px_currentColor] transition-[width] duration-1000 ease-in-out"
                  />
                </Container>
                <Text className="text-[11px] font-bold text-current">
                  {formatPercent(category.percentage || 0)}
                </Text>
              </Container>
            </Container>
          ))}
        </Container>
      </Container>
    </Container>
  );
}
