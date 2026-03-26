import { messages } from '@/shared/i18n/messages';
import { Row } from '@/shared/components/layout/Row';
import { Container } from '@/shared/components/layout/Container';

interface DashboardFiltersProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export function DashboardFilters({ selectedYear, setSelectedYear }: DashboardFiltersProps) {
  const filtersMessages = messages.dashboard.filters;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 4 + i);

  return (
    <Row className="items-center gap-2">
      <label className="sr-only" htmlFor="dashboard-year">
        {filtersMessages.yearLabel}
      </label>
      <Container
        unstyled
        className="rounded-md border border-[var(--color-border)] bg-white/[0.03] px-2 py-1"
      >
        <select
          id="dashboard-year"
          className="h-9 min-w-[110px] rounded-md border border-[var(--overlay-white-10)] bg-[var(--color-card-elevated)] px-3 text-sm text-[var(--color-text-primary)] shadow-[inset_0_1px_0_var(--overlay-white-08)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option
              key={year}
              value={year}
              className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            >
              {year}
            </option>
          ))}
        </select>
      </Container>
    </Row>
  );
}
