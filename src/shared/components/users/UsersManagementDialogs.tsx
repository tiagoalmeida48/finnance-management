import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import type { ManagedUser } from '@/shared/interfaces/user-management.interface';

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
    return (
        <>
            <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Novo Usuário</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Nome completo" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="E-mail" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Senha inicial" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>Usuário administrador</Typography>
                                <Switch checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={saving || !email || !password}>
                        Criar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(editTarget)} onClose={() => !saving && setEditTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Nome completo" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="E-mail" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>Usuário administrador</Typography>
                                <Switch checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTarget(null)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={saving || !email}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(passwordTarget)} onClose={() => !saving && setPasswordTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogContent>
                    <TextField
                        sx={{ mt: 0.5 }}
                        label="Nova senha"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordTarget(null)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleUpdatePassword} variant="contained" disabled={saving || !password}>
                        Atualizar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onClose={() => !saving && setDeleteTarget(null)}>
                <DialogTitle>Excluir Usuário</DialogTitle>
                <DialogContent>
                    <Typography>
                        Confirma remover o usuário <strong>{deleteTarget?.email}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
