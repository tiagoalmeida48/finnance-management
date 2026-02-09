import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, type Control } from 'react-hook-form';
import { format } from 'date-fns';
import type { TransactionFormValues } from '@/shared/hooks/useTransactionFormLogic';
import { datePickerPopperSx, modernDateInputSx } from './transactionFormStyles';

interface TransactionDateFieldProps {
    control: Control<TransactionFormValues>;
}

export function TransactionDateField({ control }: TransactionDateFieldProps) {
    return (
        <Controller
            name="payment_date"
            control={control}
            render={({ field }) => (
                <DatePicker
                    value={field.value ? new Date(`${field.value}T00:00:00`) : null}
                    onChange={(newValue) => {
                        if (!newValue || Number.isNaN(newValue.getTime())) {
                            field.onChange('');
                            return;
                        }
                        field.onChange(format(newValue, 'yyyy-MM-dd'));
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            sx: modernDateInputSx,
                        },
                        popper: {
                            sx: datePickerPopperSx,
                        },
                    }}
                />
            )}
        />
    );
}
