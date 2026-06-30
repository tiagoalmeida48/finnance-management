import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import type { CreditCardInvoice } from '../types/cards.types';

interface InvoiceTrendChartProps {
  invoices: CreditCardInvoice[];
}

const CHART_COLORS = {
  line: '#dcb066',
  grid: 'rgba(150,162,180,0.07)',
  axis: '#969eae',
  tooltipBg: '#1a1d23',
  tooltipBorder: '#3a414d',
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const label = MONTHS[Number(month) - 1];
  return label ? `${label}/${year.slice(2)}` : monthKey;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatCompact = (value: number) =>
  value >= 1000
    ? `R$ ${new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
        .format(value)
        .replace('.', ',')}`
    : formatBRL(value);

export function InvoiceTrendChart({ invoices }: InvoiceTrendChartProps) {
  const data = [...invoices]
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((invoice) => ({ name: monthLabel(invoice.monthKey), total: invoice.totalAmount }));

  return (
    <div className="rounded-xl border border-border bg-surface-gradient p-6 shadow-card">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
        <LineChartIcon size={18} className="text-text-muted" />
        Evolução das Faturas
      </h2>

      <div className="h-[220px] w-full min-w-0 sm:h-[280px]">
        {data.length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/30 px-4 text-center">
            <LineChartIcon size={22} className="text-text-muted" />
            <p className="text-sm text-text-muted">Dados insuficientes para exibir o gráfico.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="invoiceArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.line} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.line} stopOpacity={0} />
                </linearGradient>
                <filter id="invoiceGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: CHART_COLORS.tooltipBorder }}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 10, fontFamily: CHART_COLORS.fontFamily }}
                minTickGap={8}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11, fontFamily: CHART_COLORS.fontFamily }}
                tickFormatter={formatCompact}
                width={95}
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
                formatter={(value) => [formatBRL(Number(value) || 0), 'Fatura']}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Fatura"
                stroke={CHART_COLORS.line}
                strokeWidth={2.5}
                fill="url(#invoiceArea)"
                style={{ filter: 'url(#invoiceGlow)' }}
                dot={{ fill: CHART_COLORS.line, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: CHART_COLORS.tooltipBg }}
                animationBegin={120}
                animationDuration={1400}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
