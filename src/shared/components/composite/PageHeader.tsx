import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
<<<<<<< HEAD
    <div className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`.trim()}>
      <div className="min-w-0">
        <h1 className="mb-0.5 text-2xl font-bold sm:text-3xl [font-family:var(--font-heading)] truncate">{title}</h1>
        {subtitle ? <div className="text-sm text-[var(--color-text-secondary)] sm:text-base">{subtitle}</div> : null}
=======
    <div className={`mb-4 flex items-center justify-between gap-2 ${className ?? ''}`.trim()}>
      <div>
        <h1 className="mb-1 text-3xl font-bold [font-family:var(--font-heading)]">{title}</h1>
        {subtitle ? <div className="text-[var(--color-text-secondary)]">{subtitle}</div> : null}
>>>>>>> finnance-management/main
      </div>
      {actions && <div className="flex shrink-0 items-center">{actions}</div>}
    </div>
  );
}
