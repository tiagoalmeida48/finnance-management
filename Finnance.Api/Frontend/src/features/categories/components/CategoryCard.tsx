import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import type { Category } from '../types/categories.types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-4 transition-colors hover:border-primary/40">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
        style={{ backgroundColor: `${category.color}26`, color: category.color }}
      >
        <span>{category.icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{category.name}</p>
        {!category.active ? <p className="text-xs text-text-muted">Inativa</p> : null}
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          aria-label={`Editar categoria ${category.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category)}
          aria-label={`Excluir categoria ${category.name}`}
          className="text-expense hover:bg-expense/10 hover:text-expense"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
