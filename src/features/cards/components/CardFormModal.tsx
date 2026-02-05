import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Box,
} from '@mui/material';
import { useCreateCreditCard, useUpdateCreditCard } from '../hooks/useCreditCards';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { CreditCard } from '@/types/database';

const cardSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    bank_account_id: z.string().min(1, 'Selecione uma conta vinculada'),
    credit_limit: z.number().min(0, 'Limite deve ser positivo'),
    closing_day: z.number().min(1).max(31),
    due_day: z.number().min(1).max(31),
    color: z.string().default('#D4AF37'),
    notes: z.string().optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormModalProps {
    open: boolean;
    onClose: () => void;
    card?: CreditCard;
}

export function CardFormModal({ open, onClose, card }: CardFormModalProps) {
    const createCard = useCreateCreditCard();
    const updateCard = useUpdateCreditCard();
    const { data: accounts } = useAccounts();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CardFormValues>({
        resolver: zodResolver(cardSchema) as any,
    });

    // Reset form when card changes or modal opens
    useEffect(() => {
        if (open) {
            reset({
                name: card?.name || '',
                bank_account_id: card?.bank_account_id || '',
                credit_limit: card?.credit_limit || 0,
                closing_day: card?.closing_day || 1,
                due_day: card?.due_day || 10,
                color: card?.color || '#D4AF37',
                notes: card?.notes || '',
            });
        }
    }, [card, open, reset]);

    const onSubmit = async (values: CardFormValues) => {
        try {
            if (card) {
                await updateCard.mutateAsync({ id: card.id, updates: values });
            } else {
                await createCard.mutateAsync(values as any);
            }
            reset();
            onClose();
        } catch (error) {
            console.error('Error saving credit card:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>
                {card ? 'Editar Cartão' : 'Novo Cartão'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Nome do Cartão"
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            placeholder="Ex: Nubank Platinum"
                        />

                        <FormControl fullWidth error={!!errors.bank_account_id}>
                            <InputLabel>Conta Vinculada (Débito Automático)</InputLabel>
                            <Select
                                label="Conta Vinculada (Débito Automático)"
                                {...register('bank_account_id')}
                                defaultValue={card?.bank_account_id || ''}
                            >
                                {accounts?.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                                ))}
                            </Select>
                            {errors.bank_account_id && <FormHelperText>{errors.bank_account_id.message}</FormHelperText>}
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Limite de Crédito"
                            type="number"
                            {...register('credit_limit', { valueAsNumber: true })}
                            error={!!errors.credit_limit}
                            helperText={errors.credit_limit?.message}
                            inputProps={{ step: '0.01' }}
                            InputProps={{
                                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>R$</Box>,
                            }}
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                label="Dia Fechamento"
                                type="number"
                                {...register('closing_day', { valueAsNumber: true })}
                                error={!!errors.closing_day}
                                helperText={errors.closing_day?.message}
                            />
                            <TextField
                                fullWidth
                                label="Dia Vencimento"
                                type="number"
                                {...register('due_day', { valueAsNumber: true })}
                                error={!!errors.due_day}
                                helperText={errors.due_day?.message}
                            />
                        </Stack>

                        <TextField
                            fullWidth
                            label="Notas"
                            multiline
                            rows={2}
                            {...register('notes')}
                        />

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 1.5,
                                bgcolor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <input
                                    type="color"
                                    {...register('color')}
                                    style={{
                                        position: 'absolute',
                                        width: '150%',
                                        height: '150%',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'none',
                                        padding: 0
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Cor do Cartão</Typography>
                                <Typography variant="caption" color="text.secondary">Cor de destaque na listagem</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={createCard.isPending || updateCard.isPending}
                    >
                        {card ? 'Salvar Alterações' : 'Criar Cartão'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
