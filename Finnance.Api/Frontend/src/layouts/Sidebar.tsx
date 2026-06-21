import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, TrendingUp, Tags, Receipt, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/utils';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Transações', path: '/transactions', icon: Wallet },
  { label: 'Contas', path: '/accounts', icon: TrendingUp },
  { label: 'Cartões', path: '/cards', icon: CreditCard },
  { label: 'Categorias', path: '/categories', icon: Tags },
  { label: 'Salário', path: '/salary', icon: Receipt },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Finnance</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text',
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="px-4 py-3 bg-surface-2 rounded-lg">
          <p className="text-sm text-text-muted">Usuário</p>
          <p className="text-sm font-semibold text-text truncate">{user?.fullName}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-text-muted hover:text-expense hover:bg-surface-2 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
