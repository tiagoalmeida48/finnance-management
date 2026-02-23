import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    unstyled?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
    { className, unstyled = false, ...props },
    ref,
) {
    return (
        <div
            ref={ref}
            className={cn(unstyled ? '' : 'px-2 sm:px-4 md:px-6', className)}
            {...props}
        />
    );
});

