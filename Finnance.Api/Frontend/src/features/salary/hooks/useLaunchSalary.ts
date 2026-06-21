import { useState } from 'react';
import { TransactionTypeId } from '@/config/constants';
import { useToast } from '@/shared/components/feedback';
import { useTransactionMutations } from '@/features/transactions/hooks/useTransactions';
import { SALARY_DESCRIPTION_DEFAULT } from '../constants';
import type { BankAccount } from '@/features/accounts';
import type { Category } from '@/features/categories';

export function useLaunchSalary(
  accounts: BankAccount[],
  incomeCategories: Category[],
  netPay: number,
  paymentMethodId: number | null,
) {
  const { create } = useTransactionMutations();
  const { addToast } = useToast();

  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  const [description, setDescription] = useState(SALARY_DESCRIPTION_DEFAULT);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const handleOpenLaunchDialog = () => {
    if (netPay <= 0) {
      addToast('O lançamento só é permitido quando o valor líquido for maior que zero.', 'error');
      return;
    }

    const defaultAccount =
      accounts.find((account) => account.name.toLowerCase() === 'santander') ?? accounts[0];
    const defaultCategory =
      incomeCategories.find((category) => category.name.toLowerCase().includes('salário')) ??
      incomeCategories.find((category) => category.name.toLowerCase().includes('salario')) ??
      incomeCategories[0];
    const now = new Date();
    const day12 = new Date(now.getFullYear(), now.getMonth(), 12);

    setDescription(SALARY_DESCRIPTION_DEFAULT);
    setAccountId(defaultAccount ? String(defaultAccount.bankAccount) : '');
    setCategoryId(defaultCategory ? String(defaultCategory.category) : '');
    setPaymentDate(day12.toISOString().slice(0, 10));
    setLaunchDialogOpen(true);
  };

  const handleCloseLaunchDialog = () => {
    if (create.isPending) return;
    setLaunchDialogOpen(false);
  };

  const handleConfirmLaunch = () => {
    if (netPay <= 0) {
      addToast('O lançamento só é permitido quando o valor líquido for maior que zero.', 'error');
      return;
    }
    if (!description.trim() || !accountId || !categoryId || !paymentDate) {
      addToast('Preencha descrição, conta, categoria e data da transação.', 'error');
      return;
    }

    create.mutate(
      {
        transactionType: TransactionTypeId.INCOME,
        amount: Number(netPay.toFixed(2)),
        paymentDate,
        purchaseDate: null,
        description: description.trim(),
        account: Number(accountId),
        toAccount: null,
        card: null,
        category: Number(categoryId),
        paymentMethod: paymentMethodId,
        notes: '',
        isPaid: false,
        isFixed: false,
        isInstallment: false,
        totalInstallments: 0,
        repeatCount: 0,
        installmentAmounts: null,
        recurringGroup: null,
      },
      { onSuccess: () => setLaunchDialogOpen(false) },
    );
  };

  return {
    create,
    launchDialogOpen,
    description,
    accountId,
    categoryId,
    paymentDate,
    setDescription,
    setAccountId,
    setCategoryId,
    setPaymentDate,
    handleOpenLaunchDialog,
    handleCloseLaunchDialog,
    handleConfirmLaunch,
  };
}
