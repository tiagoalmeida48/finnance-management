import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '@/config/http';
import { authService } from './services/authService';
import type { LoginInput, Me } from './types/auth.types';
import { useToast } from '@/shared/components/feedback';

export interface AuthContextType {
  user: Me | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(
    async (input: LoginInput) => {
      try {
        const session = await authService.login(input);
        tokenStorage.set(session.token);
        const me = await authService.me();
        setUser(me);
        addToast('Bem-vindo!', 'success');
        navigate('/');
      } catch (error) {
        addToast('Usuário ou senha incorreta', 'error');
        throw error;
      }
    },
    [navigate, addToast],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const refresh = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
