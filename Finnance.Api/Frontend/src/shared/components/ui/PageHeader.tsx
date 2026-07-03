import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            {Icon && <Icon size={14} strokeWidth={2.1} />}
            <span className="mono-label text-[11px]">{eyebrow ?? 'Finnance'}</span>
          </div>
          <h1 className="mt-2.5 text-[32px] font-semibold leading-[1.02] text-text sm:text-[38px]">
            {title}
          </h1>
          {description && <p className="mt-2.5 max-w-2xl text-sm text-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 pb-1.5">{actions}</div>}
      </div>
      <div className="hairline-gold mt-5 w-full" />
    </header>
  );
}
