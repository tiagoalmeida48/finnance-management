export interface RecentTransaction {
  transaction: number;
  transactionType: number;
  amount: number | null;
  paymentDate: string | null;
  description: string;
  category: number | null;
  paid: boolean;
}
