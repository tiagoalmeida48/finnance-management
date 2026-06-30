import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { SortDirection } from '@/shared/hooks/useSortableData';

interface SortableThProps {
  label: string;
  sortKey: string;
  activeKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function SortableTh({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
  className,
}: SortableThProps) {
  const active = activeKey === sortKey;
  const alignClass =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th className={cn('px-3 py-2.5 font-medium', className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn('flex w-full items-center gap-1 transition-colors hover:text-text', alignClass)}
      >
        <span>{label}</span>
        {active ? (
          direction === 'asc' ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ChevronsUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}
