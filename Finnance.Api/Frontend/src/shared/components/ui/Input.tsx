import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full h-9 px-3 rounded-lg bg-bg/60 border border-border text-sm text-text placeholder:text-text-muted/70 transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  );
}
