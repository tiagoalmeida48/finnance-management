import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  Tags,
  Receipt,
  CalendarCheck,
  UserRound,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/utils';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, adminOnly: false },
  { label: 'Transações', path: '/transactions', icon: Wallet, adminOnly: false },
  { label: 'Contas', path: '/accounts', icon: TrendingUp, adminOnly: false },
  { label: 'Cartões', path: '/cards', icon: CreditCard, adminOnly: false },
  { label: 'Categorias', path: '/categories', icon: Tags, adminOnly: false },
  { label: 'Salário', path: '/salary', icon: Receipt, adminOnly: false },
  { label: 'Acompanhamento', path: '/tracking', icon: CalendarCheck, adminOnly: false },
  { label: 'Perfil', path: '/profile', icon: UserRound, adminOnly: false },
  { label: 'Usuários', path: '/users', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full w-60 flex-col border-r border-border bg-surface">
      <div className="px-5 py-5">
        <h1 className="text-xl font-bold tracking-tight text-primary">Finnance</h1>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {navigation
          .filter((item) => !item.adminOnly || user?.isAdmin)
          .map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <p className="text-xs text-text-muted">Usuário</p>
          <p className="truncate text-sm font-semibold text-text">{user?.fullName}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-expense"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
