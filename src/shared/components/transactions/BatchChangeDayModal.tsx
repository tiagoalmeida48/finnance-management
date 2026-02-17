import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

const batchChangeDaySchema = z.object({
    day: z.number().int().min(1, 'Informe um dia entre 1 e 31').max(31, 'Informe um dia entre 1 e 31'),
});

type BatchChangeDayValues = z.infer<typeof batchChangeDaySchema>;

interface BatchChangeDayModalProps {
    open: boolean;
    selectedCount: number;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (day: number) => void | Promise<void>;
}

export function BatchChangeDayModal({
    open,
    selectedCount,
    loading = false,
    onClose,
    onConfirm,
}: BatchChangeDayModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BatchChangeDayValues>({
        resolver: zodResolver(batchChangeDaySchema) as Resolver<BatchChangeDayValues>,
        defaultValues: {
            day: new Date().getDate(),
        },
    });

    useEffect(() => {
        if (!open) return;
        reset({ day: new Date().getDate() });
    }, [open, reset]);

    const handleConfirm = (values: BatchChangeDayValues) => {
        onConfirm(values.day);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>Trocar dia em lote</DialogTitle>
            <form onSubmit={handleSubmit(handleConfirm)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Defina o novo dia para {selectedCount} registro{selectedCount !== 1 ? 's' : ''}. Mes e ano serao mantidos.
                        </Typography>
                        <TextField
                            label="Novo dia"
                            type="number"
                            inputProps={{ min: 1, max: 31 }}
                            error={!!errors.day}
                            helperText={errors.day?.message}
                            {...register('day', { valueAsNumber: true })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button variant="contained" type="submit" disabled={loading}>
                        {loading ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
