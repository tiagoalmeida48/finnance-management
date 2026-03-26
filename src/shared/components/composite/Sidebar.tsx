import { useState } from 'react';
import { IconButton } from '@/shared/components/ui/icon-button';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  CreditCard,
  Tag,
  LogOut,
  CalendarCheck,
  ChevronsLeft,
  ChevronsRight,
  Calculator,
  Users,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/supabase/auth-context';
import { SidebarMenuItem } from './SidebarMenuItem';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

const baseMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Contas', icon: Wallet, path: '/accounts' },
  { label: 'Categorias', icon: Tag, path: '/categories' },
  { label: 'Transações', icon: Receipt, path: '/transactions' },
  { label: 'Cartões', icon: CreditCard, path: '/cards' },
  { label: 'Tracking', icon: CalendarCheck, path: '/tracking' },
  { label: 'Holerite', icon: Calculator, path: '/salary-simulator' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const siteTitle = 'Gestão Financeira';

  const open = isMobile ? true : isExpanded;
  const menuItems = profile?.is_admin
    ? [...baseMenuItems, { label: 'Usuários', icon: Users, path: '/users' }]
    : baseMenuItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onMobileClose?.();
  };

  const sidebarContent = (
    <div
      className={`flex h-full flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] ${
        isMobile ? 'w-[220px]' : open ? 'w-[220px]' : 'w-[72px]'
      }`}
    >
      <div>
        <div className="flex min-h-[72px] items-center justify-start gap-1.5 border-b border-[var(--color-border)] p-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
            <img
              src="/finnance-icon.svg"
              alt="Logo do site"
              className="h-full w-full object-cover"
            />
          </div>

          <p
            className={`font-heading overflow-hidden whitespace-nowrap text-[15px] font-bold tracking-[-0.02em] text-[var(--color-text-primary)] transition-all duration-200 ${
              open ? 'w-auto translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0'
            }`}
          >
            {siteTitle}
          </p>
        </div>

        <ul className="flex flex-col items-stretch gap-1 px-1 py-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <SidebarMenuItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                path={item.path}
                open={open}
                isActive={isActive}
                onClick={handleNavigate}
              />
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[var(--color-border)] px-1 py-1.5">
        <button
          type="button"
          title={!open ? profile?.full_name || 'Perfil' : undefined}
          onClick={() => handleNavigate('/profile')}
          className="flex h-11 w-full cursor-pointer items-center justify-between gap-1.5 rounded-[10px] px-1 py-0 transition-colors hover:bg-white/[0.04]"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-info)_0%,var(--color-secondary)_100%)] text-sm font-bold text-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full rounded-[10px] object-cover"
              />
            ) : (
              profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()
            )}
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap text-left transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="whitespace-nowrap text-[13px] font-semibold text-[var(--color-text-primary)]">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="whitespace-nowrap text-[11px] text-[var(--color-text-muted)]">
              {user?.email}
            </p>
          </div>
        </button>

        <button
          type="button"
          title={!open ? 'Sair' : undefined}
          onClick={handleLogout}
          className="mt-1 flex h-11 w-full cursor-pointer items-center rounded-[10px] px-1.5 py-0 text-[var(--color-error)] transition-colors hover:bg-[var(--overlay-error-10)]"
        >
          <span className="flex min-w-9 justify-center">
            <LogOut size={18} />
          </span>
          <span
            className={`whitespace-nowrap text-[13px] font-semibold transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
          >
            Sair
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={!isMobile ? 'shrink-0 sticky top-0 h-screen z-[1200]' : 'relative shrink-0'}>
      {!isMobile && (
        <IconButton
          size="small"
          title={open ? 'Retrair menu' : 'Expandir menu'}
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`fixed top-9 z-[1300] h-8 w-8 -translate-y-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] shadow-[0_8px_18px_var(--overlay-black-35)] transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[var(--overlay-white-08)] hover:text-[var(--color-text-primary)] ${
            open ? 'left-[204px]' : 'left-[56px]'
          }`}
        >
          {open ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
        </IconButton>
      )}

      {isMobile ? (
        <div
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={onMobileClose}
        >
          <div
            className={`h-full transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      ) : (
        <div
          className={`h-full transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            open ? 'w-[220px]' : 'w-[72px]'
          }`}
        >
          {sidebarContent}
        </div>
      )}
    </div>
  );
}
