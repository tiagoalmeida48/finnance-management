import { SelectMenu } from '@/shared/components/ui';

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
      <SelectMenu
        id="dashboard-year"
        className="min-w-[120px]"
        value={selectedYear}
        onChange={(value) => setSelectedYear(Number(value))}
        options={years.map((year) => ({ value: year, label: String(year) }))}
      />
    </div>
  );
}
