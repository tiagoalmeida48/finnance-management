import { type ChangeEvent } from 'react';
import { Dialog, DialogContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { ptBR } from 'date-fns/locale';
import { useFieldArray } from 'react-hook-form';
import { useTransactionFormLogic } from '../../hooks/useTransactionFormLogic';
import type { Transaction } from '../../interfaces/transaction.interface';
import { colors } from '@/shared/theme';
import { TransactionAdvancedSection } from './TransactionForm/TransactionAdvancedSection';
import { TransactionBasicFields } from './TransactionForm/TransactionBasicFields';
import { TransactionFormActions } from './TransactionForm/TransactionFormActions';
import { TransactionPaymentSection } from './TransactionForm/TransactionPaymentSection';
import { TransactionTransferSection } from './TransactionForm/TransactionTransferSection';
import { TransactionTypeSelector } from './TransactionForm/TransactionTypeSelector';
import { getTypeConfig } from './TransactionForm/transactionFormStyles';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        form,
        accounts = [],
        categories = [],
        cards = [],
        showInstallmentGrid,
        setShowInstallmentGrid,
        applyToGroup,
        setApplyToGroup,
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

    const { fields } = useFieldArray({ control, name: 'installments' });
    const amount = watch('amount') || 0;
    const totalInstallments = watch('total_installments') || 1;
    const handleMoneyInput = (event: ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, '');
        setValue('amount', parseInt(digits || '0', 10) / 100);
    };

    const submitLabel = isSubmitting
        ? 'Salvando...'
        : transaction
            ? 'Salvar'
            : `Criar ${getTypeConfig(transactionType).label}`;

    const filteredCategories = categories.filter((category) => category.type === transactionType);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: isMobile ? '95vw' : 640,
                        maxWidth: '95vw',
                        bgcolor: colors.bgSecondary,
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    },
                },
            }}
        >
            <form onSubmit={onSubmit}>
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={ptBR}
                    localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                    <DialogContent sx={{ p: isMobile ? '24px 20px' : '32px 28px' }}>
                        <Typography
                            sx={{
                                fontSize: '22px',
                                fontFamily: '"Plus Jakarta Sans"',
                                fontWeight: 700,
                                color: colors.textPrimary,
                                mb: 2.5,
                            }}
                        >
                            {transaction ? 'Editar Transação' : 'Nova Transação'}
                        </Typography>

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
                            showInstallmentGrid={showInstallmentGrid}
                            setShowInstallmentGrid={setShowInstallmentGrid}
                            fields={fields}
                            register={register}
                        />
                    </DialogContent>
                </LocalizationProvider>

                <TransactionFormActions
                    isSubmitting={isSubmitting}
                    submitLabel={submitLabel}
                    onClose={onClose}
                />
            </form>
        </Dialog>
    );
}
