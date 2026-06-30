import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Tags,
  TrendingUp,
  CalendarCheck,
  UserRound,
  Users,
  LogOut,
  Gem,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/utils';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, adminOnly: false },
  { label: 'Transações', path: '/transactions', icon: Wallet, adminOnly: false },
  { label: 'Contas e Cartões', path: '/finances', icon: Wallet, adminOnly: false },
  { label: 'Categorias', path: '/categories', icon: Tags, adminOnly: false },
  { label: 'Salário', path: '/salary', icon: TrendingUp, adminOnly: true },
  { label: 'Acompanhamento', path: '/tracking', icon: CalendarCheck, adminOnly: false },
  { label: 'Perfil', path: '/profile', icon: UserRound, adminOnly: false },
  { label: 'Usuários', path: '/users', icon: Users, adminOnly: true },
];

const tooltipClass =
  'pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border-strong bg-surface-3 px-2.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-text shadow-elevated group-hover:block';

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-[width] duration-200',
        collapsed ? 'w-[4.75rem]' : 'w-60',
      )}
    >
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="absolute right-0 top-7 z-30 flex h-7 w-7 translate-x-1/2 items-center justify-center rounded-full border border-border-strong bg-surface-3 text-text-muted shadow-card transition-colors hover:border-primary/50 hover:text-primary"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      )}

      <div className={cn('flex items-center py-5', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary text-bg shadow-glow">
          <Gem size={18} strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-tight text-gradient-gold">Finnance</h1>
        )}
      </div>

      <nav className={cn('flex-1 pb-4', collapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-3')}>
        {!collapsed && (
          <p className="mono-label px-3 pb-2 text-[10px] text-text-muted/60">Menu</p>
        )}
        <div className="space-y-0.5">
          {navigation
            .filter((item) => !item.adminOnly || user?.isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center rounded-md py-2 transition-all',
                    collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                    isActive
                      ? 'bg-gradient-to-r from-primary/12 to-transparent text-primary'
                      : 'text-text-muted hover:bg-surface-2 hover:text-text',
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.75}
                    className="shrink-0 transition-colors"
                  />
                  {!collapsed && (
                    <span className="font-mono text-[0.72rem] uppercase tracking-wider">
                      {item.label}
                    </span>
                  )}
                  {collapsed && <span className={tooltipClass}>{item.label}</span>}
                </Link>
              );
            })}
        </div>
      </nav>

      <div className={cn('space-y-2 border-t border-border', collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          <div className="group relative flex justify-center py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary text-sm font-bold text-bg">
              {(user?.fullName ?? '?').trim().charAt(0).toUpperCase()}
            </div>
            <span className={tooltipClass}>{user?.fullName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary text-sm font-bold text-bg">
              {(user?.fullName ?? '?').trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{user?.fullName}</p>
              <p className="mono-label text-[10px] text-text-muted">
                {user?.isAdmin ? 'Admin' : 'Usuário'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'group relative flex w-full items-center rounded-md py-2 font-mono text-[0.72rem] uppercase tracking-wider text-text-muted transition-colors hover:bg-expense/10 hover:text-expense',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3',
          )}
        >
          <LogOut size={17} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
          {collapsed && <span className={tooltipClass}>Sair</span>}
        </button>
      </div>
    </div>
  );
}
