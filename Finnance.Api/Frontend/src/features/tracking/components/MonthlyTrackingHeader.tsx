import { formatCurrency } from '../constants';

interface MonthlyTrackingHeaderProps {
  monthName: string;
  totalAmount: number;
  isSettled: boolean;
}

export function MonthlyTrackingHeader({
  monthName,
  totalAmount,
  isSettled,
}: MonthlyTrackingHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-base font-bold capitalize text-text">{monthName}</span>
        <span className={`text-sm font-bold ${isSettled ? 'text-income' : 'text-primary'}`}>
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <span
        className={`inline-flex h-[22px] shrink-0 items-center rounded-full border px-2 text-[11px] font-bold ${
          isSettled
            ? 'border-income/35 bg-income/10 text-income'
            : 'border-primary/35 bg-primary/10 text-primary'
        }`}
      >
        {isSettled ? 'Quitado' : 'Pendente'}
      </span>
    </div>
  );
}
