import { Card, CardContent } from '@/shared/components/ui/card';
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { colors } from '@/shared/theme';
import { messages } from '@/shared/i18n/messages';
import { Heading } from '@/shared/components/ui/Heading';
import { Text } from '@/shared/components/ui/Text';
import { Container } from '@/shared/components/layout/Container';
import type { DashboardCategoryPoint } from '../DashboardCharts';

interface DashboardCategoriesChartProps {
    categories: DashboardCategoryPoint[];
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(Math.abs(val));

const formatPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

const getPaletteClassByFill = (fill?: string) => {
    if (fill === colors.yellow) return 'text-[var(--color-warning)]';
    if (fill === colors.purple) return 'text-[var(--color-secondary)]';
    if (fill === colors.green) return 'text-[var(--color-success)]';
    if (fill === colors.red) return 'text-[var(--color-error)]';
    if (fill === colors.blue) return 'text-[var(--color-blue)]';
    return 'text-[var(--color-accent)]';
};

interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: DashboardCategoryPoint }>;
    totalCategoryValue: number;
}

function CustomPieTooltip({ active, payload, totalCategoryValue }: PieTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;
    const colorClass = getPaletteClassByFill(item.fill);
    const percentage = totalCategoryValue > 0 ? (Number(item.value || 0) / totalCategoryValue) * 100 : 0;

    return (
        <Container unstyled
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
                    {formatBRL(item.value)}
                </Text>
                <Container unstyled className="rounded-full border border-[var(--overlay-white-14)] bg-white/5 px-1 py-[1px] text-[11px] font-bold text-current">
                    {formatPercent(percentage)}
                </Container>
            </Container>
        </Container>
    );
}

export function DashboardCategoriesChart({ categories }: DashboardCategoriesChartProps) {
    const chartMessages = messages.dashboard.charts;
    const CATEGORY_COLORS = [colors.yellow, colors.purple, colors.green, colors.red, colors.blue];
    const pieCategories = categories.map((cat, index) => ({
        ...cat,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
    const totalCategoryValue = pieCategories.reduce((sum, cat) => sum + cat.value, 0) || 1;

    const setCategoryProgressRef = (node: HTMLDivElement | null, percentage: number, index: number) => {
        if (!node) return;
        node.style.setProperty('width', `${percentage}%`);
        node.style.setProperty('transition-delay', `${index * 100}ms`);
    };

    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <Heading level={3} className="font-heading mb-2 text-base font-semibold">
                    {chartMessages.categories}
                </Heading>
                <Container unstyled className="flex h-[180px] w-full min-w-0 justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                cornerRadius={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieCategories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip totalCategoryValue={totalCategoryValue} />} cursor={false} offset={16} wrapperStyle={{ zIndex: 10 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Container>

                <Container unstyled className="mt-1">
                    {pieCategories.slice(0, 5).map((cat, idx) => {
                        const percentage = (cat.value / totalCategoryValue) * 100;
                        return (
                            <Container unstyled
                                key={idx}
                                className={`py-1.5 transition-[padding-left] duration-200 hover:pl-0.5 ${idx < 4 ? 'border-b border-[var(--color-border)]' : ''}`}
                            >
                                <Container unstyled className="flex items-center justify-between">
                                    <Container unstyled className={`flex items-center gap-1.5 ${getPaletteClassByFill(cat.fill)}`}>
                                        <Container unstyled className="h-2.5 w-2.5 rounded-[3px] bg-current" />
                                        <Text className="text-[13.5px] text-[var(--color-text-secondary)]">
                                            {cat.name}
                                        </Text>
                                    </Container>
                                    <Container unstyled className={`flex items-center gap-1.5 ${getPaletteClassByFill(cat.fill)}`}>
                                        <Container unstyled className="h-1 w-[60px] overflow-hidden rounded bg-white/5">
                                            <Container unstyled
                                                ref={(node) => setCategoryProgressRef(node, percentage, idx)}
                                                className="h-full bg-current transition-[width] duration-1000 ease-in-out"
                                            />
                                        </Container>
                                        <Text className="min-w-20 text-right text-[13.5px] font-semibold text-current">
                                            {formatBRL(cat.value)}
                                        </Text>
                                    </Container>
                                </Container>
                            </Container>
                        );
                    })}
                </Container>
            </CardContent>
        </Card>
    );
}
