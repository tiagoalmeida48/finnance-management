import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
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
            <DialogTitle className="flex items-center gap-1.5 pt-6 font-bold">
                <div
                    className="flex rounded-md bg-red-500/10 p-2 text-red-400"
                >
                    <AlertTriangle size={20} />
                </div>
                {title}
            </DialogTitle>
            <DialogContent className="pb-1">
                <div className="mt-1 flex flex-col gap-2.5">
                    <p className="text-sm font-medium">
                        {description}
                    </p>

                    {itemName && (
                        <div className="rounded-md border border-white/5 bg-white/[0.03] p-2">
                            <p className="text-sm font-semibold text-white">
                                {itemName}
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-white/70">
                        Esta ação não pode ser desfeita e pode afetar dados vinculados.
                    </p>
                </div>
            </DialogContent>
            <DialogActions className="p-6">
                <Button onClick={onClose} color="inherit" className="font-semibold">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Trash2 size={18} />}
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-3 font-bold shadow-none hover:shadow-none"
                >
                    {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


