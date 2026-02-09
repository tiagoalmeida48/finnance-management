import { useState } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Stack, Alert } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSiteBranding } from '@/shared/hooks/useSiteBranding';

export function LoginPage() {
    const { siteTitle } = useSiteBranding();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                isolation: 'isolate',
                backgroundColor: '#090B12',
                backgroundImage: `
                    radial-gradient(circle at 18% 12%, rgba(201, 168, 76, 0.12), transparent 38%),
                    radial-gradient(circle at 78% 82%, rgba(59, 130, 246, 0.09), transparent 32%)
                `,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '34px 34px',
                    transform: 'perspective(1200px) rotateX(20deg) scale(1.25)',
                    transformOrigin: 'center top',
                    opacity: 0.52,
                },
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        opacity: 0,
                        transform: 'translateY(20px)',
                        animation: 'loginFadeIn 420ms ease-out forwards',
                        '@keyframes loginFadeIn': {
                            to: {
                                opacity: 1,
                                transform: 'translateY(0)',
                            },
                        },
                    }}
                >
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#D4AF37', fontWeight: 700, mb: 1 }}>
                                    {siteTitle}
                                </Typography>
                                <Typography color="text.secondary">
                                    Acesse sua conta para gerenciar seu patrimônio
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2}>
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
                                        {loading ? 'Processando...' : 'Entrar'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}
