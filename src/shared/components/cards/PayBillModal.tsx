import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack,
    MenuItem, Typography, Box, CircularProgress, IconButton
} from '@mui/material';
import { X, CreditCard as CardIcon, Landmark } from 'lucide-react';
import { useAccounts } from '../../hooks/useAccounts';
import { usePayBill } from '../../hooks/useTransactions';

const payBillSchema = z.object({
    bank_account_id: z.string().min(1, 'Selecione uma conta para o pagamento'),
    payment_date: z.string().min(1, 'Selecione a data do pagamento'),
});

type PayBillForm = z.infer<typeof payBillSchema>;

interface PayBillModalProps {
    open: boolean;
    onClose: () => void;
    cardId: string;
    cardName: string;
    statementMonth: string;
    transactionIds: string[];
    totalAmount: number;
}

export function PayBillModal({ open, onClose, cardId, cardName, statementMonth, transactionIds, totalAmount }: PayBillModalProps) {
    const { data: accounts } = useAccounts();
    const payBill = usePayBill();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PayBillForm>({
        resolver: zodResolver(payBillSchema),
        defaultValues: {
            bank_account_id: '',
            payment_date: new Date().toISOString().split('T')[0],
        }
    });

    const onSubmit = async (data: PayBillForm) => {
        try {
            await payBill.mutateAsync({
                cardId,
                transactionIds,
                accountId: data.bank_account_id,
                paymentDate: data.payment_date,
                amount: totalAmount,
                description: `${cardName} - ${statementMonth}`
            });
            handleClose();
        } catch (error) {
            console.error('Error paying bill:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Pagar Fatura
                <IconButton onClick={handleClose} size="small"><X size={20} /></IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(212, 175, 55, 0.05)', borderRadius: 1, border: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CardIcon size={24} color="#D4AF37" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Fatura {statementMonth}</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                                </Typography>
                            </Box>
                        </Box>
                        <TextField label="Conta de Origem" select fullWidth {...register('bank_account_id')} error={!!errors.bank_account_id} helperText={errors.bank_account_id?.message} InputProps={{ startAdornment: <Landmark size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}>
                            {accounts?.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <Typography variant="body2">{account.name}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.current_balance)}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Data do Pagamento" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('payment_date')} error={!!errors.payment_date} helperText={errors.payment_date?.message} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={payBill.isPending} startIcon={payBill.isPending && <CircularProgress size={16} color="inherit" />}>
                        {payBill.isPending ? 'Processando...' : 'Confirmar Pagamento'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
