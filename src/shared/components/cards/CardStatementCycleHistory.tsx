import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { CalendarRange, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useCardStatementCycles, useCreateCardStatementCycle } from '@/shared/hooks/useCreditCards';
import { CreditCardStatementCycle } from '@/shared/interfaces';
import { OPEN_CYCLE_END } from '@/shared/services/card-statement-cycle.utils';
import { colors } from '@/shared/theme';

const createCycleSchema = z.object({
    date_start: z.string().min(1, 'Informe a data de inicio.'),
    closing_day: z.number().min(1, 'Dia invalido').max(31, 'Dia invalido'),
    due_day: z.number().min(1, 'Dia invalido').max(31, 'Dia invalido'),
    notes: z.string().optional(),
});

type CreateCycleFormValues = z.infer<typeof createCycleSchema>;

interface CardStatementCycleHistoryModalProps {
    cardId: string;
    cardName: string;
    fallbackClosingDay: number;
    fallbackDueDay: number;
    open: boolean;
    onClose: () => void;
}

const formatDateBR = (value: string) => format(new Date(`${value}T12:00:00`), 'dd/MM/yyyy');

const formatCycleRange = (cycle: CreditCardStatementCycle) => {
    const start = formatDateBR(cycle.date_start);
    if (cycle.date_end === OPEN_CYCLE_END) {
        return `${start} em diante`;
    }
    return `${start} ate ${formatDateBR(cycle.date_end)}`;
};

