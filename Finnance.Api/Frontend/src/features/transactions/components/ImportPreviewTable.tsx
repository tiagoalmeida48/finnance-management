import { Check, Trash2 } from 'lucide-react';
import { Button, Input, SelectMenu } from '@/shared/components/ui';
import type { ImportRow } from '../hooks/useTransactionImportLogic';

interface Option {
  value: string | number;
  label: string;
}

interface ImportPreviewTableProps {
  rows: ImportRow[];
  categoryOptions: Option[];
  onChange: (index: number, patch: Partial<ImportRow>) => void;
  onRemove: (index: number) => void;
}

const cols = 'grid grid-cols-[120px_minmax(180px,1fr)_110px_160px_90px_64px] items-center gap-2';

function rowValid(row: ImportRow): boolean {
  return Boolean(row.description.trim()) && row.amount > 0 && Boolean(row.date);
}

export function ImportPreviewTable({
  rows,
  categoryOptions,
  onChange,
  onRemove,
}: ImportPreviewTableProps) {
  return (
    <div className="max-h-[45vh] overflow-auto">
      <div className="min-w-[720px] space-y-2">
        <div className={`${cols} px-1 font-mono text-[0.6rem] uppercase tracking-wider text-text-muted`}>
          <span>Data</span>
          <span>Descrição</span>
          <span>Valor</span>
          <span>Categoria</span>
          <span>Parcelas</span>
          <span />
        </div>

        {rows.map((row, index) => (
          <div key={index} className={`${cols} rounded-lg border border-border bg-surface-2 p-2`}>
            <Input
              type="date"
              value={row.date}
              onChange={(event) => onChange(index, { date: event.target.value })}
            />
            <Input
              value={row.description}
              placeholder="Descrição"
              onChange={(event) => onChange(index, { description: event.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={row.amount}
              onChange={(event) => onChange(index, { amount: Number(event.target.value) })}
            />
            <SelectMenu
              options={[{ value: 0, label: 'Sem Categoria' }, ...categoryOptions]}
              value={row.categoryId}
              onChange={(value) => onChange(index, { categoryId: Number(value) })}
            />
            <Input
              placeholder="Ex: 10"
              value={row.installments}
              onChange={(event) => onChange(index, { installments: event.target.value })}
            />
            <div className="flex items-center justify-end gap-1">
              <Check className={`h-4 w-4 ${rowValid(row) ? 'text-income' : 'text-text-muted/40'}`} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-expense"
                aria-label="Remover linha"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
