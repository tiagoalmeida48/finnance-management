import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import type { Account, Category } from '@/shared/interfaces';
import { formatCurrency } from '../salarySimulator.helpers';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';

interface SalaryLaunchDialogProps {
  open: boolean;
  isSaving: boolean;
  description: string;
  accountId: string;
  categoryId: string;
  paymentDate: string;
  netPay: number;
  accounts: Account[];
  incomeCategories: Category[];
  onClose: () => void;
  onConfirm: () => void;
  onDescriptionChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPaymentDateChange: (value: string) => void;
}

const labelClass = 'mb-1 block text-xs text-[var(--color-text-secondary)]';

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
  const dialogMessages = messages.salarySimulator.launchDialog;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{dialogMessages.title}</DialogTitle>
      <DialogContent>
        <Container unstyled className="mt-1 flex flex-col gap-2">
          <Container unstyled>
            <label className={labelClass}>{dialogMessages.labels.description}</label>
            <Input
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </Container>

          <Container unstyled className="grid gap-2 sm:grid-cols-2">
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.account}</label>
              <Select value={accountId} onChange={(event) => onAccountChange(event.target.value)}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </Container>
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.date}</label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(event) => onPaymentDateChange(event.target.value)}
              />
            </Container>
          </Container>

          <Container unstyled className="grid gap-2 sm:grid-cols-2">
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.type}</label>
              <Input value={dialogMessages.typeIncome} disabled />
            </Container>
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.paymentMethod}</label>
              <Input value={dialogMessages.paymentMethodDebit} disabled />
            </Container>
          </Container>

          <Container unstyled className="grid gap-2 sm:grid-cols-2">
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.category}</label>
              <Select
                value={categoryId}
                onChange={(event) => onCategoryChange(event.target.value)}
                disabled
              >
                {incomeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Container>
            <Container unstyled>
              <label className={labelClass}>{dialogMessages.labels.amount}</label>
              <Input value={formatCurrency(netPay)} disabled />
            </Container>
          </Container>
        </Container>
      </DialogContent>
      <DialogActions className="px-6 pb-5">
        <Button onClick={onClose} disabled={isSaving} variant="ghost">
          {messages.common.actions.cancel}
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isSaving}>
          {isSaving ? dialogMessages.saving : dialogMessages.continue}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
