export interface BankAccount {
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

export interface AccountType {
  accountType: number;
  name: string;
}

export interface CreateAccountInput {
  name: string;
  accountType: number;
  initialBalance: number;
  color: string;
  icon: string;
  notes: string;
}

export interface UpdateAccountInput {
  bankAccount: number;
  name: string;
  accountType: number;
  color: string;
  icon: string;
  notes: string;
  active: boolean;
}
