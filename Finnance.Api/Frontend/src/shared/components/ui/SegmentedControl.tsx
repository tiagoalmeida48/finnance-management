import { cn } from '@/shared/utils';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn('inline-flex rounded-lg border border-border bg-surface-2 p-1', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all',
            value === option.value
              ? 'bg-gradient-to-b from-primary-soft to-primary text-bg shadow-soft'
              : 'text-text-muted hover:text-text',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
