import { z } from 'zod';
import { TransactionTypeId } from '@/config/constants';

export const transactionFormSchema = z
  .object({
    transactionType: z.coerce.number(),
    amount: z.coerce.number().positive('Informe um valor maior que zero.'),
    description: z.string().trim().min(1, 'Descrição obrigatória.'),
    paymentDate: z.string().min(1, 'Data obrigatória.'),
    purchaseDate: z.string().optional().default(''),
    account: z.coerce.number().optional().default(0),
    toAccount: z.coerce.number().optional().default(0),
    card: z.coerce.number().optional().default(0),
    category: z.coerce.number().optional().default(0),
    paymentMethod: z.coerce.number().optional().default(0),
    notes: z.string().optional().default(''),
    isPaid: z.boolean().default(false),
    isFixed: z.boolean().default(false),
    isInstallment: z.boolean().default(false),
    totalInstallments: z.coerce.number().int().min(1).default(1),
    repeatCount: z.coerce.number().int().min(1).default(1),
    replicateToGroup: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType === TransactionTypeId.TRANSFER) {
      if (!data.account) {
        ctx.addIssue({ code: 'custom', path: ['account'], message: 'Conta de origem obrigatória.' });
      }
      if (!data.toAccount) {
        ctx.addIssue({ code: 'custom', path: ['toAccount'], message: 'Conta de destino obrigatória.' });
      }
      if (data.account && data.toAccount && data.account === data.toAccount) {
        ctx.addIssue({
          code: 'custom',
          path: ['toAccount'],
          message: 'A conta de destino deve ser diferente da origem.',
        });
      }
      return;
    }

    if (!data.account && !data.card) {
      ctx.addIssue({
        code: 'custom',
        path: ['account'],
        message: 'Selecione uma conta ou um cartão.',
      });
    }
    if (data.isInstallment && data.totalInstallments < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['totalInstallments'],
        message: 'Parcelamento exige ao menos 2 parcelas.',
      });
    }
    if (data.isFixed && data.repeatCount < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['repeatCount'],
        message: 'Recorrência exige ao menos 2 repetições.',
      });
    }
  });

export type TransactionFormData = z.input<typeof transactionFormSchema>;
export type TransactionFormParsed = z.output<typeof transactionFormSchema>;
