import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Account, Category } from '@/shared/interfaces';
import { colors } from '@/shared/theme';
import { blockedInputSx, formatCurrency, modernDateInputSx } from './salarySimulator.helpers';

interface SalaryLaunchDialogProps {
    open: boolean;
    isSaving: boolean;
    description: string;
    accountId: string;
    categoryId: string;
    paymentDate: string;
    netPay: number;
    accounts: Account[];
    incomeCategories: Category[];
    onClose: () => void;
    onConfirm: () => void;
    onDescriptionChange: (value: string) => void;
    onAccountChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onPaymentDateChange: (value: string) => void;
}

export function SalaryLaunchDialog({
    open,
    isSaving,
    description,
    accountId,
    categoryId,
    paymentDate,
    netPay,
    accounts,
    incomeCategories,
    onClose,
    onConfirm,
    onDescriptionChange,
    onAccountChange,
    onCategoryChange,
    onPaymentDateChange,
}: SalaryLaunchDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes da Transação de Salário</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    <Stack spacing={0.6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Descrição
                        </Typography>
                        <TextField
                            fullWidth
                            value={description}
                            onChange={(event) => onDescriptionChange(event.target.value)}
                        />
                    </Stack>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Conta"
                                value={accountId}
                                onChange={(event) => onAccountChange(event.target.value)}
                            >
                                {accounts.map((account) => (
                                    <MenuItem key={account.id} value={account.id}>
                                        {account.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <LocalizationProvider
                                dateAdapter={AdapterDateFns}
                                adapterLocale={ptBR}
                                localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
                            >
                                <DatePicker
                                    label="Data"
                                    value={paymentDate ? new Date(`${paymentDate}T00:00:00`) : null}
                                    onChange={(newValue) => {
                                        if (!newValue || Number.isNaN(newValue.getTime())) {
                                            onPaymentDateChange('');
                                            return;
                                        }
                                        onPaymentDateChange(format(newValue, 'yyyy-MM-dd'));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            sx: modernDateInputSx,
                                        },
                                        popper: {
                                            sx: {
                                                '& .MuiPaper-root': {
                                                    borderRadius: '14px',
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.bgCard,
                                                },
                                                '& .MuiPickersLayout-actionBar': {
                                                    display: 'none',
                                                },
                                                '& .MuiPickersLayout-contentWrapper': {
                                                    marginBottom: 0,
                                                },
                                                '& .MuiPickersLayout-root': {
                                                    minHeight: 'auto',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                            <TextField
                                label="Tipo"
                                fullWidth
                                value="Receita"
                                disabled
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={blockedInputSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                            <TextField
                                label="Forma de Pagamento"
                                fullWidth
                                value="Débito"
                                disabled
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={blockedInputSx}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                            <TextField
                                select
                                label="Categoria"
                                value={categoryId}
                                fullWidth
                                onChange={(event) => onCategoryChange(event.target.value)}
                                disabled
                                sx={{
                                    ...blockedInputSx,
                                    '& .MuiSelect-icon': {
                                        display: 'none',
                                    },
                                }}
                            >
                                {incomeCategories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 2 }}>
                            <TextField
                                label="Valor"
                                value={formatCurrency(netPay)}
                                disabled
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={blockedInputSx}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSaving}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={onConfirm} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Continuar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
