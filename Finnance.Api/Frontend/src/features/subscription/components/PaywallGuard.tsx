import { Spinner } from '@/shared/components/ui';
import { usePaywall } from '../hooks/usePaywall';
import { PaywallScreen } from './PaywallScreen';
import { SubscriptionBanner } from './SubscriptionBanner';

interface PaywallGuardProps {
  children: React.ReactNode;
}

export function PaywallGuard({ children }: PaywallGuardProps) {
  const { status, isChecking, showPaywall, bannerKind, isRechecking, recheck } = usePaywall();

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (showPaywall) {
    return <PaywallScreen status={status} isRechecking={isRechecking} onRecheck={recheck} />;
  }

  return (
    <>
      {bannerKind && status && <SubscriptionBanner kind={bannerKind} status={status} />}
      {children}
    </>
  );
}
