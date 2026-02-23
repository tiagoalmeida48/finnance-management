import { useState } from "react";
import { IconButton } from "@/shared/components/ui/icon-button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/shared/components/composite/Sidebar";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 899px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed left-0 right-0 top-0 z-[1301] border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="flex h-14 items-center px-4">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2 text-[var(--color-text-primary)]"
            >
              <Menu />
            </IconButton>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
              Finnance
            </h1>
          </div>
        </header>
      )}

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`relative min-w-0 w-full flex-1 overflow-x-hidden bg-[var(--color-background-alt)] p-0 [background-image:radial-gradient(circle_at_18%_12%,var(--overlay-primary-12),transparent_38%),radial-gradient(circle_at_78%_82%,var(--overlay-info-09),transparent_32%),linear-gradient(var(--overlay-white-06)_1px,transparent_1px),linear-gradient(90deg,var(--overlay-white-06)_1px,transparent_1px)] [background-size:auto,auto,34px_34px,34px_34px] ${
          isMobile ? "pt-20" : "pt-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
