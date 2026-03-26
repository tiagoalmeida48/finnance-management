import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import type { ManagedUser } from '@/shared/interfaces/user-management.interface';
import { messages } from '@/shared/i18n/messages';
import { FormDialog } from '@/shared/components/composite/FormDialog';
import { FormField } from '@/shared/components/forms/FormField';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { Text } from '@/shared/components/ui/Text';

interface UsersManagementDialogsProps {
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  editTarget: ManagedUser | null;
  setEditTarget: (user: ManagedUser | null) => void;
  passwordTarget: ManagedUser | null;
  setPasswordTarget: (user: ManagedUser | null) => void;
  deleteTarget: ManagedUser | null;
  setDeleteTarget: (user: ManagedUser | null) => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  saving: boolean;
  handleCreate: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  handleUpdatePassword: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function UsersManagementDialogs({
  createOpen,
  setCreateOpen,
  editTarget,
  setEditTarget,
  passwordTarget,
  setPasswordTarget,
  deleteTarget,
  setDeleteTarget,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  isAdmin,
  setIsAdmin,
  saving,
  handleCreate,
  handleUpdate,
  handleUpdatePassword,
  handleDelete,
}: UsersManagementDialogsProps) {
  const dialogMessages = messages.users.dialogs;
  return (
    <>
      <FormDialog
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        maxWidth="sm"
        title={dialogMessages.createTitle}
        onSubmit={(event) => {
          event.preventDefault();
          void handleCreate();
        }}
        actions={
          <>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>
              {messages.common.actions.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={saving || !email || !password}>
              {dialogMessages.create}
            </Button>
          </>
        }
      >
        <Stack className="mt-0.5 gap-1.5">
          <FormField htmlFor="user-create-full-name" label={dialogMessages.fullNameLabel}>
            <Input
              id="user-create-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <FormField htmlFor="user-create-email" label={dialogMessages.emailLabel}>
            <Input
              id="user-create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField htmlFor="user-create-password" label={dialogMessages.initialPasswordLabel}>
            <Input
              id="user-create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <Row className="items-center gap-1">
            <label
              htmlFor="user-create-admin"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              {dialogMessages.adminUserLabel}
            </label>
            <input
              id="user-create-admin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
          </Row>
        </Stack>
      </FormDialog>

      <FormDialog
        open={Boolean(editTarget)}
        onClose={() => !saving && setEditTarget(null)}
        maxWidth="sm"
        title={dialogMessages.editTitle}
        onSubmit={(event) => {
          event.preventDefault();
          void handleUpdate();
        }}
        actions={
          <>
            <Button onClick={() => setEditTarget(null)} disabled={saving}>
              {messages.common.actions.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={saving || !email}>
              {dialogMessages.save}
            </Button>
          </>
        }
      >
        <Stack className="mt-0.5 gap-1.5">
          <FormField htmlFor="user-edit-full-name" label={dialogMessages.fullNameLabel}>
            <Input
              id="user-edit-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <FormField htmlFor="user-edit-email" label={dialogMessages.emailLabel}>
            <Input
              id="user-edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <Row className="items-center gap-1">
            <label
              htmlFor="user-edit-admin"
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              {dialogMessages.adminUserLabel}
            </label>
            <input
              id="user-edit-admin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
          </Row>
        </Stack>
      </FormDialog>

      <FormDialog
        open={Boolean(passwordTarget)}
        onClose={() => !saving && setPasswordTarget(null)}
        maxWidth="xs"
        title={dialogMessages.passwordTitle}
        onSubmit={(event) => {
          event.preventDefault();
          void handleUpdatePassword();
        }}
        actions={
          <>
            <Button onClick={() => setPasswordTarget(null)} disabled={saving}>
              {messages.common.actions.cancel}
            </Button>
            <Button type="submit" variant="contained" disabled={saving || !password}>
              {dialogMessages.save}
            </Button>
          </>
        }
      >
        <Stack className="mt-0.5">
          <FormField htmlFor="user-password" label={dialogMessages.newPasswordLabel}>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        </Stack>
      </FormDialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !saving && setDeleteTarget(null)}>
        <DialogTitle>{dialogMessages.deleteTitle}</DialogTitle>
        <DialogContent>
          <Text>{dialogMessages.deleteDescription(deleteTarget?.email ?? '-')}</Text>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={saving}>
            {messages.common.actions.cancel}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {messages.common.actions.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
