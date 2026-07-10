import { Users } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Spinner,
} from '@/shared/components/ui';
import {
  DeleteUserDialog,
  UserFormModal,
  UserPasswordModal,
  UsersTable,
  useUsersPageLogic,
} from '@/features/users';

export function UsersPage() {
  const {
    users,
    isEmpty,
    isLoading,
    isError,
    formOpen,
    editing,
    passwordTarget,
    pendingDelete,
    submitting,
    savingPassword,
    deleting,
    openCreate,
    openEdit,
    handleFormOpenChange,
    submitForm,
    requestPassword,
    submitPassword,
    requestDelete,
    confirmDelete,
    toggleActive,
  } = useUsersPageLogic();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        eyebrow="Administração"
        title="Usuários"
        description="Gerencie os usuários com acesso ao sistema."
        actions={<Button onClick={openCreate}>Novo usuário</Button>}
      />

      {isLoading ? (
        <div className="py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <Card>
          <CardContent>
            <p className="text-expense">Não foi possível carregar os usuários.</p>
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-semibold text-text">Nenhum usuário cadastrado</p>
              <p className="text-sm text-text-muted">
                Crie o primeiro usuário para liberar o acesso ao sistema.
              </p>
              <Button onClick={openCreate}>Criar usuário</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Usuários cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={users}
              onEdit={openEdit}
              onResetPassword={requestPassword}
              onDelete={requestDelete}
              onToggleActive={toggleActive}
            />
          </CardContent>
        </Card>
      )}

      <UserFormModal
        open={formOpen}
        user={editing}
        submitting={submitting}
        onOpenChange={handleFormOpenChange}
        onSubmit={submitForm}
      />

      <UserPasswordModal
        user={passwordTarget}
        submitting={savingPassword}
        onOpenChange={(open) => !open && requestPassword(null)}
        onSubmit={submitPassword}
      />

      <DeleteUserDialog
        user={pendingDelete}
        deleting={deleting}
        onOpenChange={(open) => !open && requestDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
