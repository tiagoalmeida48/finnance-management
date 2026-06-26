import { useMemo } from 'react';
import { useAccountsPageLogic } from '@/features/accounts';
import { useCardsPageLogic } from '@/features/cards';
import type { BankAccount } from '@/features/accounts';
import type { CreditCard } from '@/features/cards';

export interface AccountGroup {
  account: BankAccount;
  accountTypeName?: string;
  cards: CreditCard[];
}

export function useFinancesPageLogic() {
  const accounts = useAccountsPageLogic();
  const cards = useCardsPageLogic();

  const { groups, orphanCards } = useMemo(() => {
    const accountIds = new Set(accounts.accounts.map((account) => account.bankAccount));
    const grouped: AccountGroup[] = accounts.accounts.map((account) => ({
      account,
      accountTypeName: accounts.accountTypeNames.get(account.accountType),
      cards: cards.cards.filter((card) => card.bankAccount === account.bankAccount),
    }));
    const orphans = cards.cards.filter((card) => !accountIds.has(card.bankAccount));
    return { groups: grouped, orphanCards: orphans };
  }, [accounts.accounts, accounts.accountTypeNames, cards.cards]);

  return { accounts, cards, groups, orphanCards };
}
