import { useState } from 'react';
import { IconButton } from '@/shared/components/ui/icon-button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Category } from '@/shared/interfaces';
import type { FileData, ImportPreviewRow } from './importTransactions.types';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/layout/Table';

type ResizableColumnKey =
  | 'date'
  | 'description'
  | 'amount'
  | 'category'
  | 'installments'
  | 'paymentDate'
  | 'paymentAccount';

const DEFAULT_COLUMN_WIDTHS: Record<ResizableColumnKey, number> = {
  date: 115,
  description: 300,
  amount: 95,
  category: 150,
  installments: 95,
  paymentDate: 120,
  paymentAccount: 140,
};

const MIN_COLUMN_WIDTHS: Record<ResizableColumnKey, number> = {
  date: 90,
  description: 160,
  amount: 80,
  category: 120,
  installments: 80,
  paymentDate: 100,
  paymentAccount: 110,
};

interface ImportTransactionsPreviewTableProps {
  mappedData: ImportPreviewRow[];
  totalValid: number;
  categories?: Category[];
  isCreditPayment: boolean;
  updateRow: (index: number, field: keyof FileData, value: string) => void;
  removeRow: (index: number) => void;
}

export function ImportTransactionsPreviewTable({
  mappedData,
  totalValid,
  categories,
  isCreditPayment,
  updateRow,
  removeRow,
}: ImportTransactionsPreviewTableProps) {
  const [columnWidths, setColumnWidths] =
    useState<Record<ResizableColumnKey, number>>(DEFAULT_COLUMN_WIDTHS);
  const previewMessages = messages.transactions.importPreview;

  const visibleColumns = [
    { key: 'date' as const, label: previewMessages.columns.date },
    { key: 'description' as const, label: previewMessages.columns.description },
    { key: 'amount' as const, label: previewMessages.columns.amount },
    { key: 'category' as const, label: previewMessages.columns.category },
    {
      key: 'installments' as const,
      label: previewMessages.columns.installments,
    },
    ...(isCreditPayment
      ? []
      : [
          {
            key: 'paymentDate' as const,
            label: previewMessages.columns.paymentDate,
          },
          {
            key: 'paymentAccount' as const,
            label: previewMessages.columns.paymentAccount,
          },
        ]),
  ];

  const startResize = (columnKey: ResizableColumnKey, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = columnWidths[columnKey];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.max(MIN_COLUMN_WIDTHS[columnKey], Math.round(startWidth + delta));

      setColumnWidths((previousWidths) => {
        if (previousWidths[columnKey] === nextWidth) return previousWidths;
        return { ...previousWidths, [columnKey]: nextWidth };
      });
    };

    const finishResize = () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', finishResize, { once: true });
  };

  return (
    <>
      <Container unstyled className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
          {previewMessages.title}
        </h3>
        <ValidationChip
          label={previewMessages.validRowsLabel(totalValid, mappedData.length)}
          color={totalValid === mappedData.length ? 'success' : 'warning'}
        />
      </Container>

      <Container
        unstyled
        className="max-h-[400px] overflow-auto rounded-xl border border-[var(--color-border)]"
      >
        <Table className="min-w-max border-separate border-spacing-0 text-xs">
          <colgroup>
            {visibleColumns.map((column) => (
              <col key={column.key} width={columnWidths[column.key]} />
            ))}
          </colgroup>
          <TableHead className="sticky top-0 z-10 bg-[var(--color-card)]">
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  className="relative border-b border-[var(--color-border)] px-2 py-2 text-left text-[11px] font-bold text-[var(--color-text-secondary)]"
                >
                  {column.label}
                  <Container
                    unstyled
                    onMouseDown={(event) => startResize(column.key, event)}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-white/10"
                  />
                </TableHeaderCell>
              ))}
              <TableHeaderCell className="w-10 border-b border-[var(--color-border)] p-0" />
              <TableHeaderCell className="w-10 border-b border-[var(--color-border)] p-0" />
            </TableRow>
          </TableHead>
          <TableBody>
            {mappedData.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-white/5">
                <TableCell className="border-b border-[var(--color-border)] p-1">
                  <Input
                    value={row.original.Data || ''}
                    onChange={(event) => updateRow(idx, 'Data', event.target.value)}
                    className={`h-8 text-xs ${row.errors.date ? 'border-[var(--color-error)]' : ''}`}
                  />
                </TableCell>
                <TableCell className="border-b border-[var(--color-border)] p-1">
                  <Input
                    value={row.original.Descrição || ''}
                    onChange={(event) => updateRow(idx, 'Descrição', event.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="border-b border-[var(--color-border)] p-1">
                  <Input
                    value={row.original.Valor || ''}
                    onChange={(event) => updateRow(idx, 'Valor', event.target.value)}
                    className={`h-8 text-xs font-bold ${row.errors.amount ? 'border-[var(--color-error)]' : ''} ${row.mapped.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
                  />
                </TableCell>
                <TableCell className="border-b border-[var(--color-border)] p-1">
                  <Select
                    value={row.original.Categoria || ''}
                    onChange={(event) => updateRow(idx, 'Categoria', event.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="">{previewMessages.noCategory}</option>
                    {categories
                      ?.filter((category) => category.type === row.mapped.type)
                      .map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </Select>
                </TableCell>
                <TableCell className="border-b border-[var(--color-border)] p-1">
                  <Input
                    value={row.original.Parcelas || ''}
                    onChange={(event) => updateRow(idx, 'Parcelas', event.target.value)}
                    placeholder={previewMessages.installmentsPlaceholder}
                    className={`h-8 text-xs ${row.errors.installments ? 'border-[var(--color-error)]' : ''}`}
                  />
                </TableCell>
                {!isCreditPayment && (
                  <TableCell className="border-b border-[var(--color-border)] p-1">
                    <Input
                      value={row.original['Data de pagamento'] || ''}
                      onChange={(event) => updateRow(idx, 'Data de pagamento', event.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                )}
                {!isCreditPayment && (
                  <TableCell className="border-b border-[var(--color-border)] p-1">
                    <Input
                      value={row.original['Conta de pagamento'] || ''}
                      onChange={(event) => updateRow(idx, 'Conta de pagamento', event.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                )}
                <TableCell className="border-b border-[var(--color-border)] p-1 text-center">
                  {row.isValid ? (
                    <Text as="span" title={previewMessages.validRowTitle}>
                      <CheckCircle2 size={16} color="var(--color-success)" />
                    </Text>
                  ) : (
                    <Text as="span" title={previewMessages.invalidRowTitle}>
                      <AlertCircle size={16} color="var(--color-error)" />
                    </Text>
                  )}
                </TableCell>
                <TableCell className="border-b border-[var(--color-border)] p-1 text-center">
                  <IconButton
                    size="small"
                    onClick={() => removeRow(idx)}
                    color="inherit"
                    className="opacity-50 hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </>
  );
}

function ValidationChip({ label, color }: { label: string; color: 'success' | 'warning' }) {
  return (
    <Container
      unstyled
      className={`rounded-full border px-2 py-1 text-xs font-bold ${
        color === 'success'
          ? 'border-[var(--color-success)] bg-[var(--overlay-success-alt-10)] text-[var(--color-success)]'
          : 'border-[var(--color-warning-alt)] bg-[var(--overlay-warning-alt-10)] text-[var(--color-warning-alt)]'
      }`}
    >
      {label}
    </Container>
  );
}
