import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { PageHeader, SegmentedControl } from '@/shared/components/ui';
import { AccountsSection } from '@/features/accounts';
import { CardsSection } from '@/features/cards';

type FinancesTab = 'accounts' | 'cards';

const tabOptions: { value: FinancesTab; label: string }[] = [
  { value: 'accounts', label: 'Contas' },
  { value: 'cards', label: 'Cartões' },
];

export function FinancesPage() {
  const [tab, setTab] = useState<FinancesTab>('accounts');

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title="Contas e Cartões"
        description="Gerencie suas contas bancárias e os cartões de crédito."
        actions={<SegmentedControl value={tab} onChange={setTab} options={tabOptions} />}
      />

      {tab === 'accounts' ? <AccountsSection /> : <CardsSection />}
    </div>
  );
}
