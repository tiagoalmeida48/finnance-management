import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
    groups,
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Categorias</h1>
          <p className="text-sm text-text-muted">
            Organize suas receitas e despesas por categoria.
          </p>
        </div>
        <Button onClick={openCreate}>Nova categoria</Button>
      </div>

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
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-semibold text-text">Nenhuma categoria cadastrada</p>
              <p className="text-sm text-text-muted">
                Crie sua primeira categoria para começar a organizar suas finanças.
              </p>
              <Button onClick={openCreate}>Criar categoria</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.type}>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((category) => (
                    <CategoryCard
                      key={category.category}
                      category={category}
                      onEdit={openEdit}
                      onDelete={requestDelete}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
