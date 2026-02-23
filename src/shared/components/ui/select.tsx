import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
    <select
        ref={ref}
        className={cn(
            'flex h-10 w-full rounded-[10px] border border-[var(--overlay-white-10)] bg-[var(--overlay-white-04)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors',
            '[&>option]:bg-[var(--color-surface)] [&>option]:text-[var(--color-text-primary)]',
            'focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
        )}
        {...props}
    />
));

Select.displayName = 'Select';

export { Select };
