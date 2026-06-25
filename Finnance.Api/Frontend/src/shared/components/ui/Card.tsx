import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-gradient p-4 shadow-card',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-4 pb-4 border-b border-border', className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h2 className={cn('text-lg font-semibold text-text', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border flex gap-2', className)} {...props} />
  );
}
