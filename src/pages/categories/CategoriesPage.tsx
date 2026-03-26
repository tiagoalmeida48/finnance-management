import { useMemo, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useCategoriesPageLogic } from '@/pages/categories/hooks/useCategoriesPageLogic';
import { CategoryCard } from './components/cards/CategoryCard';
import { CategoryFormModal } from './components/modals/CategoryFormModal';
import { DeleteConfirmationModal } from '@/shared/components/composite/DeleteConfirmationModal';
import { colors } from '@/shared/theme';
import { ActionMenuPopover } from '@/shared/components/composite/ActionMenuPopover';
import { EditDeleteMenuActions } from '@/shared/components/composite/EditDeleteMenuActions';
import { Container } from '@/shared/components/layout/Container';
import { Section } from '@/shared/components/layout/Section';
import { Grid } from '@/shared/components/layout/Grid';
import { messages } from '@/shared/i18n/messages';
import { PageHeader } from '@/shared/components/composite/PageHeader';
import { CollectionState } from '@/shared/components/composite/CollectionState';
import { Row } from '@/shared/components/layout/Row';
import { Heading } from '@/shared/components/ui/Heading';
import { Text } from '@/shared/components/ui/Text';

export function CategoriesPage() {
  const pageMessages = messages.categories.page;
  const deleteMessages = messages.categories.deleteModal;
  const {
    categories,
    isLoading,
    createCategory,
    deleteCategory,
    modalOpen,
    setModalOpen,
    selectedCategory,
    setSelectedCategory,
    deleteModalOpen,
    setDeleteModalOpen,
    anchorEl,
    setMenuCategory,
    handleOpenMenu,
    handleCloseMenu,
    handleAddDefault,
    handleDelete,
    handleConfirmDelete,
    handleEdit,
    handleAdd,
  } = useCategoriesPageLogic();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    const base = categories || [];
    const q = searchTerm.trim().toLowerCase();
    const filtered = q ? base.filter((c) => c.name.toLowerCase().includes(q)) : base;

    return [...filtered].sort((a, b) => {
      const typeOrder = (type: string) => {
        if (type === 'income') return 0;
        if (type === 'expense') return 1;
        return 2;
      };

      const byType = typeOrder(a.type) - typeOrder(b.type);
      if (byType !== 0) return byType;

      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    });
  }, [categories, searchTerm]);
  const isEmpty = filteredCategories.length === 0;

  return (
    <Section>
      <Container>
        <PageHeader
          title={
            <Row className="items-center gap-1">
              <Heading
                level={1}
                className="text-2xl font-bold md:text-[34px] text-[var(--color-text-primary)] mb-0"
              >
                {pageMessages.title}
              </Heading>
              <Sparkles size={16} color={colors.accent} />
            </Row>
          }
          subtitle={pageMessages.subtitle}
          actions={
            <Row className="mt-2 flex-wrap items-center gap-1.5 md:mt-0">
              {categories?.length === 0 && (
                <Button
                  variant="outlined"
                  onClick={handleAddDefault}
                  disabled={createCategory.isPending}
                  className="flex-1 border-[var(--color-border)]"
                >
                  {pageMessages.addDefault}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                size="large"
                onClick={handleAdd}
                className="flex-1"
              >
                {pageMessages.newCategory}
              </Button>
            </Row>
          }
          className="w-full flex-col items-start md:flex-row md:items-center"
        />

        <Container
          unstyled
          className="mb-3 flex flex-col justify-between gap-2 lg:flex-row lg:items-center"
        >
          <Container unstyled className="relative min-w-full lg:min-w-[300px]">
            <Search
              size={16}
              color={colors.textMuted}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={pageMessages.searchPlaceholder}
              className="pl-9"
            />
          </Container>
        </Container>

        <Grid className="sm:grid-cols-2 lg:grid-cols-3">
          <CollectionState
            isLoading={isLoading}
            isEmpty={isEmpty}
            loadingFallback={
              <Card className="py-8 text-center sm:col-span-2 lg:col-span-3">
                <Text className="text-white/70">{pageMessages.loading}</Text>
              </Card>
            }
            emptyFallback={
              <Card className="border-[1px] border-dashed border-[var(--color-border)] py-8 text-center sm:col-span-2 lg:col-span-3">
                <Text className="mb-0.75 font-semibold text-[var(--color-text-primary)]">
                  {pageMessages.emptyTitle}
                </Text>
                <Text className="mb-2 text-white/70">{pageMessages.emptyDescription}</Text>
                <Button variant="outlined" startIcon={<Plus size={16} />} onClick={handleAdd}>
                  {pageMessages.createCategory}
                </Button>
              </Card>
            }
          >
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} handleOpenMenu={handleOpenMenu} />
            ))}
          </CollectionState>
        </Grid>

        <ActionMenuPopover open={Boolean(anchorEl)} onClose={handleCloseMenu} anchorEl={anchorEl}>
          <EditDeleteMenuActions onEdit={handleEdit} onDelete={handleDelete} />
        </ActionMenuPopover>

        <CategoryFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={selectedCategory}
          defaultType="expense"
        />

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setMenuCategory(null);
            setSelectedCategory(undefined);
          }}
          onConfirm={handleConfirmDelete}
          title={deleteMessages.title}
          description={deleteMessages.description}
          itemName={selectedCategory?.name}
          loading={deleteCategory.isPending}
        />
      </Container>
    </Section>
  );
}
