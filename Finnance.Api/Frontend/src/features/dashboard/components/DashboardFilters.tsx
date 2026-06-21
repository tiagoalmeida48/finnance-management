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
      <select
        id="dashboard-year"
        className="h-9 min-w-[110px] rounded-md border border-border bg-surface-2 px-3 text-sm text-text focus-visible:border-primary focus-visible:outline-none"
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
