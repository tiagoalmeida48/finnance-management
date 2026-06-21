interface UsageBarProps {
  usage: number;
  creditLimit: number;
}

export function UsageBar({ usage, creditLimit }: UsageBarProps) {
  const ratio = creditLimit > 0 ? Math.min(usage / creditLimit, 1) : 0;
  const percent = Math.round(ratio * 100);
  const barColor = ratio >= 0.9 ? 'bg-expense' : ratio >= 0.7 ? 'bg-primary' : 'bg-income';

  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-right text-xs text-text-muted">{percent}% utilizado</p>
    </div>
  );
}
