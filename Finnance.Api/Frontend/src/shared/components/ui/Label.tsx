import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label className={cn('block text-[0.8rem] font-medium text-text mb-1', className)} {...props} />
  );
}
