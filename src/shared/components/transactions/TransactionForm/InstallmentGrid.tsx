import { TextField, Button, Collapse, Box, Typography } from '@mui/material';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FieldArrayWithId, UseFormRegister } from 'react-hook-form';
import { TransactionFormValues } from '../../../hooks/useTransactionFormLogic';

interface InstallmentGridProps {
    show: boolean;
    setShow: (val: boolean) => void;
    fields: FieldArrayWithId<TransactionFormValues, 'installments', 'id'>[];
    register: UseFormRegister<TransactionFormValues>;
}

export function InstallmentGrid({ show, setShow, fields, register }: InstallmentGridProps) {
    return (
        <Box>
            <Button
                size="small"
                variant="text"
                endIcon={show ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                onClick={() => setShow(!show)}
            >
                Ajustar valores das parcelas
            </Button>

            <Collapse in={show}>
                <Box sx={{
                    mt: 2,
                    maxHeight: 200,
                    overflowY: 'auto',
                    pr: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1
                }}>
                    {fields.map((field, index) => (
                        <TextField
                            key={field.id}
                            fullWidth
                            size="small"
                            label={`Parcela ${index + 1}`}
                            type="number"
                            {...register(`installments.${index}.amount`)}
                            inputProps={{ step: '0.01' }}
                            InputProps={{
                                startAdornment: <Typography variant="caption" sx={{ mr: 0.5 }}>R$</Typography>
                            }}
                        />
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
}
