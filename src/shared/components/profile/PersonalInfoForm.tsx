import { ReactNode } from 'react';
import { Stack, Typography, TextField, Box, Button, InputAdornment, Grid } from '@mui/material';
import { User as UserIcon, Mail, Save } from 'lucide-react';

interface PersonalInfoFormProps {
    fullName: string;
    setFullName: (val: string) => void;
    email: string | undefined;
    loading: boolean;
    handleUpdate: () => void;
    photoSection?: ReactNode;
}

export function PersonalInfoForm({ fullName, setFullName, email, loading, handleUpdate, photoSection }: PersonalInfoFormProps) {
    return (
        <Stack spacing={2.2}>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.35 }}>
                    Informacoes pessoais
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    {photoSection}
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Nome completo"
                            fullWidth
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <UserIcon size={17} style={{ opacity: 0.65 }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            label="Email"
                            fullWidth
                            disabled
                            value={email || ''}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={17} style={{ opacity: 0.65 }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>
                </Grid>
            </Grid>

            <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save size={18} />}
                onClick={handleUpdate}
                disabled={loading}
                sx={{
                    mt: 0.5,
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1.2
                }}
            >
                {loading ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
        </Stack>
    );
}
