export interface Transaction {
  transaction: number;
  transactionType: number;
  paymentMethod: number | null;
  amount: number | null;
  paymentDate: string | null;
  purchaseDate: string | null;
  description: string;
  account: number | null;
  toAccount: number | null;
  card: number | null;
  category: number | null;
  invoice: number | null;
  installmentGroup: number | null;
  installmentNumber: number | null;
  recurringGroup: number | null;
  totalInstallments?: number | null;
  fixed: boolean;
  paid: boolean;
  notes: string;
  active: boolean;
  created: string;
  updated: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  pending: number;
}

export interface TransactionGroup {
  groupId: number;
  type: 'installment' | 'recurring';
  totalInstallments: number;
  totalItemsCount: number;
  paidItemsCount: number;
  paidItemsPercent: number;
  totalAmount: number;
  paidAmount: number;
  isAllPaid: boolean;
  category: number | null;
  description: string;
  mainTransaction: Transaction;
  items: Transaction[];
}

export interface TransactionListItem {
  isGroup: boolean;
  group: TransactionGroup | null;
  transaction: Transaction | null;
}

export interface TransactionListResult {
  items: TransactionListItem[];
  totalLines: number;
  hasNextPage: boolean;
}

export interface TransactionFilter {
  account: number;
  category: number;
  card: number;
  paymentMethod: number;
  transactionType: number;
  search: string;
  hideCreditCards: boolean;
  onlyInstallments: boolean;
  startDate: string | null;
  endDate: string | null;
  isPaid: boolean | null;
  sortAsc: boolean;
  limit: number;
  offset: number;
}

export interface TransactionCreateInput {
  transactionType: number;
  amount: number;
  paymentDate: string | null;
  purchaseDate: string | null;
  description: string;
  account: number | null;
  toAccount: number | null;
  card: number | null;
  category: number | null;
  paymentMethod: number | null;
  notes: string;
  isPaid: boolean;
  isFixed: boolean;
  isInstallment: boolean;
  totalInstallments: number;
  repeatCount: number;
  installmentAmounts: number[] | null;
  recurringGroup: number | null;
}

export interface TransactionUpdateInput {
  transaction: number;
  transactionType?: number | null;
  amount?: number | null;
  paymentDate?: string | null;
  purchaseDate?: string | null;
  description?: string;
  paid?: boolean | null;
  fixed?: boolean | null;
  account?: number | null;
  toAccount?: number | null;
  category?: number | null;
  card?: number | null;
  paymentMethod?: number | null;
  notes?: string;
  clearPurchaseDate?: boolean;
  clearAccount?: boolean;
  clearToAccount?: boolean;
  clearCategory?: boolean;
  clearCard?: boolean;
  clearPaymentMethod?: boolean;
}

export interface CreateResult {
  id: number;
  groupId: number | null;
}

export interface BatchPayInput {
  ids: number[];
  account: number;
  paymentDate: string;
}

export interface BatchChangeDayInput {
  ids: number[];
  day: number;
}

export interface UpdateGroupInput {
  groupId: number;
  type: string;
  amount?: number | null;
  paymentDate?: string | null;
  purchaseDate?: string | null;
  clearPurchaseDate?: boolean;
  description?: string;
  transactionType?: number | null;
  category?: number | null;
  paymentMethod?: number | null;
  account?: number | null;
  toAccount?: number | null;
  card?: number | null;
  notes?: string;
  clearAccount?: boolean;
  clearToAccount?: boolean;
  clearCard?: boolean;
}

export interface DeleteGroupInput {
  groupId: number;
  type: string;
}

export interface BankAccountLookup {
  bankAccount: number;
  accountType: number;
  name: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  notes: string;
  active: boolean;
}

export interface CategoryLookup {
  category: number;
  categoryType: number;
  name: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface CreditCardLookup {
  creditCard: number;
  bankAccount: number;
  name: string;
  color: string;
  creditLimit: number;
  notes: string;
  active: boolean;
}

export interface PaymentMethodLookup {
  paymentMethod: number;
  name: string;
  active: boolean;
}