export function CardStatementCycleHistoryModal({
    cardId,
    cardName,
    fallbackClosingDay,
    fallbackDueDay,
    open,
    onClose,
}: CardStatementCycleHistoryModalProps) {
    const { data: cycles = [], isLoading } = useCardStatementCycles(cardId, open);
    const createCycle = useCreateCardStatementCycle(cardId);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const orderedCycles = useMemo(
        () => [...cycles].sort((a, b) => b.date_start.localeCompare(a.date_start)),
        [cycles]
    );

    const currentCycle = useMemo(
        () => orderedCycles.find((cycle) => cycle.date_end === OPEN_CYCLE_END) || null,
        [orderedCycles]
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateCycleFormValues>({
        resolver: zodResolver(createCycleSchema),
        defaultValues: {
            date_start: format(new Date(), 'yyyy-MM-dd'),
            closing_day: fallbackClosingDay,
            due_day: fallbackDueDay,
            notes: '',
        },
    });

    const handleOpenCreateDialog = () => {
        setFormError(null);
        reset({
            date_start: format(new Date(), 'yyyy-MM-dd'),
            closing_day: currentCycle?.closing_day ?? fallbackClosingDay,
            due_day: currentCycle?.due_day ?? fallbackDueDay,
            notes: '',
        });
        setCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        if (createCycle.isPending) return;
        setCreateDialogOpen(false);
    };

    const handleCloseHistoryDialog = () => {
        if (createCycle.isPending) return;
        setCreateDialogOpen(false);
        setFormError(null);
        onClose();
    };

    const onSubmit = async (values: CreateCycleFormValues) => {
        setFormError(null);
        try {
            await createCycle.mutateAsync({
                date_start: values.date_start,
                closing_day: values.closing_day,
                due_day: values.due_day,
                notes: values.notes?.trim() ? values.notes.trim() : undefined,
            });
            setCreateDialogOpen(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Nao foi possivel salvar a vigencia.';
            setFormError(message);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleCloseHistoryDialog}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        bgcolor: colors.bgCard,
                        borderRadius: '20px',
                        border: `1px solid ${colors.border}`,
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1.5 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1.25}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarRange size={18} color={colors.accent} />
                            <Box>
                                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans' }}>
                                    Historico de Ciclo da Fatura
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                    {cardName}
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            startIcon={<Plus size={16} />}
                            onClick={handleOpenCreateDialog}
                            size="small"
                            variant="text"
                            sx={{
                                color: colors.accent,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(201, 168, 76, 0.12)' },
                            }}
                        >
                            Nova Vigencia
                        </Button>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ pt: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', color: colors.textMuted, mb: 1.5 }}>
                        Alteracoes sao aplicadas por vigencia e preservam o historico das faturas antigas.
                    </Typography>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} color="primary" />
                        </Box>
                    ) : (
                        <TableContainer sx={{ borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                        <TableCell sx={headerCellSx}>Vigencia</TableCell>
                                        <TableCell sx={headerCellSx}>Fechamento</TableCell>
                                        <TableCell sx={headerCellSx}>Vencimento</TableCell>
                                        <TableCell sx={headerCellSx}>Status</TableCell>
                                        <TableCell sx={headerCellSx}>Observacao</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderedCycles.map((cycle) => {
                                        const isCurrent = cycle.date_end === OPEN_CYCLE_END;
                                        return (
                                            <TableRow key={cycle.id}>
                                                <TableCell sx={bodyCellSx}>{formatCycleRange(cycle)}</TableCell>
                                                <TableCell sx={bodyCellSx}>Dia {cycle.closing_day}</TableCell>
                                                <TableCell sx={bodyCellSx}>Dia {cycle.due_day}</TableCell>
                                                <TableCell sx={bodyCellSx}>
                                                    {isCurrent ? (
                                                        <Chip size="small" label="Vigente" color="primary" />
                                                    ) : (
                                                        <Chip
                                                            size="small"
                                                            label="Historico"
                                                            sx={{
                                                                bgcolor: 'rgba(255,255,255,0.06)',
                                                                color: colors.textSecondary,
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={bodyCellSx}>{cycle.notes || '-'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {orderedCycles.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: colors.textMuted }}>
                                                Nenhuma vigencia encontrada para este cartao.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                    <Button
                        onClick={handleCloseHistoryDialog}
                        sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={createDialogOpen}
                onClose={handleCloseCreateDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        bgcolor: colors.bgCard,
                        borderRadius: '20px',
                        border: `1px solid ${colors.border}`,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', color: colors.textPrimary, fontFamily: 'Plus Jakarta Sans', pb: 1 }}>
                    Nova Vigencia
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ pt: 2, pb: 2.5 }}>
                        <Stack spacing={2}>
                            <Typography sx={{ fontSize: '12px', color: colors.textMuted }}>
                                Ao salvar, o periodo que contem a data informada sera dividido automaticamente.
                            </Typography>
                            <TextField
                                label="Data de inicio da vigencia"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...register('date_start')}
                                error={!!errors.date_start}
                                helperText={errors.date_start?.message}
                            />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Dia fechamento"
                                    type="number"
                                    fullWidth
                                    inputProps={{ min: 1, max: 31 }}
                                    {...register('closing_day', { valueAsNumber: true })}
                                    error={!!errors.closing_day}
                                    helperText={errors.closing_day?.message}
                                />
                                <TextField
                                    label="Dia vencimento"
                                    type="number"
                                    fullWidth
                                    inputProps={{ min: 1, max: 31 }}
                                    {...register('due_day', { valueAsNumber: true })}
                                    error={!!errors.due_day}
                                    helperText={errors.due_day?.message}
                                />
                            </Stack>
                            <TextField
                                label="Observacao (opcional)"
                                fullWidth
                                multiline
                                rows={2}
                                {...register('notes')}
                            />
                            {formError && (
                                <Typography sx={{ fontSize: '12px', color: colors.red }}>
                                    {formError}
                                </Typography>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
                        <Button
                            onClick={handleCloseCreateDialog}
                            disabled={createCycle.isPending}
                            sx={{
                                color: colors.textSecondary,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createCycle.isPending}
                            sx={{
                                bgcolor: colors.accent,
                                color: '#0A0A0F',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '10px',
                                px: 3,
                                '&:hover': { bgcolor: '#D4B85C' },
                            }}
                        >
                            {createCycle.isPending ? 'Salvando...' : 'Salvar Vigencia'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

const headerCellSx = {
    py: 1.4,
    fontSize: '11px',
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

const bodyCellSx = {
    py: 1.35,
    fontSize: '13px',
    color: colors.textSecondary,
};
