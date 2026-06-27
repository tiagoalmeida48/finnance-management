import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Gem, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '@/shared/components/feedback';

export function MainLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === '1',
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () =>
    setCollapsed((value) => {
      localStorage.setItem('sidebar-collapsed', value ? '0' : '1');
      return !value;
    });

  return (
    <div className="flex h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 ring-grid opacity-40" />
        <div className="animate-float-slow absolute -left-40 top-8 h-[26rem] w-[26rem] rounded-full bg-primary/[0.05] blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-transfer/[0.10] blur-3xl" />
      </div>

      <div className="relative z-20 hidden shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-overlay-in absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-drawer-in absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-soft to-primary text-bg">
              <Gem size={15} strokeWidth={2.4} />
            </div>
            <span className="font-display text-base font-semibold text-gradient-gold">Finnance</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div
            key={location.pathname}
            className="route-reveal mx-auto w-[90%] p-4 sm:p-6 lg:p-8"
          >
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
