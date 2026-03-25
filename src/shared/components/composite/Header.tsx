import { IconButton } from "@/shared/components/ui/icon-button";
import { useAuth } from "@/lib/supabase/auth-context";
import { LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const siteTitle = "Gestão Financeira";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[var(--color-background)]">
      <div className="flex h-14 items-center px-4">
        <h1 className="flex-1 text-base font-bold text-[var(--color-primary)]">
          {siteTitle}
        </h1>

        {user && (
          <div className="relative flex items-center" ref={menuRef}>
            <p className="mr-2 hidden text-sm text-white/70 sm:block">
              {profile?.full_name || user.email}
            </p>
            <IconButton
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-0"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-black">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()
                )}
              </div>
            </IconButton>
            {menuOpen && (
              <div className="absolute right-0 top-10 min-w-[150px] rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
                >
                  <UserIcon size={16} />
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
