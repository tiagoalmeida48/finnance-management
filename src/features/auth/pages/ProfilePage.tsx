import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    Stack,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Badge
} from '@mui/material';
import { User as UserIcon, Mail, Calendar, Save, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../../../lib/supabase/auth-context';
import { supabase } from '../../../lib/supabase/client';

export function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Password change state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || null);
            setFetching(false);
        } else if (user && fetching) {
            refreshProfile().finally(() => setFetching(false));
        } else {
            setFetching(false);
        }
    }, [profile, user, fetching]);

    async function handleUpdate() {
        if (!user) return;
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                if (error.code === 'PGRST205') {
                    throw new Error('A tabela de perfis não foi encontrada. Por favor, verifique as permissões no Supabase.');
                }
                throw error;
            }
            await refreshProfile();
            setMessage({ type: 'success', text: 'Nome atualizado com sucesso!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);
            setMessage(null);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para o avatar.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload file to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            await refreshProfile();
            setMessage({ type: 'success', text: 'Foto do perfil atualizada!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar avatar. Certifique-se que o bucket "avatars" existe no Supabase.' });
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    async function handlePasswordUpdate() {
        if (!user) return;
        if (!password) {
            setMessage({ type: 'error', text: 'A senha não pode estar vazia.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setPwdLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha.' });
        } finally {
            setPwdLoading(false);
        }
    }

    if (fetching) {
        return (
            <Box sx={{ pt: 12, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 4, pb: 6 }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Perfil</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>Gerencie suas informações e segurança.</Typography>

                <Stack spacing={4}>
                    {/* Profile Section */}
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <IconButton
                                                    component="label"
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: 'primary.main',
                                                        color: '#000',
                                                        '&:hover': { bgcolor: 'primary.dark' },
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                                        border: '2px solid #121212'
                                                    }}
                                                >
                                                    <input
                                                        hidden
                                                        accept="image/*"
                                                        type="file"
                                                        onChange={uploadAvatar}
                                                        disabled={uploading}
                                                    />
                                                    {uploading ? <CircularProgress size={16} color="inherit" /> : <Camera size={14} />}
                                                </IconButton>
                                            }
                                        >
                                            <Avatar
                                                src={avatarUrl || undefined}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    bgcolor: 'primary.main',
                                                    color: '#000',
                                                    fontSize: '2.2rem',
                                                    fontWeight: 800,
                                                    border: '2px solid rgba(212, 175, 55, 0.2)'
                                                }}
                                            >
                                                {!avatarUrl && (fullName ? fullName[0].toUpperCase() : user?.email?.[0].toUpperCase())}
                                            </Avatar>
                                        </Badge>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {fullName || 'Usuário'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                {message && (
                                    <Alert severity={message.type} sx={{ borderRadius: 1 }}>
                                        {message.text}
                                    </Alert>
                                )}

                                <Stack spacing={3}>
                                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Informações Pessoais
                                    </Typography>
                                    <TextField
                                        label="Nome Completo"
                                        fullWidth
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        InputProps={{
                                            startAdornment: <UserIcon size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                                        }}
                                    />

                                    <TextField
                                        label="Email"
                                        fullWidth
                                        disabled
                                        value={user?.email || ''}
                                        InputProps={{
                                            startAdornment: <Mail size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', px: 1 }}>
                                        <Calendar size={16} />
                                        <Typography variant="caption">
                                            Membro desde: {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '-'}
                                        </Typography>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={<Save size={20} />}
                                        onClick={handleUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? 'Salvando...' : 'Atualizar Nome'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Segurança
                                </Typography>

                                <TextField
                                    label="Nova Senha"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Lock size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </IconButton>
                                        )
                                    }}
                                />

                                <TextField
                                    label="Confirmar Nova Senha"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Lock size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                                    }}
                                />

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="large"
                                    onClick={handlePasswordUpdate}
                                    disabled={pwdLoading}
                                    sx={{
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        '&:hover': {
                                            borderColor: 'primary.dark',
                                            bgcolor: 'rgba(212, 175, 55, 0.05)'
                                        }
                                    }}
                                >
                                    {pwdLoading ? 'Atualizando...' : 'Alterar Senha'}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
