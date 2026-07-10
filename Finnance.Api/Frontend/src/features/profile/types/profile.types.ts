export interface ProfileInfo {
  user: number;
  fullName: string;
  email: string;
  isAdmin: boolean;
  phone: string | null;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
}

export interface UpdateProfileInput {
  fullName: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  password: string;
}

export interface UpdateMarketingPreferencesInput {
  phone: string;
  marketingConsent: boolean;
}
