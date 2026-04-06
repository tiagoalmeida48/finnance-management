import { createElement, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Coins } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '@/shared/hooks/api/useCategories';
import { Category } from '@/shared/interfaces/category.interface';
import { colors } from '@/shared/theme';
import { categoryIconOptions, getCategoryIcon } from '../categoryIcons';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';
import { ColorPickerField } from '@/shared/components/forms/ColorPickerField';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { messages } from '@/shared/i18n/messages';
import { FormDialog } from '@/shared/components/composite/FormDialog';
import { FormField } from '@/shared/components/forms/FormField';
import { Text } from '@/shared/components/ui/Text';
import { Container } from '@/shared/components/layout/Container';

const categorySchema = z.object({
  name: z.string().min(3, messages.categories.form.validation.nameMin),
  type: z.enum(['income', 'expense']),
  icon: z.string(),
  color: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  defaultType?: 'income' | 'expense';
}

export function CategoryFormModal({
  open,
  onClose,
  category,
  defaultType = 'expense',
}: CategoryFormModalProps) {
  const formMessages = messages.categories.form;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const selectedColor = useWatch({
    control,
    name: 'color',
    defaultValue: '#c9a84c',
  });
  const selectedIcon = useWatch({ control, name: 'icon', defaultValue: 'tag' });
  const selectedType = useWatch({
    control,
    name: 'type',
    defaultValue: defaultType,
  });
  const categoryName = useWatch({ control, name: 'name', defaultValue: '' });

  const previewIconElement = createElement(getCategoryIcon(selectedIcon), {
    size: 19,
  });
  const previewIconRef = useApplyElementStyles<HTMLDivElement>({
    color: selectedColor || colors.accent,
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name || '',
        type: category?.type || defaultType,
        icon: category?.icon || 'tag',
        color: category?.color || '#c9a84c',
      });
    }
  }, [category, open, reset, defaultType]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, updates: values });
      } else {
        await createCategory.mutateAsync(values);
      }
      onClose();
    } catch {
      //
    }
  };

  const isSaving = createCategory.isPending || updateCategory.isPending;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="w-[95vw] max-w-[500px] border border-white/10 bg-[var(--color-bgSecondary)] shadow-[0_24px_64px_var(--overlay-black-50)]"
      title={category ? formMessages.modal.editTitle : formMessages.modal.createTitle}
      titleClassName="pb-1 font-bold text-[22px] text-white"
      onSubmit={handleSubmit(onSubmit)}
      contentClassName="pt-[14px] px-6"
      actionsClassName="gap-3 p-6 pt-4"
      actions={
        <Row className="w-full justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#c9a84c]/20 px-6 py-2.5 font-semibold text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/30"
          >
            {messages.common.actions.cancel}
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <Text
                  as="span"
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                />
              ) : (
                <Coins size={16} />
              )
            }
            className="rounded-xl px-6 py-2.5 font-bold text-black"
          >
            {isSaving ? formMessages.actions.saving : formMessages.actions.save}
          </Button>
        </Row>
      }
    >
      <Stack className="gap-5">
        <Row className="items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
          <Container
            unstyled
            ref={previewIconRef}
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03]"
          >
            {previewIconElement}
          </Container>
          <Container unstyled className="flex flex-col gap-0.5">
            <Text className="text-[15px] font-bold text-white">
              {categoryName?.trim() || formMessages.preview.defaultName}
            </Text>
            <Text className="text-[13px] text-[var(--color-text-secondary)]">
              {selectedType === 'expense'
                ? formMessages.preview.expense
                : formMessages.preview.income}
            </Text>
          </Container>
        </Row>

        <FormField
          htmlFor="category-name"
          label={formMessages.fields.nameLabel}
          errorMessage={errors.name?.message}
          labelClassName="text-sm font-semibold text-white/90"
        >
          <Input
            id="category-name"
            placeholder={formMessages.fields.namePlaceholder}
            className="rounded-xl bg-white/[0.03]"
            {...register('name')}
          />
        </FormField>

        <Container unstyled>
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            TIPO
          </Text>
          <Row className="w-full gap-2">
            <Button
              type="button"
              onClick={() => setValue('type', 'expense', { shouldDirty: true })}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all ${selectedType === 'expense' ? 'bg-[var(--color-error)] text-white shadow-sm hover:bg-[var(--color-error)] hover:brightness-90' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {formMessages.fields.expense}
            </Button>
            <Button
              type="button"
              onClick={() => setValue('type', 'income', { shouldDirty: true })}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all ${selectedType === 'income' ? 'bg-[var(--color-success)] text-white shadow-sm hover:bg-[var(--color-success)] hover:brightness-90' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {formMessages.fields.income}
            </Button>
          </Row>
        </Container>

        <Container unstyled>
          <Text className="mb-2 text-sm font-semibold text-white/90">
            {formMessages.fields.iconLabel}
          </Text>
          <div className="grid max-h-[160px] grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-2 sm:grid-cols-7 custom-scrollbar">
            {categoryIconOptions.map((iconName) => {
              const IconComponent = getCategoryIcon(iconName);
              const isSelected = selectedIcon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setValue('icon', iconName, { shouldDirty: true })}
                  className={`flex aspect-square items-center justify-center rounded-lg border transition-all ${
                    isSelected
                      ? 'border-transparent bg-[var(--color-accent)] text-black shadow-sm'
                      : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  title={iconName.replace('-', ' ')}
                >
                  <IconComponent size={20} />
                </button>
              );
            })}
          </div>
        </Container>

        <ColorPickerField
          value={selectedColor || '#c9a84c'}
          onChange={(value) => setValue('color', value, { shouldDirty: true })}
          title={formMessages.colorPicker.title}
          description={formMessages.colorPicker.description}
        />

        <input type="hidden" {...register('type')} />
        <input type="hidden" {...register('icon')} />
        <input type="hidden" {...register('color')} />
      </Stack>
    </FormDialog>
  );
}
