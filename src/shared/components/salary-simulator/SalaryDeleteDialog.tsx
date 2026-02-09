import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface SalaryDeleteDialogProps {
    open: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function SalaryDeleteDialog({ open, isDeleting, onClose, onConfirm }: SalaryDeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Excluir Vigencia Atual</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    Isso vai remover a vigencia atual e reativar a vigencia imediatamente anterior. Deseja continuar?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isDeleting}>
                    Cancelar
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
