import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Transaction } from '@/shared/services/transactions.service';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface DeleteTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (deleteType: 'single' | 'group') => void;
    transaction: Transaction | null;
    loading?: boolean;
}

export function DeleteTransactionModal({ open, onClose, onConfirm, transaction, loading = false }: DeleteTransactionModalProps) {
    const [deleteType, setDeleteType] = useState<'single' | 'group'>('single');
    const commonMessages = messages.common;
    const deleteModalMessages = messages.transactions.deleteModal;

    if (!transaction) return null;

    const isPartOfGroup = !!(transaction.installment_group_id || transaction.recurring_group_id);
    const groupLabel = transaction.installment_group_id
        ? deleteModalMessages.groupLabelInstallment
        : deleteModalMessages.groupLabelRecurring;

    const handleConfirm = () => {
        onConfirm(isPartOfGroup ? deleteType : 'single');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle className="pt-6">
                <Container unstyled className="flex items-center gap-2 font-bold">
                    <Container unstyled className="rounded-md bg-[var(--overlay-error-10)] p-2 text-[var(--color-error)]">
                        <AlertTriangle size={20} />
                    </Container>
                    {deleteModalMessages.title}
                </Container>
            </DialogTitle>
            <DialogContent className="pb-2">
                <Container unstyled className="mt-1 flex flex-col gap-4">
                    <Text className="text-sm font-medium text-[var(--color-text-primary)]">
                        {deleteModalMessages.confirmationQuestion}
                    </Text>

                    <Container unstyled className="rounded-lg border border-[var(--overlay-white-05)] bg-[var(--overlay-white-03)] p-2">
                        <Text className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {transaction.description}
                        </Text>
                        <Text className="text-xs text-[var(--color-text-secondary)]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)} • {new Date(transaction.payment_date).toLocaleDateString('pt-BR')}
                        </Text>
                    </Container>

                    {isPartOfGroup && (
                        <Container unstyled>
                            <Text className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                                {deleteModalMessages.groupHint(groupLabel)}
                            </Text>
                            <Container unstyled className="flex flex-col gap-3">
                                <label className="flex cursor-pointer items-start gap-2">
                                    <input
                                        type="radio"
                                        name="delete-type"
                                        value="single"
                                        checked={deleteType === 'single'}
                                        onChange={(e) => setDeleteType(e.target.value as 'single' | 'group')}
                                        className="mt-0.5"
                                    />
                                    <Text as="span">
                                        <Text as="span" className="block text-sm font-medium text-[var(--color-text-primary)]">{deleteModalMessages.deleteSingleTitle}</Text>
                                        <Text as="span" className="text-xs text-[var(--color-text-secondary)]">{deleteModalMessages.deleteSingleDescription}</Text>
                                    </Text>
                                </label>
                                <label className="flex cursor-pointer items-start gap-2">
                                    <input
                                        type="radio"
                                        name="delete-type"
                                        value="group"
                                        checked={deleteType === 'group'}
                                        onChange={(e) => setDeleteType(e.target.value as 'single' | 'group')}
                                        className="mt-0.5"
                                    />
                                    <Text as="span">
                                        <Text as="span" className="block text-sm font-medium text-[var(--color-text-primary)]">{deleteModalMessages.deleteGroupTitle}</Text>
                                        <Text as="span" className="text-xs text-[var(--color-text-secondary)]">{deleteModalMessages.deleteGroupDescription}</Text>
                                    </Text>
                                </label>
                            </Container>
                        </Container>
                    )}

                    {!isPartOfGroup && (
                        <Text className="text-sm text-[var(--color-text-secondary)]">{deleteModalMessages.irreversibleAction}</Text>
                    )}
                </Container>
            </DialogContent>
            <DialogActions className="p-6">
                <Button onClick={onClose} variant="ghost" className="font-semibold">
                    {commonMessages.actions.cancel}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<Trash2 size={18} />}
                    onClick={handleConfirm}
                    disabled={loading}
                    className="px-3 font-bold"
                >
                    {loading ? commonMessages.states.deleting : deleteModalMessages.confirmButton}
                </Button>
            </DialogActions>
        </Dialog>
    );
}




