import { Stack, Typography, TextField, IconButton, Button, InputAdornment, Box } from '@mui/material';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
        <Stack spacing={2.2}>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.35 }}>
                    Protecao da conta
                </Typography>
            </Box>

            <TextField
                label="Nova senha"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Lock size={17} style={{ opacity: 0.65 }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: 'text.secondary' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                    )
                }}
            />

            <TextField
                label="Confirmar nova senha"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Lock size={17} style={{ opacity: 0.65 }} />
                        </InputAdornment>
                    )
                }}
            />

            <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePasswordUpdate}
                disabled={pwdLoading}
                startIcon={<ShieldCheck size={18} />}
                sx={{
                    mt: 0.5,
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1.2
                }}
            >
                {pwdLoading ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
        </Stack>
    );
}
