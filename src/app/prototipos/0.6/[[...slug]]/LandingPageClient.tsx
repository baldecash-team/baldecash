'use client';

/**
 * LandingPageClient - Client component con fetch en runtime
 * Permite ver requests en Network tab y datos siempre frescos
 *
 * Soporta preview mode via postMessage desde el admin
 */

import { useEffect, useState, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '../components/hero/HeroSection';
import { fetchHeroData } from '../services/landingApi';
import { usePreviewListener } from '../hooks/usePreviewListener';
import { NotFoundContent } from '../components/NotFoundContent';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData } from '../types/hero';

// Preloader con branding BaldeCash (igual que el catálogo)
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

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
  navbarItems: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems: { label: string; href: string; icon: string; description: string }[];
  testimonials: Testimonial[];
  testimonialsTitle?: string;
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData: FooterData | null;
  primaryColor?: string;
  secondaryColor?: string;
}

// Wrapper component to handle Suspense for useSearchParams
function LandingPageClientInner({ slug }: LandingPageClientProps) {
  const searchParams = useSearchParams();
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview mode from query param (?preview=true)
  const isPreviewParam = searchParams.get('preview') === 'true';

  // Preview mode listener - receives live updates from admin
  const { previewData, isPreviewMode } = usePreviewListener();

  // Preloading: dar tiempo a la página para cargar recursos (igual que catálogo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Pass preview=true to API if in preview mode (iframe from admin)
        const data = await fetchHeroData(slug, isPreviewParam || isPreviewMode);

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
  }, [slug, isPreviewParam, isPreviewMode]);

  // Merge API data with preview data (preview takes priority)
  const mergedHeroContent = useMemo((): HeroContent | null => {
    if (!heroData?.heroContent) return null;

    // If no preview data, return original
    if (!previewData?.hero) return heroData.heroContent;

    const preview = previewData.hero;

    return {
      ...heroData.heroContent,
      // Override with preview data if present (using correct property names)
      headline: preview.title ?? heroData.heroContent.headline,
      subheadline: preview.subtitle ?? heroData.heroContent.subheadline,
      primaryCta: preview.ctaText
        ? { ...heroData.heroContent.primaryCta, text: preview.ctaText, href: preview.ctaUrl ?? heroData.heroContent.primaryCta.href }
        : heroData.heroContent.primaryCta,
      backgroundImage: preview.backgroundUrl ?? heroData.heroContent.backgroundImage,
      minQuota: preview.minQuota ?? heroData.heroContent.minQuota,
      badgeText: preview.badgeText ?? heroData.heroContent.badgeText,
      trustSignals: preview.trustSignals
        ? preview.trustSignals
            .filter((s) => s.isVisible !== false)
            .map((s) => ({
              icon: s.icon,
              text: s.text,
              tooltip: s.tooltip,
            }))
        : heroData.heroContent.trustSignals,
    };
  }, [heroData?.heroContent, previewData?.hero]);

  // Merge social proof data with preview
  const mergedSocialProof = useMemo((): SocialProofData | null => {
    if (!heroData?.socialProof) return null;
    if (!previewData?.socialProof) return heroData.socialProof;

    const preview = previewData.socialProof;
    return {
      ...heroData.socialProof,
      titleTemplate: preview.headline ?? heroData.socialProof.titleTemplate,
      chipText: preview.badgeText ?? heroData.socialProof.chipText,
      subtitle: preview.subtext ?? heroData.socialProof.subtitle,
      studentCount: preview.studentCount ?? heroData.socialProof.studentCount,
      institutions: preview.institutions
        ? preview.institutions
            .filter((i) => i.isVisible !== false)
            .map((i, index) => ({
              id: `preview-inst-${index}`,
              code: i.name.toLowerCase().replace(/\s+/g, '-'),
              name: i.name,
              shortName: i.name,
              logo: i.logo || '',
              hasAgreement: true,
            }))
        : heroData.socialProof.institutions,
    };
  }, [heroData?.socialProof, previewData?.socialProof]);

  // Merge how it works data with preview
  const mergedHowItWorks = useMemo((): HowItWorksData | null => {
    if (!heroData?.howItWorksData) return null;
    if (!previewData?.howItWorks) return heroData.howItWorksData;

    const preview = previewData.howItWorks;
    return {
      ...heroData.howItWorksData,
      title: preview.headline ?? heroData.howItWorksData.title,
      subtitle: preview.subtitle ?? heroData.howItWorksData.subtitle,
      steps: preview.steps
        ? preview.steps
            .filter((s) => s.isVisible !== false)
            .map((s) => ({
              id: s.number,
              title: s.title,
              description: s.description,
              icon: s.icon || 'FileText',
            }))
        : heroData.howItWorksData.steps,
    };
  }, [heroData?.howItWorksData, previewData?.howItWorks]);

  // Merge FAQ data with preview
  const mergedFaq = useMemo((): FaqData | null => {
    if (!heroData?.faqData) return null;
    if (!previewData?.faq) return heroData.faqData;

    const preview = previewData.faq;
    return {
      ...heroData.faqData,
      title: preview.headline ?? heroData.faqData.title,
      subtitle: preview.subtitle ?? heroData.faqData.subtitle,
      items: preview.items
        ? preview.items
            .filter((i) => i.isVisible !== false)
            .map((i, idx) => ({
              id: `preview-faq-${idx}`,
              question: i.question,
              answer: i.answer,
            }))
        : heroData.faqData.items,
    };
  }, [heroData?.faqData, previewData?.faq]);

  // Merge CTA data with preview
  const mergedCta = useMemo((): CtaData | null => {
    if (!heroData?.ctaData) return null;
    if (!previewData?.cta) return heroData.ctaData;

    const preview = previewData.cta;
    return {
      ...heroData.ctaData,
      sectionTitle: preview.headline ?? heroData.ctaData.sectionTitle,
      sectionSubtitle: preview.subtitle ?? heroData.ctaData.sectionSubtitle,
    };
  }, [heroData?.ctaData, previewData?.cta]);

  // Merge navbar items with preview
  const mergedNavbarItems = useMemo(() => {
    if (!heroData?.navbarItems) return [];
    if (!previewData?.navbar?.links) return heroData.navbarItems;

    return previewData.navbar.links
      .filter((link) => link.isVisible !== false)
      .map((link) => ({
        label: link.label,
        href: link.href,
        section: link.href.startsWith('#') ? link.href.slice(1) : null,
      }));
  }, [heroData?.navbarItems, previewData?.navbar?.links]);

  // Merge footer data with preview
  const mergedFooterData = useMemo((): FooterData | null => {
    if (!heroData?.footerData) return null;
    if (!previewData?.footer) return heroData.footerData;

    const preview = previewData.footer;
    return {
      ...heroData.footerData,
      tagline: preview.description ?? heroData.footerData.tagline,
      copyright_text: preview.copyright ?? heroData.footerData.copyright_text,
    };
  }, [heroData?.footerData, previewData?.footer]);

  // Handle hash navigation after data loads (for iframe preview)
  useEffect(() => {
    // Wait for both loading states to complete
    if (!isLoading && !isPageLoading && heroData && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Longer delay to ensure DOM is fully rendered after loading spinner
        const timeoutId = setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isLoading, isPageLoading, heroData]);

  // Set CSS variables on :root so they're available to portals (modals, drawers)
  useEffect(() => {
    if (heroData) {
      const primaryColor = heroData.primaryColor || '#4654CD';
      const secondaryColor = heroData.secondaryColor || '#03DBD0';

      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-secondary', secondaryColor);

      return () => {
        document.documentElement.style.removeProperty('--color-primary');
        document.documentElement.style.removeProperty('--color-secondary');
      };
    }
  }, [heroData]);

  // Loading state - mostrar preloader mientras carga página o datos
  if (isPageLoading || isLoading) {
    return <LoadingFallback />;
  }

  // Error state - usar componente 404 con branding
  if (error || !heroData) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  // Show preview banner if in preview mode (postMessage) or preview param
  const showPreviewBanner = isPreviewMode || isPreviewParam;
  // Preview banner height in pixels (py-1 = 4px top + 4px bottom + ~16px text = ~24px)
  const previewBannerHeight = 24;

  return (
    <div
      style={{
        '--color-primary': heroData.primaryColor || '#4654CD',
        '--color-secondary': heroData.secondaryColor || '#03DBD0',
      } as React.CSSProperties}
    >
      {/* Preview mode indicator */}
      {showPreviewBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs text-center py-1 font-medium">
          Modo Preview - Los cambios se muestran en tiempo real
        </div>
      )}
      <HeroSection
        heroContent={mergedHeroContent}
        socialProof={mergedSocialProof}
        howItWorksData={mergedHowItWorks}
        faqData={mergedFaq}
        ctaData={mergedCta}
        promoBannerData={heroData.promoBannerData}
        navbarItems={mergedNavbarItems}
        megamenuItems={heroData.megamenuItems}
        testimonials={heroData.testimonials}
        testimonialsTitle={heroData.testimonialsTitle}
        activeSections={heroData.activeSections}
        hasCta={heroData.hasCta}
        logoUrl={heroData.logoUrl}
        customerPortalUrl={heroData.customerPortalUrl}
        footerData={mergedFooterData}
        landing={slug}
        previewBannerOffset={showPreviewBanner ? previewBannerHeight : 0}
      />
    </div>
  );
}

// Main export with Suspense wrapper for useSearchParams
export function LandingPageClient({ slug }: LandingPageClientProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPageClientInner slug={slug} />
    </Suspense>
  );
}

