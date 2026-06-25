import { Tags } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  SegmentedControl,
  Spinner,
} from '@/shared/components/ui';
import {
  CategoryCard,
  CategoryFormModal,
  DeleteCategoryDialog,
  useCategoriesPageLogic,
} from '@/features/categories';

export function CategoriesPage() {
  const {
    categories,
    hasCategories,
    typeFilter,
    setTypeFilter,
    isEmpty,
    isLoading,
    isError,
    formOpen,
    editing,
    pendingDelete,
    saving,
    deleting,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useCategoriesPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tags}
        title="Categorias"
        description="Organize suas receitas e despesas por categoria."
        actions={<Button onClick={openCreate}>Nova categoria</Button>}
      />

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <p className="text-expense">Não foi possível carregar as categorias.</p>
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Tags}
              title="Nenhuma categoria cadastrada"
              description="Crie sua primeira categoria para começar a organizar suas finanças."
              action={<Button onClick={openCreate}>Criar categoria</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {hasCategories && (
            <SegmentedControl
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'income', label: 'Receitas' },
                { value: 'expense', label: 'Despesas' },
              ]}
            />
          )}

          {categories.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-muted">
              Nenhuma categoria neste filtro.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.category}
                  category={category}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        category={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      <DeleteCategoryDialog
        category={pendingDelete}
        deleting={deleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
