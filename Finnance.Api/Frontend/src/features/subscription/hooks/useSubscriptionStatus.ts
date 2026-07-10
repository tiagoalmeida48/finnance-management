import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';

export const subscriptionKeys = {
  me: ['subscription', 'me'] as const,
};

export function useSubscriptionStatus(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.me,
    queryFn: subscriptionService.me,
    enabled,
    staleTime: 60_000,
  });
}
