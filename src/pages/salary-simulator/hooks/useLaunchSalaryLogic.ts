import { useState } from 'react';
import { format } from 'date-fns';
import { useCreateTransaction } from '@/shared/hooks/api/useTransactions';
import { getErrorMessage } from '@/pages/salary-simulator/components/salarySimulator.helpers';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function useLaunchSalaryLogic(
    accounts: any[],
    incomeCategories: any[],
    netPay: number,
    setMessage: (msg: MessageState) => void
) {
    const createTransaction = useCreateTransaction();

    const [launchSalaryDialogOpen, setLaunchSalaryDialogOpen] = useState(false);
    const [salaryDescription, setSalaryDescription] = useState('PIX RECEBIDO COOP SOMA');
    const [salaryAccountId, setSalaryAccountId] = useState('');
    const [salaryCategoryId, setSalaryCategoryId] = useState('');
    const [salaryPaymentDate, setSalaryPaymentDate] = useState('');

    const handleOpenLaunchSalaryDialog = () => {
        setMessage(null);
        if (netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }

        const defaultAccount = accounts.find((account) => account.name.toLowerCase() === 'santander') ?? accounts[0];
        const defaultCategory = incomeCategories.find((category) => category.name.toLowerCase() === 'salário trijay')
            ?? incomeCategories.find((category) => category.name.toLowerCase() === 'salario trijay')
            ?? incomeCategories[0];
        const now = new Date();
        const paymentDate = format(new Date(now.getFullYear(), now.getMonth(), 12), 'yyyy-MM-dd');

        setSalaryDescription('PIX RECEBIDO COOP SOMA');
        setSalaryAccountId(defaultAccount?.id ?? '');
        setSalaryCategoryId(defaultCategory?.id ?? '');
        setSalaryPaymentDate(paymentDate);
        setLaunchSalaryDialogOpen(true);
    };

    const handleCloseLaunchSalaryDialog = () => {
        if (createTransaction.isPending) return;
        setLaunchSalaryDialogOpen(false);
    };

    const handleConfirmLaunchSalary = async () => {
        setMessage(null);
        if (netPay <= 0) {
            setMessage({ type: 'error', text: 'O lançamento só é permitido quando o valor líquido for maior que zero.' });
            return;
        }
        if (!salaryDescription.trim() || !salaryAccountId || !salaryCategoryId || !salaryPaymentDate) {
            setMessage({ type: 'error', text: 'Preencha descrição, conta, categoria e data da transação.' });
            return;
        }
        try {
            await createTransaction.mutateAsync({
                type: 'income',
                amount: Number(netPay.toFixed(2)),
                description: salaryDescription.trim(),
                payment_date: salaryPaymentDate,
                account_id: salaryAccountId,
                category_id: salaryCategoryId,
                payment_method: 'debit',
                is_fixed: false,
                is_paid: false,
            });
            setLaunchSalaryDialogOpen(false);
            setMessage({ type: 'success', text: 'Transação de salário lançada como pendente.' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        }
    };

    return {
        createTransaction,
        launchSalaryDialogOpen,
        salaryDescription,
        salaryAccountId,
        salaryCategoryId,
        salaryPaymentDate,
        setLaunchSalaryDialogOpen,
        setSalaryDescription,
        setSalaryAccountId,
        setSalaryCategoryId,
        setSalaryPaymentDate,
        handleOpenLaunchSalaryDialog,
        handleCloseLaunchSalaryDialog,
        handleConfirmLaunchSalary,
    };
}
