import { useContext } from 'react';
import { SiteBrandingContext } from '@/shared/contexts/site-branding-context-object';

export function useSiteBranding() {
    const context = useContext(SiteBrandingContext);
    if (!context) {
        throw new Error('useSiteBranding must be used within SiteBrandingProvider');
    }
    return context;
}
