import { useEffect, useMemo, useRef } from 'react';
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
  SelectMenu,
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
import type {
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
} from '../types/transactions.types';

interface TransactionFormModalProps {
  open: boolean;
  editing?: Transaction | null;
  onClose: () => void;
}

function toFormValues(t: Transaction): TransactionFormData {
  return {
    transactionType: t.transactionType,
    amount: t.amount ?? 0,
    description: t.description,
    paymentDate: (t.paymentDate ?? '').slice(0, 10),
    purchaseDate: (t.purchaseDate ?? '').slice(0, 10),
    account: t.account ?? 0,
    toAccount: t.toAccount ?? 0,
    card: t.card ?? 0,
    category: t.category ?? 0,
    paymentMethod: t.paymentMethod ?? 0,
    notes: t.notes ?? '',
    isPaid: t.paid,
    isFixed: t.fixed,
    isInstallment: false,
    totalInstallments: 1,
    repeatCount: 1,
  };
}

const typeOptions = [
  { value: TransactionTypeId.EXPENSE, label: transactionTypeLabel(TransactionTypeId.EXPENSE) },
  { value: TransactionTypeId.INCOME, label: transactionTypeLabel(TransactionTypeId.INCOME) },
  { value: TransactionTypeId.TRANSFER, label: transactionTypeLabel(TransactionTypeId.TRANSFER) },
];

const today = () => new Date().toISOString().slice(0, 10);

const fieldError = (message?: string) =>
  message ? <p className="text-expense text-xs mt-1">{message}</p> : null;

export function TransactionFormModal({ open, editing, onClose }: TransactionFormModalProps) {
  const accounts = useAccountsLookup();
  const categories = useCategoriesLookup();
  const cards = useCardsLookup();
  const paymentMethods = usePaymentMethodsLookup();
  const { create, update } = useTransactionMutations();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
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

  const initialized = useRef(false);
  const lookupsReady =
    !accounts.isLoading &&
    !cards.isLoading &&
    !categories.isLoading &&
    !paymentMethods.isLoading;

  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    if (editing && !lookupsReady) return;
    reset(
      editing
        ? toFormValues(editing)
        : {
            transactionType: TransactionTypeId.EXPENSE,
            paymentDate: today(),
            purchaseDate: '',
            isPaid: false,
            isFixed: false,
            isInstallment: false,
            totalInstallments: 1,
            repeatCount: 1,
          },
    );
    initialized.current = true;
  }, [open, editing, lookupsReady, reset]);

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

  const bind = (name: keyof TransactionFormData) => ({
    value: (watch(name) as string | number | undefined) ?? '',
    onChange: (value: string) => setValue(name, value, { shouldValidate: true }),
  });

  const onSubmit = handleSubmit((data) => {
    if (editing) {
      const type = Number(data.transactionType);
      const transfer = type === TransactionTypeId.TRANSFER;
      const onCard = !transfer && Number(data.card) > 0;
      const updatePayload: TransactionUpdateInput = {
        transaction: editing.transaction,
        transactionType: type,
        amount: Number(data.amount),
        description: data.description.trim(),
        paymentDate: data.paymentDate || null,
        paid: Boolean(data.isPaid),
        fixed: Boolean(data.isFixed),
        notes: data.notes ?? '',
      };
      if (data.account) updatePayload.account = Number(data.account);
      else updatePayload.clearAccount = true;
      if (transfer && data.toAccount) updatePayload.toAccount = Number(data.toAccount);
      else updatePayload.clearToAccount = true;
      if (onCard) updatePayload.card = Number(data.card);
      else updatePayload.clearCard = true;
      if (!transfer && data.category) updatePayload.category = Number(data.category);
      else updatePayload.clearCategory = true;
      if (!transfer && data.paymentMethod) updatePayload.paymentMethod = Number(data.paymentMethod);
      else updatePayload.clearPaymentMethod = true;
      if (onCard && data.purchaseDate) updatePayload.purchaseDate = data.purchaseDate;
      else updatePayload.clearPurchaseDate = true;
      update.mutate(updatePayload, { onSuccess: onClose });
      return;
    }

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
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? undefined : onClose())}
      className="max-w-2xl"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-3"
        >
          <div>
            <Label htmlFor="transactionType">Tipo</Label>
            <SelectMenu id="transactionType" options={typeOptions} {...bind('transactionType')} />
          </div>

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

          <div className="sm:col-span-3">
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
            <>
              <div>
                <Label htmlFor="account">Conta de origem</Label>
                <SelectMenu
                  id="account"
                  placeholder="Selecione"
                  options={accountOptions}
                  {...bind('account')}
                />
                {fieldError(errors.account?.message)}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="toAccount">Conta de destino</Label>
                <SelectMenu
                  id="toAccount"
                  placeholder="Selecione"
                  options={accountOptions}
                  {...bind('toAccount')}
                />
                {fieldError(errors.toAccount?.message)}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="account">Conta</Label>
                <SelectMenu
                  id="account"
                  placeholder="Nenhuma"
                  options={[{ value: '', label: 'Nenhuma' }, ...accountOptions]}
                  {...bind('account')}
                />
                {fieldError(errors.account?.message)}
              </div>
              <div>
                <Label htmlFor="card">Cartão</Label>
                <SelectMenu
                  id="card"
                  placeholder="Nenhum"
                  options={[{ value: '', label: 'Nenhum' }, ...cardOptions]}
                  {...bind('card')}
                />
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

              <div>
                <Label htmlFor="category">Categoria</Label>
                <SelectMenu
                  id="category"
                  placeholder="Sem categoria"
                  options={[{ value: '', label: 'Sem categoria' }, ...categoryOptions]}
                  {...bind('category')}
                />
              </div>
              <div className={isCard ? '' : 'sm:col-span-2'}>
                <Label htmlFor="paymentMethod">Forma de pagamento</Label>
                <SelectMenu
                  id="paymentMethod"
                  placeholder="Não informado"
                  options={[{ value: '', label: 'Não informado' }, ...paymentMethodOptions]}
                  {...bind('paymentMethod')}
                />
              </div>

              <div className="flex flex-wrap gap-4 sm:col-span-3">
                {!editing && (
                  <>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <Checkbox {...register('isInstallment')} disabled={isFixed} />
                      Parcelado
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <Checkbox {...register('isFixed')} disabled={isInstallment} />
                      Recorrente
                    </label>
                  </>
                )}
                <label className="flex items-center gap-2 text-sm text-text">
                  <Checkbox {...register('isPaid')} />
                  Pago
                </label>
              </div>

              {!editing && isInstallment ? (
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

              {!editing && isFixed ? (
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

          <div className="sm:col-span-3">
            <Label htmlFor="notes">Observações</Label>
            <Input id="notes" className="w-full" {...register('notes')} />
          </div>

          <DialogFooter className="sm:col-span-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={editing ? update.isPending : create.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
