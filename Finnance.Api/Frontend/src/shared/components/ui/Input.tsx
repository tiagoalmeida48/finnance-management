import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'px-3 py-2 rounded-md bg-surface border border-border text-text placeholder:text-text-muted focus-visible:border-primary transition-colors',
        className,
      )}
      {...props}
    />
  );
}
