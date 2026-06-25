import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  SelectMenu,
} from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { BankAccount } from '@/features/accounts';
import type { Category } from '@/features/categories';

interface SalaryLaunchDialogProps {
  open: boolean;
  isSaving: boolean;
  description: string;
  accountId: string;
  categoryId: string;
  paymentDate: string;
  netPay: number;
  accounts: BankAccount[];
  incomeCategories: Category[];
  onClose: () => void;
  onConfirm: () => void;
  onDescriptionChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPaymentDateChange: (value: string) => void;
}

export function SalaryLaunchDialog({
  open,
  isSaving,
  description,
  accountId,
  categoryId,
  paymentDate,
  netPay,
  accounts,
  incomeCategories,
  onClose,
  onConfirm,
  onDescriptionChange,
  onAccountChange,
  onCategoryChange,
  onPaymentDateChange,
}: SalaryLaunchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar salário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="salary-launch-description">Descrição</Label>
            <Input
              id="salary-launch-description"
              className="w-full"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-launch-account">Conta</Label>
              <SelectMenu
                id="salary-launch-account"
                value={accountId}
                onChange={onAccountChange}
                placeholder="Selecione"
                options={accounts.map((account) => ({
                  value: account.bankAccount,
                  label: account.name,
                }))}
              />
            </div>
            <div>
              <Label htmlFor="salary-launch-date">Data</Label>
              <Input
                id="salary-launch-date"
                type="date"
                className="w-full"
                value={paymentDate}
                onChange={(event) => onPaymentDateChange(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary-launch-category">Categoria</Label>
              <SelectMenu
                id="salary-launch-category"
                value={categoryId}
                onChange={onCategoryChange}
                placeholder="Selecione"
                options={incomeCategories.map((category) => ({
                  value: category.category,
                  label: category.name,
                }))}
              />
            </div>
            <div>
              <Label htmlFor="salary-launch-amount">Valor líquido</Label>
              <Input
                id="salary-launch-amount"
                className="w-full"
                value={formatCurrency(netPay)}
                disabled
              />
            </div>
          </div>

          <p className="text-xs text-text-muted">
            A transação será criada como receita pendente, vinculada à conta e categoria selecionadas.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} loading={isSaving}>
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
