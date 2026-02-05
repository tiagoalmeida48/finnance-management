import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from '../../accounts/hooks/useAccounts';

const confirmPaymentSchema = z.object({
    account_id: z.string().min(1, 'Selecione uma conta'),
    payment_date: z.string().min(1, 'Selecione uma data'),
});

type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>;

interface PaymentConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: ConfirmPaymentValues) => void;
    title?: string;
    loading?: boolean;
}

export function PaymentConfirmModal({ open, onClose, onConfirm, title = 'Confirmar Pagamento', loading = false }: PaymentConfirmModalProps) {
    const { data: accounts } = useAccounts();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ConfirmPaymentValues>({
        resolver: zodResolver(confirmPaymentSchema),
        defaultValues: {
            payment_date: new Date().toISOString().split('T')[0],
            account_id: '',
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
            <form onSubmit={handleSubmit(onConfirm)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Selecione a conta de origem e a data efetiva do pagamento.
                        </Typography>

                        <FormControl fullWidth error={!!errors.account_id}>
                            <InputLabel>Conta de Pagamento</InputLabel>
                            <Select label="Conta de Pagamento" {...register('account_id')} defaultValue="">
                                {accounts?.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                                ))}
                            </Select>
                            {errors.account_id && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                    {errors.account_id.message}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Data do Pagamento"
                            type="date"
                            {...register('payment_date')}
                            error={!!errors.payment_date}
                            helperText={errors.payment_date?.message}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
