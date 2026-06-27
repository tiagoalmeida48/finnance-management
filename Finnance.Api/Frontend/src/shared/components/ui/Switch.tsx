import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center', className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="peer h-full w-full cursor-pointer appearance-none rounded-full border border-border bg-surface-2 transition-colors duration-200 checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <span className="pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-text-muted shadow-soft transition-transform duration-200 peer-checked:translate-x-4 peer-checked:bg-bg" />
    </span>
  );
});
