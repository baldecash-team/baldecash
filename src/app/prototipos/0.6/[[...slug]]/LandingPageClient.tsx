'use client';

/**
 * LandingPageClient - Client component con fetch en runtime
 * Permite ver requests en Network tab y datos siempre frescos
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '../components/hero/HeroSection';
import { fetchHeroData } from '../services/landingApi';
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData } from '../types/hero';

interface LandingPageClientProps {
  slug: string;
}

interface HeroData {
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;
  testimonials: Testimonial[];
  testimonialsTitle?: string;
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
}

export function LandingPageClient({ slug }: LandingPageClientProps) {
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('clean') === 'true';

  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchHeroData(slug);

        if (!data) {
          setError('Landing no encontrada');
          return;
        }

        setHeroData(data);
      } catch (err) {
        console.error('[0.6] Error fetching hero data:', err);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error || !heroData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            {error || 'Landing no encontrada'}
          </h1>
          <p className="text-neutral-600 mb-4">
            No se pudo cargar la página para: <code className="bg-neutral-200 px-2 py-1 rounded">{slug}</code>
          </p>
          <p className="text-sm text-neutral-500">
            Verifica que el backend esté corriendo en <code>localhost:8001</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <HeroSection
      heroContent={heroData.heroContent}
      socialProof={heroData.socialProof}
      howItWorksData={heroData.howItWorksData}
      faqData={heroData.faqData}
      ctaData={heroData.ctaData}
      promoBannerData={heroData.promoBannerData}
      testimonials={heroData.testimonials}
      testimonialsTitle={heroData.testimonialsTitle}
      activeSections={heroData.activeSections}
      hasCta={heroData.hasCta}
      logoUrl={heroData.logoUrl}
      customerPortalUrl={heroData.customerPortalUrl}
      isCleanMode={isCleanMode}
    />
  );
}

// Skeleton de carga
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 bg-neutral-100 border-b border-neutral-200" />

      {/* Hero skeleton */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="h-12 bg-neutral-200 rounded-lg w-3/4" />
              <div className="h-6 bg-neutral-200 rounded w-full" />
              <div className="h-6 bg-neutral-200 rounded w-2/3" />
              <div className="flex gap-4 pt-4">
                <div className="h-14 w-40 bg-neutral-300 rounded-lg" />
                <div className="h-14 w-40 bg-neutral-200 rounded-lg" />
              </div>
            </div>
            <div className="flex-1">
              <div className="aspect-video bg-neutral-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Social proof skeleton */}
      <div className="bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 bg-neutral-200 rounded w-64 mx-auto mb-8" />
          <div className="flex justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-24 bg-neutral-200 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-10 bg-neutral-200 rounded w-1/3 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-neutral-100 rounded-xl border border-neutral-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
