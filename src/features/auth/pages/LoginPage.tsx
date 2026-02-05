import { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Stack, Alert, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (isRegister) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSuccess('Verifique seu e-mail para confirmar o cadastro!');
                setLoading(false);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                navigate('/dashboard');
            }
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard',
            }
        });
        if (error) setError(error.message);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#D4AF37', fontWeight: 700, mb: 1 }}>
                                    Finnance Management
                                </Typography>
                                <Typography color="text.secondary">
                                    {isRegister ? 'Crie sua conta gratuita' : 'Acesse sua conta para gerenciar seu patrimônio'}
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2}>
                                    {isRegister && (
                                        <TextField
                                            fullWidth
                                            label="Nome Completo"
                                            variant="outlined"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    )}
                                    <TextField
                                        fullWidth
                                        label="E-mail"
                                        variant="outlined"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Senha"
                                        variant="outlined"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        type="submit"
                                        disabled={loading}
                                        sx={{ mt: 2 }}
                                    >
                                        {loading ? 'Processando...' : isRegister ? 'Cadastrar' : 'Entrar'}
                                    </Button>
                                </Stack>
                            </form>

                            <Box sx={{ my: 3 }}>
                                <Divider>
                                    <Typography variant="body2" color="text.secondary">OU</Typography>
                                </Divider>
                            </Box>

                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                onClick={handleGoogleLogin}
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                Continuar com Google
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                                    {' '}
                                    <Button
                                        onClick={() => setIsRegister(!isRegister)}
                                        sx={{ color: '#D4AF37', textTransform: 'none', fontWeight: 700, p: 0, minWidth: 'auto' }}
                                    >
                                        {isRegister ? 'Faça Login' : 'Cadastre-se'}
                                    </Button>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
}
