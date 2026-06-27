import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        `h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[6px] border border-border bg-bg/60 bg-center bg-no-repeat align-middle transition-all duration-150 hover:border-border-strong checked:border-primary checked:bg-primary checked:bg-[length:12px_12px] checked:hover:border-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%230a0b0d'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E")]`,
        className,
      )}
      {...props}
    />
  );
});
