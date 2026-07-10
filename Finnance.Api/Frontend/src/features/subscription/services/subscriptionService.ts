import { apiClient } from '@/config/http';
import type { SubscriptionStatus } from '../types/subscription.types';

export const subscriptionService = {
  me: async (): Promise<SubscriptionStatus> => {
    return apiClient.get<SubscriptionStatus>('/subscription/me');
  },
};
