export interface Session {
  token: string;
  user: number;
  name: string;
  authenticated: boolean;
  idiom: string;
}

export interface Me {
  user: number;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string | null;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  currency: string;
  locale: string;
  isAdmin: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}
