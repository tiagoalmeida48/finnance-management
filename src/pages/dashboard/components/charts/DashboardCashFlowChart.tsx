import { Card, CardContent } from '@/shared/components/ui/card';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { colors } from '@/shared/theme';
import { messages } from '@/shared/i18n/messages';
import { Heading } from '@/shared/components/ui/Heading';
import { Text } from '@/shared/components/ui/Text';
import { Container } from '@/shared/components/layout/Container';
import type { DashboardChartPoint } from '../DashboardCharts';

interface DashboardCashFlowChartProps {
    chartData: DashboardChartPoint[];
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(Math.abs(val));

const formatSignedBRL = (val: number) => (val < 0 ? formatBRL(val).replace('R$', 'R$ -') : formatBRL(val));

const formatCompact = (val: number) => {
    const absValue = Math.abs(val);
    if (absValue >= 1000) {
        const compact = new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1,
        }).format(absValue);
        return `R$ ${val < 0 ? '-' : ''}${compact.replace('.', ',')}`;
    }
    return formatSignedBRL(val);
};

export function DashboardCashFlowChart({ chartData }: DashboardCashFlowChartProps) {
    const chartMessages = messages.dashboard.charts;
    const hasInsufficientCashFlowData = chartData.length <= 1;
    const cashFlowValues = chartData.flatMap((point) => [point.receita, point.despesa]);
    const maxCashFlowValue = cashFlowValues.length ? Math.max(...cashFlowValues) : 0;
    const yAxisDomainMax = maxCashFlowValue > 0 ? Math.ceil(maxCashFlowValue * 1.15) : 1000;

    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <Container unstyled className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Heading level={3} className="font-heading text-base font-semibold">
                        {chartMessages.cashFlow}
                    </Heading>
                    <Container unstyled className="flex items-center gap-4">
                        <Container unstyled className="flex items-center gap-1">
                            <Container unstyled className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                            <Text className="text-xs text-[var(--color-text-secondary)]">{chartMessages.income}</Text>
                        </Container>
                        <Container unstyled className="flex items-center gap-1">
                            <Container unstyled className="h-2 w-2 rounded-full bg-[var(--color-error)]" />
                            <Text className="text-xs text-[var(--color-text-secondary)]">{chartMessages.expense}</Text>
                        </Container>
                    </Container>
                </Container>
                <Container unstyled className="h-[280px] w-full min-w-0">
                    {hasInsufficientCashFlowData ? (
                        <Container unstyled className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--overlay-white-12)] bg-white/[0.02] px-4 text-center text-sm text-[var(--color-text-secondary)]">
                            {chartMessages.insufficientData}
                        </Container>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--overlay-white-04)" />
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
                                    width={95}
                                    domain={[0, yAxisDomainMax]}
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
                                    labelStyle={{ color: colors.textSecondary, fontSize: '12px', marginBottom: 8 }}
                                    formatter={(value: number | string | undefined, name?: string) => [formatSignedBRL(Number(value) || 0), name || '']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="receita"
                                    name={chartMessages.income}
                                    stroke={colors.green}
                                    strokeWidth={2.5}
                                    dot={{ fill: colors.green, r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, stroke: colors.bgPrimary, strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="despesa"
                                    name={chartMessages.expense}
                                    stroke={colors.red}
                                    strokeWidth={2}
                                    strokeDasharray="6 3"
                                    dot={{ fill: colors.red, r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, stroke: colors.bgPrimary, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Container>
            </CardContent>
        </Card>
    );
}
