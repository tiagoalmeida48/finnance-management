import { Pencil, Power, Trash2 } from 'lucide-react';
import { Badge, Button, EntityIcon } from '@/shared/components/ui';
import { CategoryTypeId } from '@/config/constants';
import { useCategoryTypes } from '../hooks/useCategories';
import type { Category } from '../types/categories.types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete, onToggleActive }: CategoryCardProps) {
  const typesQuery = useCategoryTypes();
  const isIncome = category.categoryType === CategoryTypeId.INCOME;
  const typeName =
    typesQuery.data?.find((type) => type.categoryType === category.categoryType)?.name ??
    (isIncome ? 'Receita' : 'Despesa');

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-2.5 transition-colors hover:border-primary/40">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: `${category.color}26`, color: category.color }}
      >
        <EntityIcon name={category.icon} size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{category.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant={isIncome ? 'income' : 'expense'}>{typeName}</Badge>
          <Badge variant={category.active ? 'income' : 'expense'}>
            {category.active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleActive(category)}
          aria-label={`${category.active ? 'Desativar' : 'Ativar'} categoria ${category.name}`}
          title={category.active ? 'Desativar' : 'Ativar'}
        >
          <Power className="h-4 w-4" />
        </Button>
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
