import { Controller } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { ColorPickerField } from '@/shared/components/forms/ColorPickerField';
import { CurrencyInputField } from '@/shared/components/forms/CurrencyInputField';
import { FormField } from '@/shared/components/forms/FormField';
import { FormDialog } from '@/shared/components/composite/FormDialog';
import { PrefixedInputField } from '@/shared/components/forms/PrefixedInputField';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { TextareaField } from '@/shared/components/forms/TextareaField';
import { ACCOUNT_TYPE_OPTIONS } from '@/shared/constants/accountTypes';
import { useAccountFormModalLogic } from '@/pages/accounts/hooks/useAccountFormModalLogic';
import { Account } from '@/shared/interfaces/account.interface';
import { messages } from '@/shared/i18n/messages';

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  account?: Account;
}

export function AccountFormModal({ open, onClose, account }: AccountFormModalProps) {
  const accountFormMessages = messages.accounts.form;
  const commonMessages = messages.common;

  const { control, register, handleSubmit, errors, onSubmit, isSaving, getFieldClass } =
    useAccountFormModalLogic({
      open,
      onClose,
      account,
    });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      title={account ? accountFormMessages.modal.editTitle : accountFormMessages.modal.createTitle}
      onSubmit={handleSubmit(onSubmit)}
      actionsClassName="p-3 pt-0"
      actions={
        <>
          <Button type="button" variant="outlined" onClick={onClose}>
            {commonMessages.actions.cancel}
          </Button>
          <Button variant="contained" type="submit" disabled={isSaving}>
            {accountFormMessages.actions.save}
          </Button>
        </>
      }
    >
      <Stack className="mt-1 gap-3">
        <FormField
          htmlFor="account-name"
          label={accountFormMessages.fields.nameLabel}
          required
          errorMessage={errors.name?.message}
        >
          <Input
            id="account-name"
            placeholder={accountFormMessages.fields.namePlaceholder}
            className={getFieldClass(Boolean(errors.name))}
            {...register('name')}
          />
        </FormField>
        <FormField
          htmlFor="account-type"
          label={accountFormMessages.fields.typeLabel}
          required
          errorMessage={errors.type?.message}
        >
          <Select
            id="account-type"
            className={getFieldClass(Boolean(errors.type))}
            {...register('type')}
          >
            {ACCOUNT_TYPE_OPTIONS.map((typeOption) => (
              <option key={typeOption.value} value={typeOption.value}>
                {typeOption.label}
              </option>
            ))}
          </Select>
        </FormField>
        <Row className="gap-2">
          <FormField
            className="flex-1"
            htmlFor="account-initial"
            label={accountFormMessages.fields.initialBalanceLabel}
            required
            helperText={accountFormMessages.fields.initialBalanceHelper}
            errorMessage={errors.initial_balance?.message}
          >
            <Controller
              name="initial_balance"
              control={control}
              render={({ field }) => (
                <CurrencyInputField
                  id="account-initial"
                  placeholder={accountFormMessages.fields.initialBalancePlaceholder}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  className={getFieldClass(Boolean(errors.initial_balance))}
                />
              )}
            />
          </FormField>
          {account ? (
            <FormField
              className="flex-1"
              htmlFor="account-current"
              label={accountFormMessages.fields.currentBalanceLabel}
            >
              <PrefixedInputField
                id="account-current"
                prefix="R$"
                className={getFieldClass(false)}
                type="number"
                step="0.01"
                {...register('current_balance', { valueAsNumber: true })}
              />
            </FormField>
          ) : null}
        </Row>
        <FormField
          htmlFor="account-notes"
          label={accountFormMessages.fields.notesLabel}
          labelSuffix={
            <span className="text-[var(--color-text-muted)]">
              {accountFormMessages.fields.optionalLabel}
            </span>
          }
        >
          <TextareaField
            id="account-notes"
            rows={3}
            placeholder={accountFormMessages.fields.notesPlaceholder}
            {...register('notes')}
          />
        </FormField>
        <FormField
          htmlFor="account-pluggy-id"
          label="Pluggy Item ID"
          labelSuffix={
            <span className="text-[var(--color-text-muted)]">
              {accountFormMessages.fields.optionalLabel}
            </span>
          }
        >
          <Input
            id="account-pluggy-id"
            placeholder="Ex: a2c4f1b0-8e29-4bc5-aa77-..."
            className={getFieldClass(false)}
            {...register('pluggy_account_id')}
          />
        </FormField>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorPickerField
              value={field.value}
              onChange={field.onChange}
              title={accountFormMessages.colorPicker.title}
              description={accountFormMessages.colorPicker.description}
            />
          )}
        />
      </Stack>
    </FormDialog>
  );
}
