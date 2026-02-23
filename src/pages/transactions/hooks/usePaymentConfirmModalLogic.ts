import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from '@/shared/hooks/api/useAccounts';
import { messages } from '@/shared/i18n/messages';

const paymentConfirmMessages = messages.transactions.paymentConfirmModal;

const confirmPaymentSchema = z.object({
    account_id: z.string().min(1, paymentConfirmMessages.accountValidation),
    payment_date: z.string().min(1, paymentConfirmMessages.dateValidation),
});

export type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>;

interface UsePaymentConfirmModalLogicParams {
    onConfirm: (data: ConfirmPaymentValues) => void;
}

export function usePaymentConfirmModalLogic({ onConfirm }: UsePaymentConfirmModalLogicParams) {
    const commonMessages = messages.common;
    const { data: accounts } = useAccounts();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ConfirmPaymentValues>({
        resolver: zodResolver(confirmPaymentSchema),
        defaultValues: {
            payment_date: new Date().toISOString().split('T')[0],
            account_id: '',
        },
    });

    return {
        paymentConfirmMessages,
        commonMessages,
        accounts,
        register,
        errors,
        onSubmit: handleSubmit(onConfirm),
    };
}

