import { Search } from 'lucide-react';
import { colors } from '@/shared/theme';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';

interface TransactionsToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (value: string) => void;
  accountFilter: string;
  setAccountFilter: (value: string) => void;
  cardFilter: string;
  setCardFilter: (value: string) => void;
  categories?: { id: string; name: string }[];
  accounts?: { id: string; name: string }[];
  cards?: { id: string; name: string }[];
}

export function TransactionsToolbar({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  accountFilter,
  setAccountFilter,
  cardFilter,
  setCardFilter,
  categories,
  accounts,
  cards,
}: TransactionsToolbarProps) {
  return (
    <Container
      unstyled
      className="relative z-10 mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bgSecondary)]/95 p-3 shadow-lg shadow-black/40 backdrop-blur-md md:flex-row md:items-center md:gap-4 md:px-4 md:py-3"
    >
      {/* Search Bar */}
      <Container unstyled className="relative flex-1">
        <Search
          size={16}
          color={colors.textMuted}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
        <Input
          className="h-10 w-full rounded-xl border-white/10 bg-black/40 pl-10 text-[13px] text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:bg-black/60 md:h-9 md:text-[12px]"
          placeholder={messages.transactions.tableHeader.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Container>

      {/* Filters Grid */}
      <Container
        unstyled
        className="grid grid-cols-2 gap-2 md:flex md:w-auto md:shrink-0 md:flex-row md:gap-3"
      >
        <Select
          className={`h-10 min-w-[0] rounded-xl border-white/10 bg-black/40 text-[13px] md:h-9 md:min-w-[140px] md:text-[12px] ${
            categoryFilter !== 'all' ? 'text-[var(--color-accent)]' : 'text-white/60'
          }`}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">{messages.transactions.tableHeader.allCategories}</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          className={`h-10 min-w-[0] rounded-xl border-white/10 bg-black/40 text-[13px] md:h-9 md:min-w-[140px] md:text-[12px] ${
            paymentMethodFilter !== 'all' ? 'text-[var(--color-accent)]' : 'text-white/60'
          }`}
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
        >
          <option value="all">{messages.transactions.tableHeader.allPayments}</option>
          <option value="credit">{messages.transactions.form.payment.methodCredit}</option>
          <option value="debit">{messages.transactions.form.payment.methodDebit}</option>
          <option value="pix">{messages.transactions.form.payment.methodPix}</option>
          <option value="money">{messages.transactions.form.payment.methodMoney}</option>
          <option value="bill_payment">
            {messages.transactions.form.payment.methodBillPayment}
          </option>
        </Select>

        <Select
          className={`h-10 min-w-[0] rounded-xl border-white/10 bg-black/40 text-[13px] md:h-9 md:min-w-[140px] md:text-[12px] ${
            accountFilter !== 'all' ? 'text-[var(--color-accent)]' : 'text-white/60'
          }`}
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
        >
          <option value="all">{messages.transactions.tableHeader.allAccounts}</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>

        <Select
          className={`h-10 min-w-[0] rounded-xl border-white/10 bg-black/40 text-[13px] md:h-9 md:min-w-[140px] md:text-[12px] ${
            cardFilter !== 'all' ? 'text-[var(--color-accent)]' : 'text-white/60'
          }`}
          value={cardFilter}
          onChange={(e) => setCardFilter(e.target.value)}
        >
          <option value="all">{messages.transactions.tableHeader.allCards}</option>
          {cards?.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </Select>
      </Container>
    </Container>
  );
}
