import { IconButton } from '@/shared/components/ui/icon-button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/shared/components/composite/Sidebar';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useUIStore } from '@/shared/stores/ui.store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const { sidebarMobileOpen, toggleSidebarMobile } = useUIStore();

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed left-0 right-0 top-0 z-[1301] border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleSidebarMobile}
                className="text-[var(--color-text-primary)]"
              >
                <Menu size={22} />
              </IconButton>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <img src="/finnance-icon.svg" alt="Logo" className="h-6 w-6 object-contain" />
              <h1 className="font-heading text-[15px] font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                Gestão Financeira
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </header>
      )}

      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarMobileOpen} onMobileClose={toggleSidebarMobile} />

      {/* Main Content */}
      <main
        className={`relative min-w-0 w-full flex-1 overflow-x-hidden bg-[var(--color-background-alt)] p-0 [background-image:radial-gradient(circle_at_18%_12%,var(--overlay-primary-12),transparent_38%),radial-gradient(circle_at_78%_82%,var(--overlay-info-09),transparent_32%),linear-gradient(var(--overlay-white-06)_1px,transparent_1px),linear-gradient(90deg,var(--overlay-white-06)_1px,transparent_1px)] [background-size:auto,auto,34px_34px,34px_34px] ${
          isMobile ? 'pt-20' : 'pt-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
