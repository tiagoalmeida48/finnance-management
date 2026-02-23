import { Controller, type Control } from 'react-hook-form';
import type { TransactionFormValues } from '@/pages/transactions/hooks/useTransactionFormLogic';
import { Input } from '@/shared/components/ui/input';

interface TransactionDateFieldProps {
    control: Control<TransactionFormValues>;
}

export function TransactionDateField({ control }: TransactionDateFieldProps) {
    return (
        <Controller
            name="payment_date"
            control={control}
            render={({ field }) => (
                <Input
                    type="date"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="[color-scheme:dark] rounded-[10px]"
                />
            )}
        />
    );
}



