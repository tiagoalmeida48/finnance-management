import { InvoiceStatusId } from '@/config/constants';

type StatusVariant = 'default' | 'income' | 'expense' | 'primary';

interface InvoiceStatusMeta {
  label: string;
  variant: StatusVariant;
}

const statusMap: Record<number, InvoiceStatusMeta> = {
  [InvoiceStatusId.OPEN]: { label: 'Aberta', variant: 'primary' },
  [InvoiceStatusId.PARTIAL]: { label: 'Parcial', variant: 'default' },
  [InvoiceStatusId.PAID]: { label: 'Paga', variant: 'income' },
};

export function getInvoiceStatusMeta(status: number): InvoiceStatusMeta {
  return statusMap[status] ?? { label: 'Desconhecida', variant: 'default' };
}
