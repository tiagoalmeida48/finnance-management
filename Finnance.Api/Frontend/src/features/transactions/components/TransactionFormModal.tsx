import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
} from '@/shared/components/ui';
import { TransactionTypeId } from '@/config/constants';
import { transactionFormSchema, type TransactionFormData } from './transactionFormSchema';
import { transactionTypeLabel } from './transactionMeta';
import {
  useAccountsLookup,
  useCardsLookup,
  useCategoriesLookup,
  usePaymentMethodsLookup,
} from '../hooks/useLookups';
import { useTransactionMutations } from '../hooks/useTransactions';
import type { TransactionCreateInput } from '../types/transactions.types';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
}

const typeOptions = [
  { value: TransactionTypeId.EXPENSE, label: transactionTypeLabel(TransactionTypeId.EXPENSE) },
  { value: TransactionTypeId.INCOME, label: transactionTypeLabel(TransactionTypeId.INCOME) },
  { value: TransactionTypeId.TRANSFER, label: transactionTypeLabel(TransactionTypeId.TRANSFER) },
];

const today = () => new Date().toISOString().slice(0, 10);

const fieldError = (message?: string) =>
  message ? <p className="text-expense text-sm mt-1">{message}</p> : null;

export function TransactionFormModal({ open, onClose }: TransactionFormModalProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();
  const paymentMethods = usePaymentMethodsLookup();
  const { create } = useTransactionMutations();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionType: TransactionTypeId.EXPENSE,
      paymentDate: today(),
      purchaseDate: '',
      isPaid: false,
      isFixed: false,
      isInstallment: false,
      totalInstallments: 1,
      repeatCount: 1,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        transactionType: TransactionTypeId.EXPENSE,
        paymentDate: today(),
        purchaseDate: '',
        isPaid: false,
        isFixed: false,
        isInstallment: false,
        totalInstallments: 1,
        repeatCount: 1,
      });
    }
  }, [open, reset]);

  const transactionType = Number(watch('transactionType'));
  const card = Number(watch('card'));
  const isInstallment = watch('isInstallment');
  const isFixed = watch('isFixed');
  const isTransfer = transactionType === TransactionTypeId.TRANSFER;
  const isCard = !isTransfer && card > 0;

  const accountOptions = useMemo(
    () => (accounts.data ?? []).map((a) => ({ value: a.bankAccount, label: a.name })),
    [accounts.data],
  );
  const cardOptions = useMemo(
    () => (cards.data ?? []).map((c) => ({ value: c.creditCard, label: c.name })),
    [cards.data],
  );
  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((c) => ({ value: c.category, label: c.name })),
    [categories.data],
  );
  const paymentMethodOptions = useMemo(
    () => (paymentMethods.data ?? []).map((p) => ({ value: p.paymentMethod, label: p.name })),
    [paymentMethods.data],
  );

  const onSubmit = handleSubmit((data) => {
    const payload: TransactionCreateInput = {
      transactionType: Number(data.transactionType),
      amount: Number(data.amount),
      description: data.description.trim(),
      paymentDate: data.paymentDate || null,
      purchaseDate: data.purchaseDate ? data.purchaseDate : null,
      account: data.account ? Number(data.account) : null,
      toAccount: isTransfer && data.toAccount ? Number(data.toAccount) : null,
      card: !isTransfer && data.card ? Number(data.card) : null,
      category: !isTransfer && data.category ? Number(data.category) : null,
      paymentMethod: !isTransfer && data.paymentMethod ? Number(data.paymentMethod) : null,
      notes: data.notes ?? '',
      isPaid: Boolean(data.isPaid),
      isFixed: Boolean(data.isFixed),
      isInstallment: Boolean(data.isInstallment),
      totalInstallments: data.isInstallment ? Number(data.totalInstallments) : 1,
      repeatCount: data.isFixed ? Number(data.repeatCount) : 1,
      installmentAmounts: null,
      recurringGroup: null,
    };
    create.mutate(payload, { onSuccess: onClose });
  });

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transactionType">Tipo</Label>
            <Select
              id="transactionType"
              className="w-full"
              options={typeOptions}
              {...register('transactionType')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="w-full"
                placeholder="0,00"
                {...register('amount')}
              />
              {fieldError(errors.amount?.message)}
            </div>
            <div>
              <Label htmlFor="paymentDate">{isCard ? 'Vencimento' : 'Data'}</Label>
              <Input id="paymentDate" type="date" className="w-full" {...register('paymentDate')} />
              {fieldError(errors.paymentDate?.message)}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              className="w-full"
              placeholder="Ex.: Mercado, salário, aluguel"
              {...register('description')}
            />
            {fieldError(errors.description?.message)}
          </div>

          {isTransfer ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="account">Conta de origem</Label>
                <Select
                  id="account"
                  className="w-full"
                  placeholder="Selecione"
                  options={accountOptions}
                  {...register('account')}
                />
                {fieldError(errors.account?.message)}
              </div>
              <div>
                <Label htmlFor="toAccount">Conta de destino</Label>
                <Select
                  id="toAccount"
                  className="w-full"
                  placeholder="Selecione"
                  options={accountOptions}
                  {...register('toAccount')}
                />
                {fieldError(errors.toAccount?.message)}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="account">Conta</Label>
                  <Select
                    id="account"
                    className="w-full"
                    placeholder="Nenhuma"
                    options={accountOptions}
                    {...register('account')}
                  />
                  {fieldError(errors.account?.message)}
                </div>
                <div>
                  <Label htmlFor="card">Cartão</Label>
                  <Select
                    id="card"
                    className="w-full"
                    placeholder="Nenhum"
                    options={cardOptions}
                    {...register('card')}
                  />
                </div>
              </div>

              {isCard ? (
                <div>
                  <Label htmlFor="purchaseDate">Data da compra</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    className="w-full"
                    {...register('purchaseDate')}
                  />
                  {fieldError(errors.purchaseDate?.message)}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    id="category"
                    className="w-full"
                    placeholder="Sem categoria"
                    options={categoryOptions}
                    {...register('category')}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Forma de pagamento</Label>
                  <Select
                    id="paymentMethod"
                    className="w-full"
                    placeholder="Não informado"
                    options={paymentMethodOptions}
                    {...register('paymentMethod')}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-text">
                  <Checkbox {...register('isInstallment')} disabled={isFixed} />
                  Parcelado
                </label>
                <label className="flex items-center gap-2 text-sm text-text">
                  <Checkbox {...register('isFixed')} disabled={isInstallment} />
                  Recorrente
                </label>
                <label className="flex items-center gap-2 text-sm text-text">
                  <Checkbox {...register('isPaid')} />
                  Pago
                </label>
              </div>

              {isInstallment ? (
                <div>
                  <Label htmlFor="totalInstallments">Número de parcelas</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    min="2"
                    className="w-full"
                    {...register('totalInstallments')}
                  />
                  {fieldError(errors.totalInstallments?.message)}
                </div>
              ) : null}

              {isFixed ? (
                <div>
                  <Label htmlFor="repeatCount">Repetições</Label>
                  <Input
                    id="repeatCount"
                    type="number"
                    min="2"
                    className="w-full"
                    {...register('repeatCount')}
                  />
                  {fieldError(errors.repeatCount?.message)}
                </div>
              ) : null}
            </>
          )}

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" className="w-full" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
