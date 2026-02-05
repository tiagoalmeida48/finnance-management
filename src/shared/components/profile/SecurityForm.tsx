import { Stack, Typography, TextField, IconButton, Button } from '@mui/material';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface SecurityFormProps {
    password: string;
    setPassword: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
    showPassword: boolean;
    setShowPassword: (val: boolean) => void;
    pwdLoading: boolean;
    handlePasswordUpdate: () => void;
}

export function SecurityForm({
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    pwdLoading, handlePasswordUpdate
}: SecurityFormProps) {
    return (
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
    );
}
