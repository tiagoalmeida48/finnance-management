export interface CreditCard {
  creditCard: number;
  bankAccount: number;
  name: string;
  color: string;
  creditLimit: number;
  notes: string;
  active: boolean;
  created: string;
  updated: string;
}

export interface CreditCardStats {
  creditCard: number;
  creditLimit: number;
  usage: number;
  currentInvoice: number;
  availableLimit: number;
}

export interface CreditCardCreateInput {
  bankAccount: number;
  name: string;
  color: string;
  creditLimit: number;
  notes: string;
}

export interface CreditCardUpdateInput {
  creditCard: number;
  bankAccount: number;
  name: string;
  color: string;
  creditLimit: number;
  notes: string;
  active: boolean;
}

export interface StatementCycle {
  creditCardStatementCycle: number;
  card: number;
  dateStart: string;
  dateEnd: string;
  closingDay: number;
  dueDay: number;
  notes: string;
  active: boolean;
  created: string;
  updated: string;
}

export interface StatementCycleCreateInput {
  card: number;
  dateStart: string;
  closingDay: number;
  dueDay: number;
  notes: string;
}

export interface CreditCardInvoice {
  creditCardInvoice: number;
  card: number;
  invoiceStatus: number;
  monthKey: string;
  closingDate: string | null;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  closedAt: string | null;
  paidAt: string | null;
  active: boolean;
}

export interface BankAccountOption {
  bankAccount: number;
  accountType: number;
  name: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  notes: string;
  active: boolean;
  created: string;
  updated: string;
}
