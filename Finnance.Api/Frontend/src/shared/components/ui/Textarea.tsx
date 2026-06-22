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
        'w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-text transition-colors placeholder:text-text-muted focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
