import { useCallback, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { AuthContext, type Profile } from './auth-context-value';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => {
    const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
    return localStorage.getItem(storageKey) !== null;
  });

  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.rpc('get_profile');
      if (error) return null;
      if (!data) return null;
      return data as Profile;
    } catch {
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
        await applySession(nextSession, isMounted);
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
