import { Text } from '@/shared/components/ui/Text';
import type { Account } from '@/shared/interfaces/account.interface';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';
import { CustomSelect } from '@/shared/components/ui/custom-select';
import { getAccountTypeIcon } from '@/shared/constants/accountTypes';

interface CardLinkedAccountSelectProps {
  accounts: Account[] | undefined;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
}

const linkedAccountMessages = messages.cards.linkedAccountSelect;

export function CardLinkedAccountSelect({
  accounts,
  value,
  onChange,
  errorMessage,
}: CardLinkedAccountSelectProps) {
  const accountOptions = (accounts || []).map((account) => {
    const Icon = getAccountTypeIcon(account.type);
    return {
      value: account.id,
      label: account.name,
      icon: <Icon size={16} />,
      color: account.color,
    };
  });

  return (
    <Container unstyled>
      <CustomSelect
        value={value}
        onChange={onChange}
        options={accountOptions}
        placeholder={linkedAccountMessages.placeholder}
        error={!!errorMessage}
      />
      {errorMessage ? (
        <Text className="mt-1 text-xs text-[var(--color-error)]">{errorMessage}</Text>
      ) : null}
    </Container>
  );
}
