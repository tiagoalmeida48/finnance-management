export interface SubscriptionStatus {
  hasActiveAccess: boolean;
  subscriptionStatus: number;
  planName: string | null;
  planFrequency: string | null;
  startDate: string | null;
  nextPayment: string | null;
  checkoutUrl: string;
}
