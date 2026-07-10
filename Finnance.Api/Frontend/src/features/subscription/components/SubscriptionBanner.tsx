import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, X } from 'lucide-react';
import type { SubscriptionStatus } from '../types/subscription.types';

interface SubscriptionBannerProps {
  kind: 'late' | 'canceled';
  status: SubscriptionStatus;
}

export function SubscriptionBanner({ kind, status }: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const until = status.nextPayment ? format(new Date(status.nextPayment), 'dd/MM/yyyy') : null;
  const message =
    kind === 'late'
      ? 'Pagamento da assinatura em atraso. Regularize para não perder o acesso.'
      : until
        ? `Assinatura cancelada. Seu acesso permanece até ${until}.`
        : 'Assinatura cancelada. Seu acesso será encerrado em breve.';

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-surface-2 px-4 py-3 shadow-2xl">
        <AlertTriangle size={18} className="shrink-0 text-primary" />
        <p className="flex-1 text-sm text-text">{message}</p>
        {status.checkoutUrl && (
          <a
            href={status.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {kind === 'late' ? 'Regularizar' : 'Reativar'}
          </a>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-text-muted hover:text-text"
          aria-label="Fechar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
