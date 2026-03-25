/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./client";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, is_admin")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return null;
          }

          console.error("Error fetching profile:", error);
          return null;
        }

        return data as Profile;
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return null;
      }
    },
    [],
  );

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

      const fetchedProfile = await fetchProfile(currentUser.id);
      if (!isMounted()) return;
      setProfile(fetchedProfile);
    },
    [fetchProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const fetchedProfile = await fetchProfile(user.id);
    setProfile(fetchedProfile);
  }, [fetchProfile, user]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    const bootstrap = async () => {
      setLoading(true);
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
      void (async () => {
        if (!isMounted()) return;

        await applySession(nextSession, isMounted, {
          refreshProfile: event !== "TOKEN_REFRESHED",
        });
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
    <AuthContext.Provider
      value={{ user, session, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
