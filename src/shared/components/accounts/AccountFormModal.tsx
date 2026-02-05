import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem,
    FormControl, InputLabel, Select, FormHelperText, Typography, Box
} from '@mui/material';
import { useCreateAccount, useUpdateAccount } from '../../hooks/useAccounts';
import { Account } from '../../interfaces/account.interface';

const accountSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    type: z.enum(['checking', 'savings', 'investment', 'wallet', 'other'] as const),
    initial_balance: z.number(),
    current_balance: z.number().optional(),
    color: z.string().default('#D4AF37'),
    icon: z.string().default('wallet'),
    notes: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormModalProps {
    open: boolean;
    onClose: () => void;
    account?: Account;
}

export function AccountFormModal({ open, onClose, account }: AccountFormModalProps) {
    const createAccount = useCreateAccount();
    const updateAccount = useUpdateAccount();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema) as any,
    });

    useEffect(() => {
        if (open) {
            reset({
                name: account?.name || '',
                type: (account?.type as any) || 'checking',
                initial_balance: account?.initial_balance || 0,
                current_balance: account?.current_balance || 0,
                color: account?.color || '#D4AF37',
                icon: account?.icon || 'wallet',
                notes: account?.notes || '',
            });
        }
    }, [account, open, reset]);

    const onSubmit = async (values: AccountFormValues) => {
        try {
            if (account) {
                await updateAccount.mutateAsync({ id: account.id, updates: values });
            } else {
                await createAccount.mutateAsync(values as any);
            }
            onClose();
        } catch (error) {
            console.error('Error saving account:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>{account ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField fullWidth label="Nome da Conta" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                        <FormControl fullWidth error={!!errors.type}>
                            <InputLabel>Tipo de Conta</InputLabel>
                            <Select label="Tipo de Conta" defaultValue={account?.type || 'checking'} {...register('type')}>
                                <MenuItem value="checking">Conta Corrente</MenuItem>
                                <MenuItem value="savings">Poupança</MenuItem>
                                <MenuItem value="investment">Investimento</MenuItem>
                                <MenuItem value="wallet">Dinheiro em Espécie</MenuItem>
                                <MenuItem value="other">Outro</MenuItem>
                            </Select>
                            {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                        </FormControl>
                        <Stack direction="row" spacing={2}>
                            <TextField sx={{ flex: 1 }} label="Saldo Inicial" type="number" {...register('initial_balance', { valueAsNumber: true })} InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box> }} />
                            {account && <TextField sx={{ flex: 1 }} label="Saldo Atual" type="number" {...register('current_balance', { valueAsNumber: true })} InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box> }} />}
                        </Stack>
                        <TextField fullWidth label="Notas" multiline rows={3} {...register('notes')} />
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                <input type="color" {...register('color')} style={{ position: 'absolute', width: '150%', height: '150%', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Cor da Conta</Typography>
                                <Typography variant="caption" color="text.secondary">Identidade visual no dashboard</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button variant="contained" type="submit" disabled={createAccount.isPending || updateAccount.isPending}>Salvar</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
