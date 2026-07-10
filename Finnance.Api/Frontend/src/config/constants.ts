export const AUTH_TOKEN_KEY = 'finnance.auth.token';

export const TransactionTypeId = {
  INCOME: 1,
  EXPENSE: 2,
  TRANSFER: 3,
} as const;

export const CategoryTypeId = {
  INCOME: 1,
  EXPENSE: 2,
} as const;

export const PaymentMethodId = {
  CREDIT: 1,
  DEBIT: 2,
  PIX: 3,
  CASH: 4,
  BILL_PAYMENT: 5,
  TRANSFER: 6,
  OTHER: 7,
} as const;

export const InvoiceStatusId = {
  OPEN: 1,
  CLOSED: 2,
  PARTIAL: 3,
  PAID: 4,
  OVERDUE: 5,
} as const;

export const SubscriptionStatusId = {
  ACTIVE: 1,
  LATE: 2,
  CANCELED: 3,
  REFUNDED: 4,
  CHARGEBACK: 5,
} as const;
