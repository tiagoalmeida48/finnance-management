import { Controller, type Control } from 'react-hook-form';
import type { TransactionType } from '@/shared/interfaces';
import type { TransactionFormValues } from '@/pages/transactions/hooks/useTransactionFormLogic';
import { getTypeConfig } from './transactionFormStyles';
import { Container } from '@/shared/components/layout/Container';
import { Button } from '@/shared/components/ui/button';

interface TransactionTypeSelectorProps {
    control: Control<TransactionFormValues>;
}

const transactionTypes: TransactionType[] = ['expense', 'income', 'transfer'];

export function TransactionTypeSelector({ control }: TransactionTypeSelectorProps) {
    return (
        <Controller
            name="type"
            control={control}
            render={({ field }) => (
                <Container unstyled
                    className="mb-2.5 flex gap-0.5 rounded-[10px] bg-[var(--overlay-white-04)] p-[3px]"
                >
                    {transactionTypes.map((type) => {
                        const config = getTypeConfig(type);
                        const isActive = field.value === type;

                        return (
                            <Button
                                key={type}
                                type="button"
                                onClick={() => field.onChange(type)}
                                className={`font-body flex-1 rounded-lg border-none py-1.5 text-[13px] transition-all duration-200 ${isActive
                                        ? type === 'income'
                                            ? 'bg-[var(--color-greenBg)] font-semibold text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white'
                                            : type === 'expense'
                                                ? 'bg-[var(--color-redBg)] font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white'
                                                : 'bg-[var(--overlay-info-15)] font-semibold text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white'
                                        : 'bg-transparent font-medium text-[var(--color-text-secondary)] hover:bg-white/[0.04] hover:text-white'
                                    }`}
                            >
                                {config.label}
                            </Button>
                        );
                    })}
                </Container>
            )}
        />
    );
}

