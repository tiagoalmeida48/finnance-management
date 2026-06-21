export const AUTH_TOKEN_KEY = 'finnance.auth.token';

export const TransactionTypeId = {
  INCOME: 1,
  EXPENSE: 2,
  TRANSFER: 3,
} as const;

export const AccountTypeId = {
  CHECKING: 1,
  SAVINGS: 2,
  WALLET: 3,
  INVESTMENT: 4,
  OTHER: 5,
} as const;

export const CategoryTypeId = {
  INCOME: 1,
  EXPENSE: 2,
} as const;

export const InvoiceStatusId = {
  OPEN: 1,
  PARTIAL: 2,
  PAID: 3,
} as const;

export const RoleId = {
  ADMIN: 1,
  USER: 2,
} as const;
