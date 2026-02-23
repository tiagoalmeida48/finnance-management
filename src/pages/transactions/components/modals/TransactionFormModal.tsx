import { type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { useTransactionFormLogic } from '@/pages/transactions/hooks/useTransactionFormLogic';
import type { Transaction } from '@/shared/interfaces/transaction.interface';
import { TransactionAdvancedSection } from '../TransactionForm/TransactionAdvancedSection';
import { TransactionBasicFields } from '../TransactionForm/TransactionBasicFields';
import { TransactionFormActions } from '../TransactionForm/TransactionFormActions';
import { TransactionPaymentSection } from '../TransactionForm/TransactionPaymentSection';
import { TransactionTransferSection } from '../TransactionForm/TransactionTransferSection';
import { TransactionTypeSelector } from '../TransactionForm/TransactionTypeSelector';
import { getTypeConfig } from '../TransactionForm/transactionFormStyles';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { messages } from '@/shared/i18n/messages';

interface TransactionFormModalProps {
    open: boolean;
    onClose: () => void;
    transaction?: Transaction;
}

const formatDisplayValue = (raw: string) => {
    const numericValue = parseInt(raw || '0', 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);
};

export function TransactionFormModal({ open, onClose, transaction }: TransactionFormModalProps) {
    const isMobile = useMediaQuery('(max-width: 599px)');

    const {
        form,
        accounts = [],
        categories = [],
        cards = [],
        applyToGroup,
        setApplyToGroup,
        resetUiState,
        transactionType,
        paymentMethod,
        isInstallment,
        isFixed,
        onSubmit,
    } = useTransactionFormLogic(open, onClose, transaction);

    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = form;

    const amount = watch('amount') || 0;
    const totalInstallments = watch('total_installments') || 1;
    const handleMoneyInput = (event: ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, '');
        setValue('amount', parseInt(digits || '0', 10) / 100);
    };

    const submitLabel = isSubmitting
        ? messages.transactions.form.submit.saving
        : transaction
            ? messages.transactions.form.submit.save
            : messages.transactions.form.submit.create(getTypeConfig(transactionType).label);

    const filteredCategories = categories.filter((category) => category.type === transactionType);
    const handleCloseModal = () => {
        resetUiState();
        onClose();
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        void onSubmit(event);
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseModal}
            maxWidth={false}
            className={`border border-white/10 bg-[var(--color-bgSecondary)] shadow-[0_24px_64px_var(--overlay-black-50)] ${isMobile ? 'w-[95vw] max-w-[95vw]' : 'w-[640px] max-w-[95vw]'
                }`}
        >
            <form onSubmit={handleFormSubmit} noValidate>
                <DialogContent className={isMobile ? 'p-[24px_20px]' : 'p-[32px_28px]'}>
                    <h2 className="font-heading mb-2.5 text-[22px] font-bold text-[var(--color-text-primary)]">
                        {transaction ? messages.transactions.form.modal.editTitle : messages.transactions.form.modal.createTitle}
                    </h2>

                    <TransactionTypeSelector control={control} />

                    <TransactionBasicFields
                        register={register}
                        errors={errors}
                        isMobile={isMobile}
                        rawValue={String(Math.round(Number(amount) * 100))}
                        formatDisplayValue={formatDisplayValue}
                        onMoneyInput={handleMoneyInput}
                    />

                    {transactionType !== 'transfer' ? (
                        <TransactionPaymentSection
                            isMobile={isMobile}
                            transaction={transaction}
                            paymentMethod={paymentMethod}
                            register={register}
                            control={control}
                            watch={watch}
                            errors={errors}
                            categories={categories}
                            filteredCategories={filteredCategories}
                            accounts={accounts}
                            cards={cards}
                        />
                    ) : (
                        <TransactionTransferSection
                            isMobile={isMobile}
                            transaction={transaction}
                            accounts={accounts}
                            errors={errors}
                            register={register}
                            control={control}
                        />
                    )}

                    <TransactionAdvancedSection
                        isFixed={isFixed}
                        isInstallment={isInstallment}
                        amount={amount}
                        totalInstallments={totalInstallments}
                        transaction={transaction}
                        applyToGroup={applyToGroup}
                        setApplyToGroup={setApplyToGroup}
                        register={register}
                    />
                </DialogContent>

                <TransactionFormActions
                    isSubmitting={isSubmitting}
                    submitLabel={submitLabel}
                    onClose={handleCloseModal}
                />
            </form>
        </Dialog>
    );
}




