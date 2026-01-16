'use client';

/**
 * LegalPageLayout - Layout compartido para páginas legales
 * Incluye Navbar (minimal) y Footer del hero
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/app/prototipos/0.5/hero/components/hero';
import { CubeGridSpinner, FeedbackButton, useScrollToTop } from '@/app/prototipos/_shared';

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

function LegalPageLayoutContent({ children, title, lastUpdated }: LegalPageLayoutProps) {
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [isLoading, setIsLoading] = useState(true);

  useScrollToTop();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar isCleanMode={isCleanMode} hidePromoBanner />

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
      <Footer isCleanMode={isCleanMode} />

      {/* Feedback Button */}
      {isCleanMode && <FeedbackButton sectionId="legal" />}
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
