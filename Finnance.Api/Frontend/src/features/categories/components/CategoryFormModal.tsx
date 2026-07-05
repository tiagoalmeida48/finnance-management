import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EntityIcon,
  Input,
  Label,
} from '@/shared/components/ui';
import { CategoryTypeId } from '@/config/constants';
import { cn } from '@/shared/utils';
import { useCategoryTypes } from '../hooks/useCategories';
import type { Category } from '../types/categories.types';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from './categoryOptions';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da categoria.'),
  categoryType: z.number().int().positive('Selecione o tipo da categoria.'),
  color: z.string(),
  icon: z.string(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}


const emptyValues: CategoryFormValues = {
  name: '',
  categoryType: CategoryTypeId.EXPENSE,
  color: DEFAULT_CATEGORY_COLOR,
  icon: DEFAULT_CATEGORY_ICON,
};

export function CategoryFormModal({
  open,
  category,
  saving,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const typesQuery = useCategoryTypes();
  const typeOptions = (typesQuery.data ?? [])
    .map((type) => ({ value: type.categoryType, label: type.name }))
    .sort((a, b) => a.value - b.value);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        categoryType: category.categoryType ?? CategoryTypeId.EXPENSE,
        color: category.color ?? DEFAULT_CATEGORY_COLOR,
        icon: category.icon ?? DEFAULT_CATEGORY_ICON,
      });
    } else {
      reset(emptyValues);
    }
  }, [open, category, reset]);

  const selectedType = watch('categoryType');
  const selectedIcon = watch('icon');

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((option) => {
                const optionIsIncome = option.value === CategoryTypeId.INCOME;
                const selected = selectedType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('categoryType', option.value, { shouldDirty: true })}
                    className={cn(
                      'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                      selected && optionIsIncome && 'border-income bg-income/10 text-income',
                      selected && !optionIsIncome && 'border-expense bg-expense/10 text-expense',
                      !selected && 'border-border bg-surface text-text-muted hover:bg-surface-2',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {errors.categoryType && (
              <p className="mt-1 text-xs text-expense">{errors.categoryType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              placeholder="Ex.: Alimentação"
              autoFocus
              className="w-full"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-expense">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="category-color">Cor</Label>
            <input
              id="category-color"
              type="color"
              className="h-9 w-full rounded-lg border border-border bg-bg/60 p-1"
              {...register('color')}
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Ícone</Label>
            <div className="grid max-h-44 grid-cols-8 gap-2 overflow-y-auto rounded-md border border-border bg-surface-2/30 p-2">
              {CATEGORY_ICONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Selecionar ícone ${option}`}
                  onClick={() => setValue('icon', option, { shouldDirty: true })}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border text-text-muted transition-colors',
                    selectedIcon === option
                      ? 'border-primary bg-primary/10 text-text'
                      : 'border-border bg-surface hover:bg-surface-2',
                  )}
                >
                  <EntityIcon name={option} size={18} />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {category ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
