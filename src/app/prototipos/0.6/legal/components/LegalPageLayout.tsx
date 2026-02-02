'use client';

/**
 * LegalPageLayout - Layout compartido para páginas legales v0.6
 * Incluye Navbar y Footer conectados a la API
 * Usa endpoint /layout para obtener solo navbar + footer + company
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { getLandingLayout } from '@/app/prototipos/0.6/services/landingApi';
import type { FooterData, NavbarItemData, MegaMenuItemData } from '@/app/prototipos/0.6/types/hero';

interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

interface NavbarContentConfig {
  items?: NavbarItemData[];
  megamenu_items?: MegaMenuItemData[];
}

interface FooterContentConfig {
  tagline?: string;
  columns?: { title: string; links: { label: string; href: string }[] }[];
  newsletter?: { title: string; description: string; placeholder: string; button_text: string };
  sbs_text?: string;
  copyright_text?: string;
  social_links?: { platform: string; url: string }[];
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

function LegalPageLayoutContent({ children, title, lastUpdated }: LegalPageLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | undefined>();
  const [navbarItems, setNavbarItems] = useState<NavbarItemData[]>([]);
  const [megamenuItems, setMegamenuItems] = useState<MegaMenuItemData[]>([]);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useScrollToTop();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Usar endpoint /layout que solo trae navbar + footer + company
        const data = await getLandingLayout('home');
        if (data) {
          // Extraer logo y customer portal de company
          setLogoUrl(data.company?.logo_url);
          setCustomerPortalUrl(data.company?.customer_portal_url);

          // Extraer navbar
          if (data.navbar) {
            const navbarConfig = data.navbar.content_config as NavbarContentConfig;
            setNavbarItems(navbarConfig?.items || []);
            setMegamenuItems(navbarConfig?.megamenu_items || []);
          }

          // Extraer footer
          if (data.footer) {
            const footerConfig = data.footer.content_config as FooterContentConfig;
            setFooterData({
              tagline: footerConfig?.tagline,
              columns: footerConfig?.columns,
              newsletter: footerConfig?.newsletter,
              sbs_text: footerConfig?.sbs_text,
              copyright_text: footerConfig?.copyright_text,
              social_links: footerConfig?.social_links,
              company: data.company ? {
                logo_url: data.company.logo_url,
                customer_portal_url: data.company.customer_portal_url,
                social_links: data.company.social_links ? {
                  facebook: data.company.social_links.facebook,
                  instagram: data.company.social_links.instagram,
                  twitter: data.company.social_links.twitter,
                  linkedin: data.company.social_links.linkedin,
                  youtube: data.company.social_links.youtube,
                  tiktok: data.company.social_links.tiktok,
                } : undefined,
              } : undefined,
            });
          }
        }
      } catch (error) {
        console.error('Error loading landing layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq']}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-neutral-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Baloo_2'] mb-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-neutral-500">
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer data={footerData} />
    </div>
  );
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = (props) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LegalPageLayoutContent {...props} />
    </Suspense>
  );
};

export default LegalPageLayout;
