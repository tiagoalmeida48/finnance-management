import { Button, Dialog, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { colors } from '@/shared/theme';

interface SalaryCreateSettingDialogProps {
    open: boolean;
    isSaving: boolean;
    dateStart: string;
    hourlyRate: string;
    baseSalary: string;
    inssPercentage: string;
    adminFeePercentage: string;
    onClose: () => void;
    onSave: () => void;
    onDateStartChange: (value: string) => void;
    onHourlyRateChange: (value: string) => void;
    onBaseSalaryChange: (value: string) => void;
    onInssPercentageChange: (value: string) => void;
    onAdminFeePercentageChange: (value: string) => void;
}

export function SalaryCreateSettingDialog({
    open,
    isSaving,
    dateStart,
    hourlyRate,
    baseSalary,
    inssPercentage,
    adminFeePercentage,
    onClose,
    onSave,
    onDateStartChange,
    onHourlyRateChange,
    onBaseSalaryChange,
    onInssPercentageChange,
    onAdminFeePercentageChange,
}: SalaryCreateSettingDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Nova Configuração</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={0.6}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Inicio da Vigencia
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                value={dateStart}
                                onChange={(event) => onDateStartChange(event.target.value)}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={0.6}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Valor/Hora
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                value={hourlyRate}
                                onChange={(event) => onHourlyRateChange(event.target.value)}
                                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={0.6}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Salário mínimo
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                value={baseSalary}
                                onChange={(event) => onBaseSalaryChange(event.target.value)}
                                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                            />
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={0.6}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                INSS (%)
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                value={inssPercentage}
                                onChange={(event) => onInssPercentageChange(event.target.value)}
                                slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={0.6}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Taxa Adm (%)
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                value={adminFeePercentage}
                                onChange={(event) => onAdminFeePercentageChange(event.target.value)}
                                slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                            />
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1} justifyContent="flex-end">
                            <Button variant="text" onClick={onClose} disabled={isSaving}>
                                Cancelar
                            </Button>
                            <Button variant="contained" onClick={onSave} disabled={isSaving}>
                                {isSaving ? 'Salvando...' : 'Salvar Nova Vigência'}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}
