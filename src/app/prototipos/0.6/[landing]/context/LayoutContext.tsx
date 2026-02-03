'use client';

/**
 * LayoutContext - Shared layout data for all pages under [landing]
 * Fetches navbar, footer, and company data ONCE and shares across all pages
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getLandingLayout, type LandingLayoutResponse } from '@/app/prototipos/0.6/services/landingApi';
import type { PromoBannerData, FooterData } from '@/app/prototipos/0.6/types/hero';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  customerPortalUrl?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
}

interface LayoutContextValue {
  layoutData: LandingLayoutResponse | null;
  navbarProps: NavbarProps | null;
  footerData: FooterData | null;
  isLoading: boolean;
  landing: string;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  const [layoutData, setLayoutData] = useState<LandingLayoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch layout data once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchLayoutData = async () => {
      try {
        const data = await getLandingLayout(landing);
        if (isMounted) {
          setLayoutData(data);
        }
      } catch (error) {
        console.error('Error fetching layout data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayoutData();

    return () => {
      isMounted = false;
    };
  }, [landing]);

  // Transform layout data for Navbar props
  const navbarProps = useMemo((): NavbarProps | null => {
    if (!layoutData) return null;

    const navbarConfig = layoutData.navbar?.content_config as Record<string, unknown> | undefined;
    const promoConfig = layoutData.promo_banner?.content_config as Record<string, unknown> | undefined;

    const navbarItems = navbarConfig?.items as { label: string; href: string; section: string | null; has_megamenu?: boolean }[] | undefined;
    const megamenuItems = navbarConfig?.megamenu_items as { label: string; href: string; icon: string; description: string }[] | undefined;

    const promoBannerData: PromoBannerData | null = promoConfig ? {
      text: (promoConfig.text as string) || '',
      highlight: promoConfig.highlight as string | undefined,
      ctaText: promoConfig.cta_text as string | undefined,
      ctaUrl: promoConfig.cta_url as string | undefined,
      icon: promoConfig.icon as string | undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? true,
    } : null;

    return {
      promoBannerData,
      logoUrl: layoutData.company?.logo_url,
      customerPortalUrl: layoutData.company?.customer_portal_url,
      navbarItems: navbarItems || [],
      megamenuItems: megamenuItems || [],
      activeSections: ['convenios', 'como-funciona', 'faq'],
    };
  }, [layoutData]);

  // Transform layout data for Footer props
  const footerData = useMemo((): FooterData | null => {
    if (!layoutData) return null;

    const footerConfig = layoutData.footer?.content_config as Record<string, unknown> | undefined;
    if (!footerConfig) return null;

    return {
      tagline: footerConfig.tagline as string | undefined,
      columns: footerConfig.columns as { title: string; links: { label: string; href: string }[] }[] | undefined,
      newsletter: footerConfig.newsletter as { title: string; description: string; placeholder: string; button_text: string } | undefined,
      sbs_text: footerConfig.sbs_text as string | undefined,
      copyright_text: footerConfig.copyright_text as string | undefined,
      social_links: footerConfig.social_links as { platform: string; url: string }[] | undefined,
      company: layoutData.company ? {
        name: layoutData.company.name,
        legal_name: layoutData.company.legal_name,
        logo_url: layoutData.company.logo_url,
        main_phone: layoutData.company.main_phone,
        main_email: layoutData.company.main_email,
        website_url: layoutData.company.website_url,
        customer_portal_url: layoutData.company.customer_portal_url,
        support_phone: layoutData.company.support_phone,
        support_email: layoutData.company.support_email,
        support_whatsapp: layoutData.company.support_whatsapp,
        support_hours: layoutData.company.support_hours,
        sbs_registration: layoutData.company.sbs_registration,
        social_links: layoutData.company.social_links as { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; tiktok?: string } | undefined,
      } : undefined,
    };
  }, [layoutData]);

  const value = useMemo(() => ({
    layoutData,
    navbarProps,
    footerData,
    isLoading,
    landing,
  }), [layoutData, navbarProps, footerData, isLoading, landing]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export default LayoutContext;
