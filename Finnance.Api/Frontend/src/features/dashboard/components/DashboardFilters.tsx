import { Select } from '@/shared/components/ui';

interface DashboardFiltersProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export function DashboardFilters({ selectedYear, setSelectedYear }: DashboardFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, index) => currentYear - 4 + index);

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="dashboard-year">
        Ano
      </label>
      <Select
        id="dashboard-year"
        className="h-9 min-w-[110px] bg-surface-2 text-sm"
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  );
}
