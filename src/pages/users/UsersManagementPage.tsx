import { useUsersManagementPageLogic } from "@/pages/users/hooks/useUsersManagementPageLogic";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Edit2, KeyRound, Plus, Trash2, Users } from "lucide-react";
import { colors } from "@/shared/theme";
import { UsersManagementDialogs } from "@/pages/users/components/dialogs/UsersManagementDialogs";
import { Container } from "@/shared/components/layout/Container";
import { Section } from "@/shared/components/layout/Section";
import { PageHeader } from "@/shared/components/composite/PageHeader";
import { CollectionState } from "@/shared/components/composite/CollectionState";
import { Text } from "@/shared/components/ui/Text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/components/layout/Table";

export function UsersManagementPage() {
  const {
    users,
    loading,
    message,
    isEmpty,
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
    resetForm,
    handleCreate,
    handleOpenEdit,
    handleUpdate,
    handleUpdatePassword,
    handleDelete,
    pageMessages,
  } = useUsersManagementPageLogic();

  return (
    <Section>
      <Container>
        <Container unstyled className="space-y-3">
          <PageHeader
            title={pageMessages.title}
            subtitle={pageMessages.subtitle}
            actions={
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => {
                  resetForm();
                  setCreateOpen(true);
                }}
                className="rounded-[10px] px-2.5 py-[5px] text-[13px] font-semibold shadow-[0_2px_8px_var(--overlay-primary-25)] hover:-translate-y-px hover:bg-[var(--color-primary-light)] hover:shadow-[0_4px_16px_var(--overlay-primary-30)]"
              >
                {pageMessages.newUser}
              </Button>
            }
            className="w-full flex-col items-start sm:flex-row sm:items-center"
          />

          {message && (
            <Container
              unstyled
              className={`rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-400/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message.text}
            </Container>
          )}

          <Card className="rounded-[14px]">
            <CardContent className="p-[18px] md:p-[22px]">
              <Container unstyled className="space-y-2">
                <Container unstyled className="flex items-center gap-1">
                  <Users size={18} color={colors.accent} />
                  <Text className="font-heading font-bold">
                    {pageMessages.registeredUsers}
                  </Text>
                </Container>

                <CollectionState
                  isLoading={loading}
                  isEmpty={isEmpty}
                  loadingFallback={
                    <Container unstyled className="flex justify-center py-5">
                      <Text
                        as="span"
                        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-r-transparent"
                      />
                    </Container>
                  }
                  emptyFallback={
                    <Container
                      unstyled
                      className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-text-secondary)]"
                    >
                      {pageMessages.empty}
                    </Container>
                  }
                >
                  <Container unstyled className="overflow-x-auto">
                    <Table className="w-full text-left text-sm">
                      <TableHead>
                        <TableRow className="border-b border-white/10">
                          <TableHeaderCell className="border-b-0 px-2 py-2">
                            {pageMessages.columns.name}
                          </TableHeaderCell>
                          <TableHeaderCell className="border-b-0 px-2 py-2">
                            {pageMessages.columns.email}
                          </TableHeaderCell>
                          <TableHeaderCell className="border-b-0 px-2 py-2">
                            {pageMessages.columns.admin}
                          </TableHeaderCell>
                          <TableHeaderCell className="border-b-0 px-2 py-2 text-right">
                            {pageMessages.columns.actions}
                          </TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow
                            key={user.id}
                            className="border-b border-white/5"
                          >
                            <TableCell className="border-b-0 px-2 py-2 text-[var(--color-text-secondary)]">
                              {user.full_name || "-"}
                            </TableCell>
                            <TableCell className="border-b-0 px-2 py-2 text-[var(--color-text-secondary)]">
                              {user.email}
                            </TableCell>
                            <TableCell className="border-b-0 px-2 py-2 text-[var(--color-text-secondary)]">
                              {user.is_admin
                                ? pageMessages.yes
                                : pageMessages.no}
                            </TableCell>
                            <TableCell className="border-b-0 px-2 py-2">
                              <Container
                                unstyled
                                className="flex justify-end gap-1"
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Edit2 size={14} />}
                                  onClick={() => handleOpenEdit(user)}
                                >
                                  {pageMessages.actions.edit}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<KeyRound size={14} />}
                                  onClick={() => {
                                    setPasswordTarget(user);
                                    setPassword("");
                                  }}
                                >
                                  {pageMessages.actions.password}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Trash2 size={14} />}
                                  onClick={() => setDeleteTarget(user)}
                                >
                                  {pageMessages.actions.delete}
                                </Button>
                              </Container>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Container>
                </CollectionState>
              </Container>
            </CardContent>
          </Card>
        </Container>
      </Container>

      <UsersManagementDialogs
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        editTarget={editTarget}
        setEditTarget={setEditTarget}
        passwordTarget={passwordTarget}
        setPasswordTarget={setPasswordTarget}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        saving={saving}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        handleUpdatePassword={handleUpdatePassword}
        handleDelete={handleDelete}
      />
    </Section>
  );
}
