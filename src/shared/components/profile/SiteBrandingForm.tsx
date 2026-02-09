import { useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { ImagePlus, Palette } from 'lucide-react';
import { useSiteBranding } from '@/shared/hooks/useSiteBranding';

export function SiteBrandingForm() {
    const { siteTitle, logoImage, updateBranding, saving } = useSiteBranding();
    const [titleInput, setTitleInput] = useState(siteTitle);
    const [logoImageInput, setLogoImageInput] = useState<string | null>(logoImage);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        setTitleInput(siteTitle);
    }, [siteTitle]);

    useEffect(() => {
        setLogoImageInput(logoImage);
    }, [logoImage]);

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setLogoImageInput(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBranding = async () => {
        setMessage(null);
        try {
            await updateBranding({
                siteTitle: titleInput,
                logoImage: logoImageInput,
            });
            setMessage({ type: 'success', text: 'Identidade salva no Supabase.' });
        } catch (error: unknown) {
            const text = error instanceof Error ? error.message : 'Erro ao salvar identidade.';
            setMessage({ type: 'error', text });
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.02)',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, color: 'primary.main' }}>
                <Palette size={16} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Identidade do Site
                </Typography>
            </Stack>

            <Stack spacing={1.5}>
                {message && (
                    <Alert severity={message.type}>
                        {message.text}
                    </Alert>
                )}
                <TextField
                    label="Título do Site"
                    fullWidth
                    value={titleInput}
                    onChange={(event) => setTitleInput(event.target.value)}
                />
                <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                        Logo do Site (imagem)
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 52,
                                height: 52,
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.14)',
                                bgcolor: 'rgba(255,255,255,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            {logoImageInput ? (
                                <Box component="img" src={logoImageInput} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>LOGO</Typography>
                            )}
                        </Box>
                        <Button component="label" variant="outlined" startIcon={<ImagePlus size={16} />} disabled={saving}>
                            Escolher Imagem
                            <input hidden type="file" accept="image/*" onChange={handleLogoFileChange} />
                        </Button>
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => setLogoImageInput(null)}
                            disabled={saving}
                            sx={{ color: 'text.secondary' }}
                        >
                            Remover
                        </Button>
                    </Stack>
                </Stack>
                <Button variant="contained" onClick={handleSaveBranding} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar Identidade'}
                </Button>
            </Stack>
        </Box>
    );
}
