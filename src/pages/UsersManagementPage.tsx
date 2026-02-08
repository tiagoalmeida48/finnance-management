import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { Edit2, KeyRound, Plus, Trash2, Users } from 'lucide-react';
import { colors } from '@/shared/theme';
import { supabase } from '@/lib/supabase/client';

interface ManagedUser {
    id: string;
    email: string;
    full_name: string | null;
    is_admin: boolean;
    created_at?: string | null;
}

const normalizeRpcError = (error: unknown) => {
    if (typeof error === 'object' && error && 'message' in error) {
        const message = (error as { message?: string }).message ?? '';
        if (message.toLowerCase().includes('could not find the function')) {
            return 'Função RPC de administração não encontrada no Supabase. Crie as funções admin_list_users/admin_create_user/admin_update_user/admin_update_user_password/admin_delete_user.';
        }
        return message || 'Não foi possível executar a operação.';
    }
    return 'Não foi possível executar a operação.';
};

export function UsersManagementPage() {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
    const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            const { data, error } = await supabase.rpc('admin_list_users');
            if (error) throw error;
            setUsers((data ?? []) as ManagedUser[]);
        } catch (error) {
            setMessage({ type: 'error', text: normalizeRpcError(error) });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setIsAdmin(false);
    };

    const handleCreate = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.rpc('admin_create_user', {
                p_email: email,
                p_password: password,
                p_full_name: fullName || null,
                p_is_admin: isAdmin
            });
            if (error) throw error;
            setCreateOpen(false);
            resetForm();
            setMessage({ type: 'success', text: 'Usuário criado com sucesso.' });
            await loadUsers();
        } catch (error) {
            setMessage({ type: 'error', text: normalizeRpcError(error) });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEdit = (user: ManagedUser) => {
        setEditTarget(user);
        setFullName(user.full_name ?? '');
        setEmail(user.email);
        setIsAdmin(user.is_admin);
    };

    const handleUpdate = async () => {
        if (!editTarget) return;
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.rpc('admin_update_user', {
                p_user_id: editTarget.id,
                p_email: email,
                p_full_name: fullName || null,
                p_is_admin: isAdmin
            });
            if (error) throw error;
            setEditTarget(null);
            setMessage({ type: 'success', text: 'Usuário atualizado com sucesso.' });
            await loadUsers();
        } catch (error) {
            setMessage({ type: 'error', text: normalizeRpcError(error) });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwordTarget) return;
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.rpc('admin_update_user_password', {
                p_user_id: passwordTarget.id,
                p_password: password
            });
            if (error) throw error;
            setPasswordTarget(null);
            setPassword('');
            setMessage({ type: 'success', text: 'Senha do usuário atualizada com sucesso.' });
        } catch (error) {
            setMessage({ type: 'error', text: normalizeRpcError(error) });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.rpc('admin_delete_user', {
                p_user_id: deleteTarget.id
            });
            if (error) throw error;
            setDeleteTarget(null);
            setMessage({ type: 'success', text: 'Usuário removido com sucesso.' });
            await loadUsers();
        } catch (error) {
            setMessage({ type: 'error', text: normalizeRpcError(error) });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Stack spacing={3}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Box>
                            <Typography sx={{
                                fontSize: '28px',
                                fontFamily: '"Plus Jakarta Sans"',
                                fontWeight: 700,
                                color: colors.textPrimary,
                                mb: 0.5,
                            }}>
                                Gerenciamento de Usuários
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>
                                Acesso administrativo para criar e manter contas de usuários.
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                onClick={() => {
                                    resetForm();
                                    setCreateOpen(true);
                                }}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2.5,
                                    py: 1.25,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    bgcolor: colors.accent,
                                    color: colors.bgPrimary,
                                    boxShadow: '0 2px 8px rgba(201, 168, 76, 0.25)',
                                    '&:hover': {
                                        bgcolor: '#D4B85C',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
                                    },
                                }}
                            >
                                Novo Usuário
                            </Button>
                        </Stack>
                    </Stack>

                    {message && <Alert severity={message.type}>{message.text}</Alert>}

                    <Card sx={{ borderRadius: '14px' }}>
                        <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Users size={18} color={colors.accent} />
                                    <Typography sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans"' }}>
                                        Usuários Cadastrados
                                    </Typography>
                                </Stack>

                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                        <CircularProgress color="primary" />
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>E-mail</TableCell>
                                                    <TableCell>Admin</TableCell>
                                                    <TableCell align="right">Ações</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.id} hover>
                                                        <TableCell sx={{ color: colors.textSecondary }}>{user.full_name || '-'}</TableCell>
                                                        <TableCell sx={{ color: colors.textSecondary }}>{user.email}</TableCell>
                                                        <TableCell sx={{ color: colors.textSecondary }}>{user.is_admin ? 'Sim' : 'Não'}</TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                                                                <Button size="small" variant="outlined" startIcon={<Edit2 size={14} />} onClick={() => handleOpenEdit(user)}>
                                                                    Editar
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<KeyRound size={14} />}
                                                                    onClick={() => {
                                                                        setPasswordTarget(user);
                                                                        setPassword('');
                                                                    }}
                                                                >
                                                                    Senha
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<Trash2 size={14} />}
                                                                    onClick={() => setDeleteTarget(user)}
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>

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
        </Box>
    );
}
