'use client';

/**
 * LegalPageLayout - Layout compartido para páginas legales
 * Usa useLayout() del LayoutContext (no hace fetch propio)
 * El contenido es estático y se pasa como children
 */

import React from 'react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useLayout } from '../../context/LayoutContext';

interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export function LegalPageLayout({ children, title, lastUpdated }: LegalPageLayoutProps) {
  const { navbarProps, footerData, agreementData, isLoading, hasError, landing } = useLayout();
  const isConvenio = !!agreementData;

  useScrollToTop();

  // Show loading spinner while fetching
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        portalButtonText={navbarProps.portalButtonText}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
        institutionLogo={navbarProps.institutionLogo}
        institutionName={navbarProps.institutionName}
      />

      {/* Main Content - use --header-total-height exposed by Navbar so the
          top padding adapts to the actual fixed header height (preview banner
          + promo banner + navbar) instead of guessing. */}
      <main
        className="flex-1 pb-12 sm:pb-16"
        style={{ paddingTop: 'calc(var(--header-total-height, 6.5rem) + 1.5rem)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-neutral-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 font-['Baloo_2',_sans-serif] leading-tight mb-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-xs sm:text-sm text-neutral-500">
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer - Convenio uses minimalist co-branded footer */}
      {isConvenio ? (
        <ConvenioFooter data={footerData} agreementData={agreementData!} landing={landing} />
      ) : (
        <Footer data={footerData} landing={landing} />
      )}
    </div>
  );
}

export default LegalPageLayout;
