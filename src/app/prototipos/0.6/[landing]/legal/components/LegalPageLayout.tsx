'use client';

/**
 * LegalPageLayout - Layout compartido para páginas legales
 * Usa useLayout() del LayoutContext (no hace fetch propio)
 * El contenido es estático y se pasa como children
 */

import React from 'react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
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
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();

  useScrollToTop();

  // Show loading spinner while fetching
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
      />

      {/* Main Content - pt-40 to account for navbar (64px) + promo banner (40px) + spacing */}
      <main className="flex-1 pt-40 pb-16">
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
      <Footer data={footerData} landing={landing} />
    </div>
  );
}

export default LegalPageLayout;
