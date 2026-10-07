import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface InstitutionBranding {
  institutionName: string;
  institutionFullName: string;
  acronym: string;
  city: string;
  neighborhood: string;
  country: string;
  domain: string;
  website: string;
  phone: string;
  email: string;
  secondaryEmail?: string;
  logoUrl?: string;
  watermarkUrl?: string;
  logoType?: 'crest' | 'custom';
  motto?: string;
  directorName?: string;
  directorTitle?: string;
  authorizationNumber?: string;
  postalBox?: string;
  orangeMoneyNumber?: string;
  mtnMoneyNumber?: string;
  bankAccount?: string;
  officialStampUrl?: string;
  directorSignatureUrl?: string;
  currency?: string;
  timezone?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface BrandingContextType {
  branding: InstitutionBranding;
  isLoading: boolean;
  updateBranding: (data: Partial<InstitutionBranding>) => Promise<boolean>;
  updateLogo: (logoUrl: string) => Promise<boolean>;
  resetLogo: () => Promise<boolean>;
  refreshBranding: () => Promise<void>;
}

const DEFAULT_BRANDING: InstitutionBranding = {
  institutionName: "CFP-ITMC",
  institutionFullName: "Centre de Formation Professionnelle aux Métiers des Technologies de l'Information et du Management au Cameroun",
  acronym: "CFP-ITMC",
  city: "Douala - Logpom",
  neighborhood: "Logpom (Carrefour Bassong)",
  country: "Cameroun",
  domain: "cfp-itmc.com",
  website: "https://cfp-itmc.com",
  phone: "683 66 32 22 / 688 05 20 94",
  email: "info@cfp.itmc.com",
  secondaryEmail: "cfp.itmc@gmail.com",
  logoUrl: "/logo.jpg",
  watermarkUrl: "/watermark-logo.png",
  logoType: "custom",
  motto: "L'Excellence Technologique et Managériale au Service de l'Emploi",
  directorName: "Dr. TCHAPGNIN Gédéon",
  directorTitle: "Directeur des Études",
  authorizationNumber: "Arrêté N° 0038/MINEFOP/SG/DFOP/SDGS/SACD",
  postalBox: "BP 1248 Douala",
  orangeMoneyNumber: "688 05 20 94",
  mtnMoneyNumber: "683 66 32 22",
  bankAccount: "UBA Cameroun • 04018-00001-XXXXXXXXXX",
  currency: "FCFA"
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<InstitutionBranding>(() => {
    try {
      const cached = localStorage.getItem('cfp_itmc_branding_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.email === 'contact@cfp-itmc.com' || parsed.email === 'contact@ifp-itmc.com' || !parsed.secondaryEmail || parsed.phone?.includes('638')) {
          parsed.email = 'info@cfp.itmc.com';
          parsed.secondaryEmail = 'cfp.itmc@gmail.com';
          parsed.phone = '683 66 32 22 / 688 05 20 94';
          parsed.mtnMoneyNumber = '683 66 32 22';
          parsed.orangeMoneyNumber = '688 05 20 94';
          localStorage.setItem('cfp_itmc_branding_cache', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_BRANDING;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/branding');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.branding) {
          setBranding(data.branding);
          try {
            localStorage.setItem('cfp_itmc_branding_cache', JSON.stringify(data.branding));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Could not fetch institution branding, using fallback cache:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBranding();

    const handleSync = () => {
      refreshBranding();
    };

    window.addEventListener('institutionBrandingChanged', handleSync);
    return () => window.removeEventListener('institutionBrandingChanged', handleSync);
  }, [refreshBranding]);

  const getAuthToken = () =>
    sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    localStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    localStorage.getItem('token');

  const updateBranding = async (data: Partial<InstitutionBranding>): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setBranding(resData.branding);
        try {
          localStorage.setItem('cfp_itmc_branding_cache', JSON.stringify(resData.branding));
        } catch {}
        window.dispatchEvent(new CustomEvent('institutionBrandingChanged'));
        return true;
      } else {
        toast.error(resData.error || "Erreur lors de la mise à jour du branding.");
        return false;
      }
    } catch {
      toast.error("Erreur réseau lors de la mise à jour des paramètres.");
      return false;
    }
  };

  const updateLogo = async (logoUrl: string): Promise<boolean> => {
    return updateBranding({ logoUrl, logoType: logoUrl ? 'custom' : 'crest' });
  };

  const resetLogo = async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/branding/reset-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setBranding(resData.branding);
        try {
          localStorage.setItem('cfp_itmc_branding_cache', JSON.stringify(resData.branding));
        } catch {}
        window.dispatchEvent(new CustomEvent('institutionBrandingChanged'));
        return true;
      } else {
        toast.error(resData.error || "Erreur lors de la réinitialisation du logo.");
        return false;
      }
    } catch {
      toast.error("Erreur réseau lors de la réinitialisation du logo.");
      return false;
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, updateBranding, updateLogo, resetLogo, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      isLoading: false,
      updateBranding: async () => false,
      updateLogo: async () => false,
      resetLogo: async () => false,
      refreshBranding: async () => {}
    };
  }
  return context;
}
