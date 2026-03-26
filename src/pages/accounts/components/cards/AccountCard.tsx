import { createElement } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { IconButton } from '@/shared/components/ui/icon-button';
import { Button } from '@/shared/components/ui/button';
import { MoreVertical, CreditCard } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';
import { Account } from '@/shared/interfaces/account.interface';
import { CreditCard as CardInterface } from '@/shared/interfaces/credit-card.interface';
import { useApplyElementStyles } from '@/shared/hooks/useApplyElementStyles';
import { getAccountTypeIcon, getAccountTypeLabel } from '@/shared/constants/accountTypes';
import { Row } from '@/shared/components/layout/Row';
import { Stack } from '@/shared/components/layout/Stack';
import { Divider } from '@/shared/components/ui/Divider';
import { Text } from '@/shared/components/ui/Text';
import { Heading } from '@/shared/components/ui/Heading';
import { messages } from '@/shared/i18n/messages';

interface AccountCardProps {
  account: Account;
  handleOpenMenu: (event: React.MouseEvent<HTMLElement>, account: Account) => void;
  cards: CardInterface[] | undefined;
  navigate: NavigateFunction;
}

import { formatCurrency } from '@/shared/utils/currency';

export function AccountCard({ account, handleOpenMenu, cards, navigate }: AccountCardProps) {
  const accountCardMessages = messages.accounts.card;
  const iconBgRef = useApplyElementStyles<HTMLDivElement>({
    'background-color': `${account.color || 'var(--color-primary)'}1A`,
  });
  const balanceColorRef = useApplyElementStyles<HTMLParagraphElement>({
    color: account.current_balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
  });

  const accountTypeIcon = getAccountTypeIcon(account.type);
  const linkedCard = cards?.find((card) => card.bank_account_id === account.id);

  return (
    <Card className="h-full overflow-visible">
      <CardContent className="p-6">
        <Row className="items-start justify-between">
          <Stack ref={iconBgRef} className="mb-2 rounded-lg p-1.5">
            {createElement(accountTypeIcon, {
              size: 24,
              color: account.color || 'var(--color-primary)',
            })}
          </Stack>
          <IconButton size="small" onClick={(e) => handleOpenMenu(e, account)}>
            <MoreVertical size={18} />
          </IconButton>
        </Row>
        <Heading level={3} className="mb-0.5 text-lg font-bold">
          {account.name}
        </Heading>
        <Text className="text-xs font-semibold uppercase tracking-[1px] text-white/70">
          {getAccountTypeLabel(account.type)}
        </Text>

        <Divider className="my-2 border-white/[0.05]" />

        <Stack className="gap-1.5">
          <Stack>
            <Text className="block text-xs text-white/70">
              {accountCardMessages.initialBalanceLabel}
            </Text>
            <Text className="text-base font-semibold">
              {formatCurrency(account.initial_balance)}
            </Text>
          </Stack>

          <Stack>
            <Text className="block text-xs text-white/70">
              {accountCardMessages.currentBalanceLabel}
            </Text>
            <Text ref={balanceColorRef} className="text-xl font-bold">
              {formatCurrency(account.current_balance)}
            </Text>
          </Stack>
        </Stack>

        {linkedCard ? (
          <Stack className="mt-2 border-t border-white/[0.03] pt-2">
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<CreditCard size={14} />}
              onClick={() => navigate(`/cards/${linkedCard.id}`)}
              className="border-[var(--color-primary)4D] text-[0.7rem] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--overlay-primary-05)]"
            >
              {accountCardMessages.linkedCardButton}
            </Button>
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}
