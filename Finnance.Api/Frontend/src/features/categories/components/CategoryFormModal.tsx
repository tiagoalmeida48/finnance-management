import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/components/ui';
import { CategoryTypeId } from '@/config/constants';
import { cn } from '@/shared/utils';
import type { Category } from '../types/categories.types';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from './categoryOptions';

export interface CategoryFormValues {
  name: string;
  categoryType: number;
  color: string;
  icon: string;
}

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

const TYPE_OPTIONS = [
  { value: CategoryTypeId.EXPENSE, label: 'Despesa' },
  { value: CategoryTypeId.INCOME, label: 'Receita' },
];

export function CategoryFormModal({
  open,
  category,
  saving,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [categoryType, setCategoryType] = useState<number>(CategoryTypeId.EXPENSE);
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const [icon, setIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setName(category?.name ?? '');
    setCategoryType(category?.categoryType ?? CategoryTypeId.EXPENSE);
    setColor(category?.color ?? DEFAULT_CATEGORY_COLOR);
    setIcon(category?.icon ?? DEFAULT_CATEGORY_ICON);
  }, [open, category]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Informe o nome da categoria.');
      return;
    }
    onSubmit({ name: trimmed, categoryType, color, icon });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Alimentação"
              autoFocus
              className="w-full"
            />
            {error ? <p className="mt-1 text-sm text-expense">{error}</p> : null}
          </div>

          <div>
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategoryType(option.value)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    categoryType === option.value
                      ? 'border-primary bg-primary/10 text-text'
                      : 'border-border bg-surface text-text-muted hover:bg-surface-2',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Selecionar cor ${option}`}
                  onClick={() => setColor(option)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform',
                    color === option ? 'border-text scale-110' : 'border-transparent',
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Selecionar ícone ${option}`}
                  onClick={() => setIcon(option)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors',
                    icon === option
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:bg-surface-2',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {category ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
