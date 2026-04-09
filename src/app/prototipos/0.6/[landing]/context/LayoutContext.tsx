'use client';

/**
 * LayoutContext - Shared layout data for all pages under [landing]
 * Fetches navbar, footer, and company data ONCE and shares across all pages
 *
 * Preview Mode Support:
 * When PreviewContext has active preview credentials for this landing,
 * uses getLandingLayoutById with preview_key instead of slug-based API.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getLandingLayout, type LandingLayoutResponse } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import type { PromoBannerData, FooterData, AgreementData } from '@/app/prototipos/0.6/types/hero';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
  institutionLogo?: string;
  institutionName?: string;
}

interface LayoutContextValue {
  layoutData: LandingLayoutResponse | null;
  navbarProps: NavbarProps | null;
  footerData: FooterData | null;
  agreementData: AgreementData | null;
  isLoading: boolean;
  hasError: boolean; // true when landing not found or API error (for 404 display)
  landing: string;
  primaryColor: string;
  secondaryColor: string;
  primaryColorRgb: string;
  secondaryColorRgb: string;
  /** Whether this landing is being previewed with preview_key */
  isPreviewMode: boolean;
  /** Landing ID when in preview mode */
  previewLandingId: number | null;
  /** Public system configuration flags from backend */
  settings: Record<string, string>;
}

/**
 * Convert hex color to RGB string for use with rgba()
 * Example: "#4654CD" -> "70, 84, 205"
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // Fallback to default primary color RGB
  return '70, 84, 205';
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // TODO: Quitar cuando zona-gamer tenga su propia config en el backend
  const layoutSlug = landing === 'zona-gamer' ? 'home' : landing;

  // Check if we're in preview mode for this landing
  // Wait for preview context to hydrate from sessionStorage before fetching
  const preview = usePreview();
  const isPreviewHydrated = preview.isHydrated;
  const isPreviewMode = preview.isPreviewingLanding(landing);
  const previewLandingId = isPreviewMode ? preview.landingId : null;
  const previewKey = isPreviewMode ? preview.previewKey : null;

  const [layoutData, setLayoutData] = useState<LandingLayoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fetch layout data once on mount (wait for preview context to hydrate first)
  useEffect(() => {
    // Don't fetch until we know if we're in preview mode
    if (!isPreviewHydrated) return;

    let isMounted = true;

    const fetchLayoutData = async () => {
      try {
        // Use slug-based API, with preview_key if in preview mode
        const data = await getLandingLayout(layoutSlug, previewKey);

        if (isMounted) {
          setLayoutData(data);
          // If API returns null (404), mark as error
          if (!data) {
            setHasError(true);
          }
        }
      } catch (error) {
        console.error('Error fetching layout data:', error);
        if (isMounted) {
          setHasError(true);
        }
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
  }, [landing, isPreviewHydrated, isPreviewMode, previewKey]);

  // Transform layout data for Navbar props
  const navbarProps = useMemo((): NavbarProps | null => {
    if (!layoutData) return null;

    const navbarConfig = layoutData.navbar?.content_config as Record<string, unknown> | undefined;
    const promoConfig = layoutData.promo_banner?.content_config as Record<string, unknown> | undefined;

    const navbarItems = navbarConfig?.items as { label: string; href: string; section: string | null; has_megamenu?: boolean }[] | undefined;
    const megamenuItems = navbarConfig?.megamenu_items as { label: string; href: string; icon: string; description: string }[] | undefined;

    // Combinar cta_url + cta_url_params si existen
    const baseUrl = (promoConfig?.cta_url as string) || '';
    const urlParams = (promoConfig?.cta_url_params as string) || '';
    const fullCtaUrl = baseUrl && urlParams ? `${baseUrl}${urlParams}` : baseUrl || undefined;

    const promoBannerData: PromoBannerData | null = promoConfig ? {
      text: (promoConfig.text as string) || '',
      highlight: promoConfig.highlight as string | undefined,
      ctaText: promoConfig.cta_text as string | undefined,
      ctaUrl: fullCtaUrl,
      icon: promoConfig.icon as string | undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? true,
    } : null;

    // Agreement data for co-branding (convenio landings)
    const agreement = layoutData.agreement;

    return {
      promoBannerData,
      logoUrl: layoutData.company?.logo_url,
      customerPortalUrl: layoutData.company?.customer_portal_url,
      portalButtonText: (navbarConfig?.portal_button_text as string) || undefined,
      navbarItems: navbarItems || [],
      megamenuItems: megamenuItems || [],
      // Derive active sections from navbar items (if an item has a section, it's active)
      activeSections: (navbarItems || [])
        .filter((item) => item.section)
        .map((item) => item.section as string),
      institutionLogo: agreement?.institution_logo || undefined,
      institutionName: agreement?.institution_name || undefined,
    };
  }, [layoutData]);

  // Transform layout data for Footer props
  const footerData = useMemo((): FooterData | null => {
    if (!layoutData) return null;

    const footerConfig = layoutData.footer?.content_config as Record<string, unknown> | undefined;
    if (!footerConfig) return null;

    // Transform columns: normalize url -> href for links, combining base + params
    const rawColumns = footerConfig.columns as Array<{
      title: string;
      links: Array<{ label: string; url?: string; href?: string; url_params?: string; href_params?: string }>;
    }> | undefined;

    const transformedColumns = rawColumns?.map(col => ({
      title: col.title,
      links: col.links.map(link => {
        const baseUrl = link.href || link.url || '';
        const params = link.href_params || link.url_params || '';
        return {
          label: link.label,
          href: (baseUrl + params) || '#',
        };
      }),
    }));

    return {
      tagline: footerConfig.tagline as string | undefined,
      columns: transformedColumns,
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

  // Extract colors from layout data
  const primaryColor = layoutData?.primary_color || '#4654CD';
  const secondaryColor = layoutData?.secondary_color || '#03DBD0';
  const primaryColorRgb = hexToRgb(primaryColor);
  const secondaryColorRgb = hexToRgb(secondaryColor);

  // Set CSS variables on :root so they're available to portals (modals, drawers)
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', primaryColorRgb);
    document.documentElement.style.setProperty('--color-secondary-rgb', secondaryColorRgb);

    return () => {
      // Clean up on unmount
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-primary-rgb');
      document.documentElement.style.removeProperty('--color-secondary-rgb');
    };
  }, [primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb]);

  // Extract public settings from layout data
  const settings = useMemo<Record<string, string>>(() => layoutData?.settings ?? {}, [layoutData]);

  // Extract agreement data for convenio pages
  const agreementData = useMemo((): AgreementData | null => {
    if (!layoutData) return null;
    const agreement = layoutData.agreement;
    return agreement || null;
  }, [layoutData]);

  const value = useMemo(() => ({
    layoutData,
    navbarProps,
    footerData,
    agreementData,
    isLoading,
    hasError,
    landing,
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    isPreviewMode,
    previewLandingId,
    settings,
  }), [layoutData, navbarProps, footerData, agreementData, isLoading, hasError, landing, primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb, isPreviewMode, previewLandingId, settings]);

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
