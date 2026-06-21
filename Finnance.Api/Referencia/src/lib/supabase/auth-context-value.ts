import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
