import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 ring-grid opacity-60" />
      <div className="animate-float-slow pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-transfer/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface/80 p-8 shadow-elevated backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary text-bg shadow-glow">
            <Gem size={20} strokeWidth={2.4} />
          </div>
          <span className="text-lg font-bold tracking-tight text-gradient-gold">Finnance</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p> : null}

        <div className="mt-7">{children}</div>

        {footer ? <div className="mt-6 text-center text-sm text-text-muted">{footer}</div> : null}
        <p className="mt-6 text-center text-xs text-text-muted">
          <Link to="/login" className="hover:text-text">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
