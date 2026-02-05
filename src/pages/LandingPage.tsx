import { Box, Button, Container, Typography, Stack, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Shield, BarChart3, Clock } from 'lucide-react';

export function LandingPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Hero Section */}
            <Container maxWidth="lg">
                <Box sx={{ pt: { xs: 10, md: 20 }, pb: { xs: 10, md: 15 } }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h1" gutterBottom sx={{ lineHeight: 1.1 }}>
                                    Domine suas finanças com <span style={{ color: '#D4AF37' }}>classe e precisão.</span>
                                </Typography>
                                <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                                    Uma plataforma minimalista projetada para quem valoriza clareza, segurança e o crescimento do seu patrimônio.
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        component={RouterLink as any}
                                        to="/auth/login"
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowRight />}
                                    >
                                        Começar Agora
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        Ver Demonstração
                                    </Button>
                                </Stack>
                            </motion.div>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 400,
                                        bgcolor: 'rgba(212, 175, 55, 0.05)',
                                        border: '1px solid rgba(212, 175, 55, 0.2)',
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '120%',
                                            height: '120%',
                                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                                            zIndex: -1,
                                        }
                                    }}
                                >
                                    <BarChart3 size={120} color="#D4AF37" />
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Box>

                {/* Features Preview */}
                <Grid container spacing={4} sx={{ mb: 15 }}>
                    {[
                        { icon: <Shield color="#D4AF37" />, title: 'Segurança Suíça', desc: 'Isolamento de dados nível bancário via Postgres RLS.' },
                        { icon: <BarChart3 color="#D4AF37" />, title: 'Analytics Real', desc: 'Gráficos dinâmicos que contam a história do seu dinheiro.' },
                        { icon: <Clock color="#D4AF37" />, title: 'Automação Moral', desc: 'Nunca mais esqueça uma fatura ou pagamento recorrente.' },
                    ].map((item, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Box sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid #2A2A2A', borderRadius: 2 }}>
                                    <Box sx={{ mb: 2 }}>{item.icon}</Box>
                                    <Typography variant="h6" gutterBottom>{item.title}</Typography>
                                    <Typography color="text.secondary">{item.desc}</Typography>
                                </Box>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
