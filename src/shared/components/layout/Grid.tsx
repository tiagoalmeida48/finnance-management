import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type GridProps = HTMLAttributes<HTMLDivElement>;

export function Grid({ className, ...props }: GridProps) {
    return <div className={cn('grid grid-cols-1 gap-2.5', className)} {...props} />;
}
