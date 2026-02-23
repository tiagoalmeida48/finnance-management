import { AlertCircle } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { colors } from '@/shared/theme';
import type { TransactionFormValues } from '@/pages/transactions/hooks/useTransactionFormLogic';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface TransactionBasicFieldsProps {
    register: UseFormRegister<TransactionFormValues>;
    errors: FieldErrors<TransactionFormValues>;
    isMobile: boolean;
    rawValue: string;
    formatDisplayValue: (raw: string) => string;
    onMoneyInput: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function TransactionBasicFields({
    register,
    errors,
    isMobile,
    rawValue,
    formatDisplayValue,
    onMoneyInput,
}: TransactionBasicFieldsProps) {
    return (
        <Container unstyled>
            <Container unstyled className={`mb-2 flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <Container unstyled className="flex-[1.5] space-y-1">
                    <Label className="text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
                        {messages.transactions.form.basicFields.descriptionLabel}
                    </Label>
                    <Input
                        placeholder={messages.transactions.form.basicFields.descriptionPlaceholder}
                        {...register('description')}
                    />
                    {errors.description && (
                        <Container unstyled className="mt-0.5 flex items-center gap-0.5">
                            <AlertCircle size={12} color={colors.red} />
                            <Text className="text-[11px] text-[var(--color-error)]">
                                {String(errors.description.message ?? '')}
                            </Text>
                        </Container>
                    )}
                </Container>

                <Container unstyled className="flex-1 space-y-1">
                    <Label className="text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
                        {messages.transactions.form.basicFields.amountLabel}
                    </Label>
                    <Container unstyled
                        className={`flex h-11 items-center justify-between rounded-[10px] border bg-[var(--overlay-white-03)] px-1.5 transition-all duration-200 focus-within:border-white/15 focus-within:shadow-[0_0_0_3px_var(--overlay-white-04)] ${errors.amount ? 'border-[var(--color-error)]' : 'border-[var(--overlay-white-06)]'
                            }`}
                    >
                        <Text className="text-[13px] font-medium text-[var(--color-text-muted)]">
                            {messages.transactions.form.basicFields.currencyPrefix}
                        </Text>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayValue(rawValue)}
                            onChange={onMoneyInput}
                            className="font-heading ml-2 w-full border-none bg-transparent text-right text-2xl font-bold text-[var(--color-text-primary)] outline-none"
                        />
                    </Container>
                </Container>
            </Container>
        </Container>
    );
}



