import { CheckCircle2, Layers, Repeat } from 'lucide-react';
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
  Switch,
  SelectMenu,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { TransactionTypeId } from '@/config/constants';
import { useTransactionFormLogic } from '../hooks/useTransactionFormLogic';
import type { Transaction } from '../types/transactions.types';

interface TransactionFormModalProps {
  open: boolean;
  editing?: Transaction | null;
  onClose: () => void;
}

const typeTabs = [
  { value: TransactionTypeId.EXPENSE, label: 'Despesa', active: 'bg-expense/15 text-expense' },
  { value: TransactionTypeId.INCOME, label: 'Receita', active: 'bg-income/15 text-income' },
  { value: TransactionTypeId.TRANSFER, label: 'Transferência', active: 'bg-surface-3 text-text' },
];

const labelClass = 'font-mono text-[0.65rem] uppercase tracking-wider text-text-muted';
const sectionClass = 'border-t border-border pt-3 font-mono text-[0.65rem] uppercase tracking-wider text-text-muted';
const toggleBoxClass =
  'flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text';

const fieldError = (message?: string) =>
  message ? <p className="mt-1 text-xs text-expense">{message}</p> : null;

function submitLabel(editing: boolean, transactionType: number): string {
  if (editing) return 'Salvar';
  if (transactionType === TransactionTypeId.INCOME) return 'Criar Receita';
  if (transactionType === TransactionTypeId.TRANSFER) return 'Criar Transferência';
  return 'Criar Despesa';
}

export function TransactionFormModal({ open, editing, onClose }: TransactionFormModalProps) {
  const {
    register,
    errors,
    onSubmit,
    setType,
    bind,
    transactionType,
    isTransfer,
    isCard,
    isCreditMethod,
    isInstallment,
    isFixed,
    installmentPreview,
    isGroupEditing,
    accountOptions,
    cardOptions,
    categoryOptions,
    paymentMethodOptions,
    isPending,
  } = useTransactionFormLogic({ open, editing, onClose });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? undefined : onClose())}
      className="max-w-2xl"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-2 p-1">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setType(tab.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  transactionType === tab.value ? tab.active : 'text-text-muted hover:text-text',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="description" className={labelClass}>
                Descrição *
              </Label>
              <Input
                id="description"
                placeholder="Ex.: Mercado, salário, aluguel"
                {...register('description')}
              />
              {fieldError(errors.description?.message)}
            </div>
            <div>
              <Label htmlFor="amount" className={labelClass}>
                Valor total *
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  R$
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-9"
                  placeholder="0,00"
                  {...register('amount')}
                />
              </div>
              {fieldError(errors.amount?.message)}
            </div>
          </div>

          {isTransfer ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="account" className={labelClass}>
                  Conta de origem *
                </Label>
                <SelectMenu id="account" placeholder="Selecione" options={accountOptions} {...bind('account')} />
                {fieldError(errors.account?.message)}
              </div>
              <div>
                <Label htmlFor="toAccount" className={labelClass}>
                  Conta de destino *
                </Label>
                <SelectMenu id="toAccount" placeholder="Selecione" options={accountOptions} {...bind('toAccount')} />
                {fieldError(errors.toAccount?.message)}
              </div>
              <div>
                <Label htmlFor="paymentDate" className={labelClass}>
                  Data *
                </Label>
                <Input id="paymentDate" type="date" {...register('paymentDate')} />
                {fieldError(errors.paymentDate?.message)}
              </div>
            </div>
          ) : (
            <>
              <p className={sectionClass}>Pagamento</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="paymentMethod" className={labelClass}>
                    Forma de pagamento
                  </Label>
                  <SelectMenu
                    id="paymentMethod"
                    placeholder="Não informado"
                    options={[{ value: '', label: 'Não informado' }, ...paymentMethodOptions]}
                    {...bind('paymentMethod')}
                  />
                </div>
                <div>
                  <Label htmlFor="category" className={labelClass}>
                    Categoria
                  </Label>
                  <SelectMenu
                    id="category"
                    placeholder="Sem categoria"
                    options={[{ value: '', label: 'Sem categoria' }, ...categoryOptions]}
                    {...bind('category')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="account" className={labelClass}>
                    Conta *
                  </Label>
                  <SelectMenu
                    id="account"
                    placeholder="Nenhuma"
                    options={[{ value: '', label: 'Nenhuma' }, ...accountOptions]}
                    {...bind('account')}
                  />
                  {fieldError(errors.account?.message)}
                </div>
                <div>
                  <Label htmlFor="card" className={labelClass}>
                    Cartão
                  </Label>
                  <SelectMenu
                    id="card"
                    placeholder={isCreditMethod ? 'Nenhum' : 'Só para crédito'}
                    disabled={!isCreditMethod}
                    options={[{ value: '', label: 'Nenhum' }, ...cardOptions]}
                    {...bind('card')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentDate" className={labelClass}>
                  {isCard ? 'Data da compra *' : 'Data *'}
                </Label>
                <Input id="paymentDate" type="date" {...register('paymentDate')} />
                {fieldError(errors.paymentDate?.message)}
              </div>
            </>
          )}

          <div
            className={cn(
              'grid grid-cols-1 gap-3 border-t border-border pt-3',
              !editing && !isTransfer ? 'sm:grid-cols-3' : '',
            )}
          >
            {!editing && !isTransfer ? (
              <>
                <label className={toggleBoxClass}>
                  <span className="flex items-center gap-2">
                    <Repeat size={16} className="text-text-muted" />
                    Recorrente
                  </span>
                  <Switch {...register('isFixed')} disabled={isInstallment} />
                </label>
                <label className={toggleBoxClass}>
                  <span className="flex items-center gap-2">
                    <Layers size={16} className="text-text-muted" />
                    Parcelar
                  </span>
                  <Switch {...register('isInstallment')} disabled={isFixed} />
                </label>
              </>
            ) : null}
            <label className={toggleBoxClass}>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-text-muted" />
                Pago
              </span>
              <Switch {...register('isPaid')} />
            </label>
          </div>

          {!editing && !isTransfer && isInstallment ? (
            <div>
              <Label htmlFor="totalInstallments" className={labelClass}>
                Número de parcelas
              </Label>
              <Input id="totalInstallments" type="number" min="2" {...register('totalInstallments')} />
              {fieldError(errors.totalInstallments?.message)}
              {installmentPreview ? (
                <p className="mt-1 text-xs text-primary">{installmentPreview}</p>
              ) : null}
            </div>
          ) : null}

          {!editing && !isTransfer && isFixed ? (
            <div>
              <Label htmlFor="repeatCount" className={labelClass}>
                Repetições
              </Label>
              <Input id="repeatCount" type="number" min="2" {...register('repeatCount')} />
              {fieldError(errors.repeatCount?.message)}
            </div>
          ) : null}

          {isGroupEditing ? (
            <label className="flex items-center gap-2 text-sm text-text">
              <Checkbox {...register('replicateToGroup')} />
              Replicar para todas as parcelas
            </label>
          ) : null}

          <div>
            <Label htmlFor="notes" className={labelClass}>
              Observações
            </Label>
            <Input id="notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isPending}>
              {submitLabel(Boolean(editing), transactionType)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
