import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Box
} from '@mui/material';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    itemName?: string;
    loading?: boolean;
}

export function DeleteConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    loading = false
}: DeleteConfirmationModalProps) {
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
                {title}
            </DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {description}
                    </Typography>

                    {itemName && (
                        <Box sx={{
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                {itemName}
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Esta ação não pode ser desfeita e pode afetar dados vinculados.
                    </Typography>
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
                    onClick={onConfirm}
                    disabled={loading}
                    sx={{
                        fontWeight: 700,
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                    }}
                >
                    {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
