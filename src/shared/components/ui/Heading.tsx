import { createElement, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  return createElement(`h${level}`, { className: cn(className), ...props });
}
