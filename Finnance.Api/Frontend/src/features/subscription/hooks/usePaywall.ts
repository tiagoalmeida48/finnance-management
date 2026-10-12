import { useAuth } from '@/features/auth';
import { SubscriptionStatusId } from '@/config/constants';
import { useSubscriptionStatus } from './useSubscriptionStatus';

export function usePaywall() {
  const { user } = useAuth();
  const query = useSubscriptionStatus(!!user);

  const status = query.data ?? null;
  const isChecking = !!user && query.isLoading;
  const showPaywall = !!status && !status.hasActiveAccess;

  const bannerKind = status?.hasActiveAccess
    ? status.subscriptionStatus === SubscriptionStatusId.LATE
      ? ('late' as const)
      : status.subscriptionStatus === SubscriptionStatusId.CANCELED
        ? ('canceled' as const)
        : null
    : null;

  return {
    status,
    isChecking,
    showPaywall,
    bannerKind,
    isRechecking: query.isFetching,
    recheck: query.refetch,
  };
}
