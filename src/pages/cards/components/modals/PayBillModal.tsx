import { CreditCard as CardIcon, Landmark, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Container } from '@/shared/components/layout/Container';
import { FormDialog } from '@/shared/components/composite/FormDialog';
import { FormField } from '@/shared/components/forms/FormField';
import { IconButton } from '@/shared/components/ui/icon-button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Text } from '@/shared/components/ui/Text';
import { usePayBillModalLogic } from '@/pages/transactions/hooks/usePayBillModalLogic';

interface PayBillModalProps {
    open: boolean;
    onClose: () => void;
    cardId: string;
    cardName: string;
    statementMonth: string;
    transactionIds: string[];
    totalAmount: number;
}

const loadingSpinner = (
    <Container unstyled className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
);

export function PayBillModal({
    open,
    onClose,
    cardId,
    cardName,
    statementMonth,
    transactionIds,
    totalAmount,
}: PayBillModalProps) {
    const {
        payBillMessages,
        commonMessages,
        accounts,
        formatCurrency,
        register,
        errors,
        onSubmit,
        handleClose,
        isSubmitting,
        totalAmountLabel,
    } = usePayBillModalLogic({
        onClose,
        cardId,
        cardName,
        statementMonth,
        transactionIds,
        totalAmount,
    });

    return (
        <FormDialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            title={(
                <Container unstyled className="flex items-center justify-between font-bold">
                    {payBillMessages.title}
                    <IconButton onClick={handleClose} size="small">
                        <X size={20} />
                    </IconButton>
                </Container>
            )}
            onSubmit={onSubmit}
            actionsClassName="p-3"
            actions={(
                <>
                    <Button onClick={handleClose} color="inherit">
                        {commonMessages.actions.cancel}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? loadingSpinner : undefined}
                    >
                        {isSubmitting ? payBillMessages.processing : payBillMessages.confirmPayment}
                    </Button>
                </>
            )}
        >
            <Container unstyled className="space-y-3">
                <Container unstyled className="flex items-center gap-2 rounded-md border border-[var(--color-primary)33] bg-[var(--color-primary)0D] p-2">
                    <CardIcon size={24} color="var(--color-primary)" />
                    <Container unstyled>
                        <Text className="text-xs text-white/70">{payBillMessages.billLabel(statementMonth)}</Text>
                        <Text className="text-lg font-extrabold text-[var(--color-primary)]">{totalAmountLabel}</Text>
                    </Container>
                </Container>

                <FormField
                    htmlFor="paybill-account"
                    label={payBillMessages.accountLabel}
                    errorMessage={errors.bank_account_id?.message}
                >
                    <Container unstyled className="relative">
                        <Landmark size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        <Select id="paybill-account" className="pl-9" {...register('bank_account_id')}>
                            <option value="">{payBillMessages.accountPlaceholder}</option>
                            {accounts?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - {formatCurrency(account.current_balance)}
                                </option>
                            ))}
                        </Select>
                    </Container>
                </FormField>

                <FormField
                    htmlFor="paybill-date"
                    label={payBillMessages.paymentDateLabel}
                    errorMessage={errors.payment_date?.message}
                >
                    <Input id="paybill-date" type="date" {...register('payment_date')} />
                </FormField>
            </Container>
        </FormDialog>
    );
}

