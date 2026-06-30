import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortAccessors<T> = Record<string, (item: T) => unknown>;

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

export function useSortableData<T>(items: T[], accessors: SortAccessors<T>, initialKey: string) {
  const [sortKey, setSortKey] = useState<string>(initialKey);
  const [direction, setDirection] = useState<SortDirection>('asc');

  const sorted = useMemo(() => {
    const accessor = accessors[sortKey];
    if (!accessor) return items;
    const factor = direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => compareValues(accessor(a), accessor(b)) * factor);
  }, [items, accessors, sortKey, direction]);

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  return { sorted, sortKey, direction, toggleSort };
}
