import { useMemo } from "react";
import { Input, type InputProps } from "@/shared/components/ui/input";

const DEFAULT_LOCALE = "pt-BR";
const DEFAULT_CURRENCY = "BRL";

const parseCurrencyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
};

type CurrencyInputFieldProps = Omit<
  InputProps,
  "type" | "inputMode" | "value" | "onChange"
> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  locale?: string;
  currency?: string;
};

export function CurrencyInputField({
  value,
  onValueChange,
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
  ...props
}: CurrencyInputFieldProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }),
    [locale, currency],
  );

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={formatter.format(Number(value ?? 0))}
      onChange={(event) =>
        onValueChange(parseCurrencyInput(event.target.value))
      }
    />
  );
}
