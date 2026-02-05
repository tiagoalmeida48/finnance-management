import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Box,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl
} from '@mui/material';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Transaction } from '../../services/transactions.service';

interface DeleteTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (deleteType: 'single' | 'group') => void;
    transaction: Transaction | null;
    loading?: boolean;
}

export function DeleteTransactionModal({ open, onClose, onConfirm, transaction, loading = false }: DeleteTransactionModalProps) {
    const [deleteType, setDeleteType] = useState<'single' | 'group'>('single');

    if (!transaction) return null;

    const isPartOfGroup = !!(transaction.installment_group_id || transaction.recurring_group_id);
    const groupLabel = transaction.installment_group_id ? 'parcelas' : 'recorrência';

    const handleConfirm = () => {
        onConfirm(isPartOfGroup ? deleteType : 'single');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
                <Box sx={{
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    color: 'error.main',
                    p: 1,
                    borderRadius: 1.5,
                    display: 'flex'
                }}>
                    <AlertTriangle size={20} />
                </Box>
                Excluir Transação
            </DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Tem certeza que deseja excluir esta transação?
                    </Typography>

                    <Box sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                            {transaction.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)} • {new Date(transaction.payment_date).toLocaleDateString('pt-BR')}
                        </Typography>
                    </Box>

                    {isPartOfGroup && (
                        <FormControl component="fieldset">
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                                Esta transação faz parte de um grupo ({groupLabel}). Como deseja prosseguir?
                            </Typography>
                            <RadioGroup
                                value={deleteType}
                                onChange={(e) => setDeleteType(e.target.value as 'single' | 'group')}
                            >
                                <FormControlLabel
                                    value="single"
                                    control={<Radio size="small" color="error" />}
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Excluir apenas este item</Typography>
                                            <Typography variant="caption" color="text.secondary">As outras parcelas/recorrências serão mantidas.</Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start', mb: 1.5 }}
                                />
                                <FormControlLabel
                                    value="group"
                                    control={<Radio size="small" color="error" />}
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Excluir todo o grupo</Typography>
                                            <Typography variant="caption" color="text.secondary">Todos os itens vinculados a este grupo serão removidos.</Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start' }}
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {!isPartOfGroup && (
                        <Typography variant="body2" color="text.secondary">
                            Esta ação não pode ser desfeita.
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Trash2 size={18} />}
                    onClick={handleConfirm}
                    disabled={loading}
                    sx={{
                        fontWeight: 700,
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                    }}
                >
                    {loading ? 'Excluindo...' : 'Excluir Transação'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
