import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type StackProps = HTMLAttributes<HTMLDivElement>;

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('flex flex-col', className)} {...props} />;
});
