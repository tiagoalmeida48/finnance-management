import type { LucideIcon } from 'lucide-react';

interface SidebarMenuItemProps {
  label: string;
  icon: LucideIcon;
  path: string;
  open: boolean;
  isActive: boolean;
  onClick: (path: string) => void;
}

export function SidebarMenuItem({
  label,
  icon: Icon,
  path,
  open,
  isActive,
  onClick,
}: SidebarMenuItemProps) {
  return (
    <li>
      <button
        type="button"
        title={!open ? label : undefined}
        onClick={() => onClick(path)}
        className={`relative flex h-11 min-h-11 w-full cursor-pointer items-center justify-start rounded-xl px-1.5 py-0 transition-all duration-200 hover:bg-white/[0.04] ${
          isActive
            ? 'bg-[var(--color-accentGlow)] text-[var(--color-accent)]'
            : 'bg-transparent text-[var(--color-text-muted)]'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--color-accent)]" />
        )}
        <span className="flex min-w-9 justify-center leading-none">
          <Icon size={20} />
        </span>
        <span
          className={`whitespace-nowrap text-[13.5px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'} ${
            isActive ? 'font-semibold' : 'font-medium'
          }`}
        >
          {label}
        </span>
      </button>
    </li>
  );
}
