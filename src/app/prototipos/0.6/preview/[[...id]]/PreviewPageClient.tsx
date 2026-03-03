'use client';

/**
 * PreviewPageClient - Client component for landing preview
 * Handles both path-based IDs (/preview/16) and query param IDs (/preview?id=16)
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '../../components/hero/HeroSection';
import { getLandingHeroDataById, transformLandingData } from '../../services/landingApi';
import { usePreviewListener } from '../../hooks/usePreviewListener';
import { NotFoundContent } from '../../components/NotFoundContent';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData } from '../../types/hero';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

interface PreviewPageClientProps {
  pathId: string | null;
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
  slug?: string;
}

function PreviewPageClientInner({ pathId }: PreviewPageClientProps) {
  const searchParams = useSearchParams();
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [landingSlug, setLandingSlug] = useState<string>('preview');

  // Get ID from path param first, then fall back to query param
  const queryId = searchParams.get('id');
  const idString = pathId || queryId;
  const landingId = idString ? parseInt(idString, 10) : NaN;
  const isValidId = !isNaN(landingId) && landingId > 0;

  // Preview key from query param (?preview_key=xxx)
  const previewKey = searchParams.get('preview_key');
  const hasPreviewKey = !!previewKey;

  // Preview mode listener - receives live updates from admin
  const { previewData, isPreviewMode } = usePreviewListener();

  // Preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isValidId) {
      setIsLoading(false);
      setError('ID de landing no válido');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use preview_key for secure preview access
        const rawData = await getLandingHeroDataById(landingId, previewKey);

        if (!rawData) {
          setError('Landing no encontrada');
          return;
        }

        // Transform the raw API data
        const data = transformLandingData(rawData);
        setHeroData(data);
        // Store the slug from the API response for routing
        setLandingSlug(rawData.landing.slug || 'preview');
      } catch (err) {
        console.error('[Preview] Error fetching landing data by ID:', err);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [landingId, previewKey, isValidId]);

  // Merge API data with preview data (preview takes priority)
  const mergedHeroContent = useMemo((): HeroContent | null => {
    if (!heroData?.heroContent) return null;
    if (!previewData?.hero) return heroData.heroContent;

    const preview = previewData.hero;
    return {
      ...heroData.heroContent,
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
    if (!isLoading && !isPageLoading && heroData && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
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

  // Set CSS variables on :root
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

  if (isPageLoading || isLoading) {
    return <LoadingFallback />;
  }

  if (error || !heroData || !isValidId) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  const showPreviewBanner = isPreviewMode || hasPreviewKey;
  const previewBannerHeight = 24;

  return (
    <div
      style={{
        '--color-primary': heroData.primaryColor || '#4654CD',
        '--color-secondary': heroData.secondaryColor || '#03DBD0',
      } as React.CSSProperties}
    >
      {showPreviewBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs text-center py-1 font-medium">
          Modo Preview (ID: {landingId}) - Los cambios se muestran en tiempo real
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
        landing={landingSlug}
        previewBannerOffset={showPreviewBanner ? previewBannerHeight : 0}
      />
    </div>
  );
}

export function PreviewPageClient({ pathId }: PreviewPageClientProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PreviewPageClientInner pathId={pathId} />
    </Suspense>
  );
}
