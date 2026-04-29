<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { AuthContext, type Profile } from './auth-context-value';
=======
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';

export interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
>>>>>>> finnance-management/main

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => {
<<<<<<< HEAD
=======
    // Fast-path: se não há token no storage, sabemos que não há sessão
    // Mostra login imediatamente sem esperar getSession()
>>>>>>> finnance-management/main
    const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
    return localStorage.getItem(storageKey) !== null;
  });

<<<<<<< HEAD
  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.rpc('get_profile');
      if (error) return null;
      if (!data) return null;
      return data as Profile;
    } catch {
=======
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }

        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
>>>>>>> finnance-management/main
      return null;
    }
  }, []);

  const applySession = useCallback(
    async (
      nextSession: Session | null,
      isMounted: () => boolean,
      options?: { refreshProfile?: boolean },
    ) => {
      if (!isMounted()) return;

      setSession(nextSession);
      const currentUser = nextSession?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      if (options?.refreshProfile === false) {
        return;
      }

      const fetchedProfile = await fetchProfile();
      if (!isMounted()) return;
      setProfile(fetchedProfile);
    },
    [fetchProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const fetchedProfile = await fetchProfile();
    setProfile(fetchedProfile);
  }, [fetchProfile, user]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    const bootstrap = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      await applySession(initialSession, isMounted);
      if (isMounted()) {
        setLoading(false);
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        if (isMounted()) setLoading(false);
        return;
      }

      void (async () => {
        if (!isMounted()) return;
<<<<<<< HEAD
        await applySession(nextSession, isMounted);
=======

        await applySession(nextSession, isMounted, {
          refreshProfile: event !== 'TOKEN_REFRESHED',
        });
>>>>>>> finnance-management/main
        if (isMounted()) setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
<<<<<<< HEAD
=======

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
>>>>>>> finnance-management/main
