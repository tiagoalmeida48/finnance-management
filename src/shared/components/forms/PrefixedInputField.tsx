import type { InputProps } from '@/shared/components/ui/input';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/lib/utils';

interface PrefixedInputFieldProps extends InputProps {
  prefix: string;
  containerClassName?: string;
  prefixClassName?: string;
}

export function PrefixedInputField({
  prefix,
  className,
  containerClassName,
  prefixClassName,
  ...props
}: PrefixedInputFieldProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <span
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70',
          prefixClassName,
        )}
      >
        {prefix}
      </span>
      <Input className={cn('pl-9', className)} {...props} />
    </div>
  );
}
