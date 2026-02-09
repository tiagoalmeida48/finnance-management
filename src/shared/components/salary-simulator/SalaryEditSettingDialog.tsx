import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField } from '@mui/material';
import type { EditSettingForm } from './salarySimulator.helpers';

interface SalaryEditSettingDialogProps {
    editForm: EditSettingForm | null;
    isSaving: boolean;
    onClose: () => void;
    onSave: () => void;
    onFieldChange: (field: keyof EditSettingForm, value: string) => void;
}

export function SalaryEditSettingDialog({
    editForm,
    isSaving,
    onClose,
    onSave,
    onFieldChange,
}: SalaryEditSettingDialogProps) {
    return (
        <Dialog open={Boolean(editForm)} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Editar Vigencia</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Inicio da Vigencia"
                                type="date"
                                fullWidth
                                value={editForm?.dateStart ?? ''}
                                onChange={(event) => onFieldChange('dateStart', event.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Fim da Vigencia"
                                type="date"
                                fullWidth
                                value={editForm?.dateEnd ?? ''}
                                onChange={(event) => onFieldChange('dateEnd', event.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Valor/Hora"
                        type="number"
                        fullWidth
                        value={editForm?.hourlyRate ?? ''}
                        onChange={(event) => onFieldChange('hourlyRate', event.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                    />

                    <TextField
                        label="Pro-Labore"
                        type="number"
                        fullWidth
                        value={editForm?.baseSalary ?? ''}
                        onChange={(event) => onFieldChange('baseSalary', event.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                    />

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="INSS (%)"
                                type="number"
                                fullWidth
                                value={editForm?.inssPercentage ?? ''}
                                onChange={(event) => onFieldChange('inssPercentage', event.target.value)}
                                slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Taxa Adm (%)"
                                type="number"
                                fullWidth
                                value={editForm?.adminFeePercentage ?? ''}
                                onChange={(event) => onFieldChange('adminFeePercentage', event.target.value)}
                                slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSaving}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={onSave} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
