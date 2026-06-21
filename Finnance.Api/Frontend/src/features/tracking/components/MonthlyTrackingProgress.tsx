interface MonthlyTrackingProgressProps {
  progress: number;
  isSettled: boolean;
  paidItems: number;
  totalItems: number;
}

export function MonthlyTrackingProgress({
  progress,
  isSettled,
  paidItems,
  totalItems,
}: MonthlyTrackingProgressProps) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {paidItems} de {totalItems} pagos
        </span>
        <span className={`text-xs font-bold ${isSettled ? 'text-income' : 'text-primary'}`}>
          {progress}%
        </span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-all ${isSettled ? 'bg-income' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
