import { Stack, Typography, TextField, Box, Button } from '@mui/material';
import { User as UserIcon, Mail, Calendar, Save } from 'lucide-react';

interface PersonalInfoFormProps {
    fullName: string;
    setFullName: (val: string) => void;
    email: string | undefined;
    createdAt: string | undefined;
    loading: boolean;
    handleUpdate: () => void;
}

export function PersonalInfoForm({ fullName, setFullName, email, createdAt, loading, handleUpdate }: PersonalInfoFormProps) {
    return (
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
                value={email || ''}
                InputProps={{
                    startAdornment: <Mail size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', px: 1 }}>
                <Calendar size={16} />
                <Typography variant="caption">
                    Membro desde: {createdAt ? new Date(createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '-'}
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
    );
}
