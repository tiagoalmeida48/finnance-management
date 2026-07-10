import { useAuth } from '@/features/auth';
import { SubscriptionStatusId } from '@/config/constants';
import { useSubscriptionStatus } from './useSubscriptionStatus';

export function usePaywall() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const query = useSubscriptionStatus(!!user && !isAdmin);

  const status = query.data ?? null;
  const isChecking = !isAdmin && query.isLoading;
  const showPaywall = !isAdmin && !!status && !status.hasActiveAccess;

  const bannerKind =
    !isAdmin && status?.hasActiveAccess
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
