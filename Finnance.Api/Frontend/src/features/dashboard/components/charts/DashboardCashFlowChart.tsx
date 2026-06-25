import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui';
import { CHART_COLORS } from '../../constants';
import type { DashboardChartPoint } from '../../types/dashboard.types';

interface DashboardCashFlowChartProps {
  chartData: DashboardChartPoint[];
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

const formatSignedBRL = (value: number) =>
  value < 0 ? formatBRL(value).replace('R$', 'R$ -') : formatBRL(value);

const formatCompact = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    const compact = new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(absValue);
    return `R$ ${value < 0 ? '-' : ''}${compact.replace('.', ',')}`;
  }
  return formatSignedBRL(value);
};

export function DashboardCashFlowChart({ chartData }: DashboardCashFlowChartProps) {
  const hasData = chartData.some((point) => point.receita > 0 || point.despesa > 0);
  const values = chartData.flatMap((point) => [point.receita, point.despesa]);
  const maxValue = values.length ? Math.max(...values) : 0;
  const domainMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 1000;

  return (
    <Card className="h-full p-4 sm:p-6">
      <CardContent>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text">Fluxo de caixa</h3>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-income" />
              Receitas
            </span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-expense" />
              Despesas
            </span>
          </div>
        </div>
        <div className="h-[200px] w-full min-w-0 sm:h-[280px]">
          {!hasData ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/30 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-text-muted">
                <LineChartIcon size={22} />
              </div>
              <p className="text-sm text-text-muted">Dados insuficientes para exibir o gráfico.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: CHART_COLORS.tooltipBorder }}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 10, fontFamily: CHART_COLORS.fontFamily }}
                  tickFormatter={(value) => String(value).split('/')[0]}
                  minTickGap={8}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11, fontFamily: CHART_COLORS.fontFamily }}
                  tickFormatter={formatCompact}
                  width={95}
                  domain={[0, domainMax]}
                />
                <Tooltip
                  cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: CHART_COLORS.tooltipBg,
                    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontFamily: CHART_COLORS.fontFamily,
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: CHART_COLORS.axis, fontSize: '12px', marginBottom: 8 }}
                  formatter={(value, name) => [formatSignedBRL(Number(value) || 0), name ?? '']}
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="Receitas"
                  stroke={CHART_COLORS.income}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.income, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="despesa"
                  name="Despesas"
                  stroke={CHART_COLORS.expense}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ fill: CHART_COLORS.expense, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
