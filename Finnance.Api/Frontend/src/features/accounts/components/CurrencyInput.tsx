import { formatCurrency, parseCurrencyInput } from '@/shared/utils';
import { Input } from '@/shared/components/ui';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function CurrencyInput({ id, value, onChange, disabled }: CurrencyInputProps) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      disabled={disabled}
      value={formatCurrency(value)}
      onChange={(event) => onChange(parseCurrencyInput(event.target.value))}
      className="w-full"
    />
  );
}
