import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from '@/shared/components/ui';
import { CATEGORY_PALETTE } from '../../constants';
import type { DashboardCategoryPoint } from '../../types/dashboard.types';

interface DashboardCategoriesChartProps {
  categories: DashboardCategoryPoint[];
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

const formatPercent = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DashboardCategoryPoint }>;
  total: number;
}

function CategoryTooltip({ active, payload, total }: PieTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const percentage = total > 0 ? (Number(item.value || 0) / total) * 100 : 0;

  return (
    <div className="min-w-[170px] rounded-lg border border-border bg-surface-2 p-3 shadow-lg">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
        <span className="text-xs font-semibold text-text-muted">{item.name}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-text">{formatBRL(item.value)}</span>
        <span className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-bold text-text">
          {formatPercent(percentage)}
        </span>
      </div>
    </div>
  );
}

export function DashboardCategoriesChart({ categories }: DashboardCategoriesChartProps) {
  const points = categories.map((category, index) => ({
    ...category,
    fill: category.fill ?? CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
  }));
  const total = points.reduce((sum, category) => sum + category.value, 0) || 1;
  const hasData = points.length > 0;

  return (
    <Card className="h-full p-4 sm:p-6">
      <CardContent>
        <h3 className="mb-2 text-base font-semibold text-text">Despesas por categoria</h3>
        {!hasData ? (
          <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 px-4 text-center text-sm text-text-muted">
            Nenhuma despesa no período.
          </div>
        ) : (
          <>
            <div className="flex h-[180px] w-full min-w-0 justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={points}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    cornerRadius={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {points.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CategoryTooltip total={total} />}
                    cursor={false}
                    offset={16}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2">
              {points.slice(0, 5).map((category, index) => {
                const percentage = (category.value / total) * 100;
                return (
                  <div
                    key={category.name}
                    className={`py-1.5 ${index < 4 ? 'border-b border-border' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-[3px]"
                          style={{ backgroundColor: category.fill }}
                        />
                        <span className="text-sm text-text-muted">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1 w-[60px] overflow-hidden rounded bg-surface-2">
                          <span
                            className="block h-full rounded"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: category.fill,
                            }}
                          />
                        </span>
                        <span className="min-w-20 text-right text-sm font-semibold text-text">
                          {formatBRL(category.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
