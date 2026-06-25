import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-mono font-medium uppercase tracking-wider transition-all duration-150 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-b from-primary-soft to-primary text-bg hover:shadow-glow hover:brightness-[1.05] disabled:from-surface-2 disabled:to-surface-2 disabled:text-text-muted',
        secondary: 'bg-surface-2 hover:bg-surface-3 text-text border border-border',
        ghost: 'hover:bg-surface-2 text-text',
        danger: 'bg-expense hover:brightness-110 text-white',
        outline: 'border border-border hover:bg-surface-2 hover:border-border-strong text-text',
      },
      size: {
        sm: 'px-3 py-1.5 text-[0.7rem]',
        md: 'px-4 py-2 text-xs',
        lg: 'px-5 py-2.5 text-[0.8rem]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const spinnerSize = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className={cn('animate-spin', spinnerSize[size ?? 'md'])} aria-hidden /> : null}
      {children}
    </button>
  );
}
