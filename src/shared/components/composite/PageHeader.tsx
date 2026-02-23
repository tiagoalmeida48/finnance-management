import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={`mb-4 flex items-center justify-between gap-2 ${className ?? ''}`.trim()}>
            <div>
                <h1 className="mb-1 text-3xl font-bold [font-family:var(--font-heading)]">{title}</h1>
                {subtitle ? <div className="text-[var(--color-text-secondary)]">{subtitle}</div> : null}
            </div>
            {actions}
        </div>
    );
}
