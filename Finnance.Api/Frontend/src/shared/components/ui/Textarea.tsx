import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-text transition-all placeholder:text-text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
