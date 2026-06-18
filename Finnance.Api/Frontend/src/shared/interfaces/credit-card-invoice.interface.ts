import { z } from 'zod';
import { CreditCardInvoiceSchema, InvoiceStatusSchema } from '@/shared/schemas';

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
export type CreditCardInvoice = z.infer<typeof CreditCardInvoiceSchema>;
