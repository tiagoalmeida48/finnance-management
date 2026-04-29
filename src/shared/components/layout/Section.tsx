import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  unstyled?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { className, unstyled = false, ...props },
  ref,
) {
<<<<<<< HEAD
  return <section ref={ref} className={cn(unstyled ? '' : 'pb-6 pt-3 sm:pt-4', className)} {...props} />;
=======
  return <section ref={ref} className={cn(unstyled ? '' : 'pb-6 pt-4', className)} {...props} />;
>>>>>>> finnance-management/main
});
