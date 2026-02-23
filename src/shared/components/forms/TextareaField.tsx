import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                'flex w-full rounded-md border border-[var(--overlay-white-16)] bg-white/[0.06] px-3 py-2 text-sm text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-muted)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    ),
);

TextareaField.displayName = 'TextareaField';

export { TextareaField };
