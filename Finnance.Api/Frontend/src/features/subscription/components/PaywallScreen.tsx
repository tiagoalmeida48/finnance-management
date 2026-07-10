import { CreditCard, Gem, LogOut, RefreshCw, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui';
import { SubscriptionStatusId } from '@/config/constants';
import type { SubscriptionStatus } from '../types/subscription.types';

interface PaywallScreenProps {
  status: SubscriptionStatus | null;
  isRechecking: boolean;
  onRecheck: () => void;
}

const highlights = [
  { icon: Wallet, text: 'Contas, cartões e faturas num só lugar' },
  { icon: Sparkles, text: 'Salário, recorrências e acompanhamento de metas' },
  { icon: ShieldCheck, text: 'Seus dados protegidos, cancele quando quiser' },
];

function headline(status: SubscriptionStatus | null) {
  switch (status?.subscriptionStatus) {
    case SubscriptionStatusId.LATE:
      return {
        title: 'Pagamento em atraso',
        text: 'Identificamos uma pendência na sua assinatura. Regularize o pagamento para continuar usando o Finnance.',
        cta: 'Regularizar pagamento',
      };
    case SubscriptionStatusId.CANCELED:
      return {
        title: 'Assinatura encerrada',
        text: 'Sua assinatura foi cancelada e o período pago chegou ao fim. Reative para voltar a usar o Finnance.',
        cta: 'Reativar assinatura',
      };
    case SubscriptionStatusId.REFUNDED:
    case SubscriptionStatusId.CHARGEBACK:
      return {
        title: 'Assinatura encerrada',
        text: 'O pagamento desta assinatura foi estornado. Assine novamente para voltar a usar o Finnance.',
        cta: 'Assinar novamente',
      };
    default:
      return {
        title: 'Desbloqueie o Finnance completo',
        text: 'Sua conta está pronta, falta só a assinatura. Assine para acompanhar contas, cartões, salário e metas sem limites.',
        cta: 'Assinar agora',
      };
  }
}

export function PaywallScreen({ status, isRechecking, onRecheck }: PaywallScreenProps) {
  const { user, logout } = useAuth();
  const content = headline(status);
  const checkoutUrl = status?.checkoutUrl ?? '';

  const openCheckout = () => {
    window.open(checkoutUrl, '_blank', 'noopener');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-6">
      <div className="absolute inset-0 ring-grid opacity-40" />
      <div className="animate-float-slow pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-transfer/15 blur-3xl" />

      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-primary text-bg shadow-glow">
            <Gem size={22} strokeWidth={2.4} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient-gold">Finnance</span>
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-text">
          {content.title}
        </h1>
        <p className="mt-3 text-text-muted">{content.text}</p>

        <ul className="mt-8 space-y-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon size={16} />
                </div>
                <p className="text-sm text-text-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 space-y-3">
          {checkoutUrl ? (
            <Button size="lg" className="w-full" onClick={openCheckout}>
              <CreditCard size={16} />
              {content.cta}
            </Button>
          ) : (
            <p className="rounded-md border border-border bg-surface-2 p-3 text-center text-sm text-text-muted">
              Link de assinatura indisponível no momento. Fale com o suporte.
            </p>
          )}

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            loading={isRechecking}
            onClick={onRecheck}
          >
            <RefreshCw size={16} />
            Já assinei, verificar novamente
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm text-text-muted">
          <span className="truncate">{user?.email}</span>
          <button
            type="button"
            onClick={logout}
            className="flex shrink-0 items-center gap-1.5 hover:text-text"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
