import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="hairline-top flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-surface-gradient text-primary">
            <Icon size={22} strokeWidth={1.75} />
          </div>
        )}
        <div>
          <h1 className="text-[28px] font-semibold leading-none text-text">{title}</h1>
          {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
