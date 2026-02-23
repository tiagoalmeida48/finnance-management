import { createContext } from "react";

export interface SiteBranding {
  siteTitle: string;
  logoImage: string | null;
}

export interface SiteBrandingContextValue extends SiteBranding {
  loading: boolean;
  saving: boolean;
  updateBranding: (updates: Partial<SiteBranding>) => Promise<void>;
}

export const SiteBrandingContext =
  createContext<SiteBrandingContextValue | null>(null);
