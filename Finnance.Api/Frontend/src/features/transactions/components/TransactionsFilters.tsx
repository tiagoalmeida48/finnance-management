import { Button, Input, Label, Select } from '@/shared/components/ui';
import {
  useAccountsLookup,
  useCategoriesLookup,
} from '../hooks/useLookups';
import type { TransactionFilter } from '../types/transactions.types';

interface TransactionsFiltersProps {
  filter: TransactionFilter;
  onChange: (patch: Partial<TransactionFilter>) => void;
  onReset: () => void;
}

const paidOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagos' },
  { value: 'pending', label: 'Pendentes' },
];

function paidToValue(isPaid: boolean | null): string {
  if (isPaid === null) return 'all';
  return isPaid ? 'paid' : 'pending';
}

function valueToPaid(value: string): boolean | null {
  if (value === 'paid') return true;
  if (value === 'pending') return false;
  return null;
}

export function TransactionsFilters({ filter, onChange, onReset }: TransactionsFiltersProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();

  const accountOptions = (accounts.data ?? []).map((a) => ({ value: a.bankAccount, label: a.name }));
  const categoryOptions = (categories.data ?? []).map((c) => ({ value: c.category, label: c.name }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
      <div>
        <Label htmlFor="filter-account">Conta</Label>
        <Select
          id="filter-account"
          className="w-full"
          placeholder="Todas"
          options={accountOptions}
          value={filter.account || ''}
          onChange={(e) => onChange({ account: Number(e.target.value) || 0, offset: 0 })}
        />
      </div>
      <div>
        <Label htmlFor="filter-category">Categoria</Label>
        <Select
          id="filter-category"
          className="w-full"
          placeholder="Todas"
          options={categoryOptions}
          value={filter.category || ''}
          onChange={(e) => onChange({ category: Number(e.target.value) || 0, offset: 0 })}
        />
      </div>
      <div>
        <Label htmlFor="filter-start">De</Label>
        <Input
          id="filter-start"
          type="date"
          className="w-full"
          value={filter.startDate ?? ''}
          onChange={(e) => onChange({ startDate: e.target.value || null, offset: 0 })}
        />
      </div>
      <div>
        <Label htmlFor="filter-end">Até</Label>
        <Input
          id="filter-end"
          type="date"
          className="w-full"
          value={filter.endDate ?? ''}
          onChange={(e) => onChange({ endDate: e.target.value || null, offset: 0 })}
        />
      </div>
      <div>
        <Label htmlFor="filter-paid">Situação</Label>
        <Select
          id="filter-paid"
          className="w-full"
          options={paidOptions}
          value={paidToValue(filter.isPaid)}
          onChange={(e) => onChange({ isPaid: valueToPaid(e.target.value), offset: 0 })}
        />
      </div>
      <Button type="button" variant="outline" onClick={onReset}>
        Limpar
      </Button>
    </div>
  );
}
