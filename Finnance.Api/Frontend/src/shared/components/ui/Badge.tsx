import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider', {
  variants: {
    variant: {
      default: 'bg-surface text-text',
      income: 'bg-income/20 text-income',
      expense: 'bg-expense/20 text-expense',
      transfer: 'bg-transfer/20 text-transfer',
      primary: 'bg-primary/20 text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
