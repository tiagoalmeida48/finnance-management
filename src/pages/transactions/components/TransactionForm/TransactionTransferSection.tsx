import type { Account, Transaction } from '@/shared/interfaces';
import type { TransactionFormValues } from '@/pages/transactions/hooks/useTransactionFormLogic';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CustomSelect } from '@/shared/components/ui/custom-select';
import { getAccountTypeIcon } from '@/shared/constants/accountTypes';
import { Label } from '@/shared/components/ui/label';
import { Controller } from 'react-hook-form';
import { TransactionDateField } from './TransactionDateField';
import type { Control } from 'react-hook-form';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { Text } from '@/shared/components/ui/Text';

interface TransactionTransferSectionProps {
  isMobile: boolean;
  transaction?: Transaction;
  accounts: Account[];
  errors: FieldErrors<TransactionFormValues>;
  register: UseFormRegister<TransactionFormValues>;
  control: Control<TransactionFormValues>;
}

export function TransactionTransferSection({
  isMobile,
  accounts,
  errors,
  control,
}: TransactionTransferSectionProps) {
  const transferGridClass = isMobile ? 'grid-cols-1' : 'grid-cols-3';

  const accountOptions = accounts.map((account) => {
    const Icon = getAccountTypeIcon(account.type);
    return {
      value: account.id,
      label: account.name,
      icon: <Icon size={16} />,
      color: account.color,
    };
  });

  return (
    <Container unstyled className="mb-2">
      <Text className="mb-1.5 border-b border-white/[0.04] pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
        {messages.transactions.form.transfer.sectionTitle}
      </Text>
      <Container unstyled className={`grid gap-1.5 ${transferGridClass}`}>
        <Container unstyled>
          <Label className="mb-0.75 block text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
            {messages.transactions.form.transfer.originLabel}
          </Label>
          <Controller
            name="account_id"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ''}
                onChange={field.onChange}
                options={accountOptions}
                placeholder={messages.transactions.form.transfer.selectWithDotsPlaceholder}
                error={!!errors.account_id}
              />
            )}
          />
        </Container>
        <Container unstyled>
          <Label className="mb-0.75 block text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
            {messages.transactions.form.transfer.destinationLabel}
          </Label>
          <Controller
            name="to_account_id"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ''}
                onChange={field.onChange}
                options={accountOptions.filter(
                  (acc) => acc.value !== control._formValues.account_id,
                )}
                placeholder={messages.transactions.form.transfer.selectWithDotsPlaceholder}
                error={!!errors.to_account_id}
              />
            )}
          />
        </Container>
        <Container unstyled>
          <Label className="mb-0.75 block text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
            {messages.transactions.form.transfer.dateLabel}
          </Label>
          <TransactionDateField control={control} />
        </Container>
      </Container>
    </Container>
  );
}
