'use client';

/**
 * LandingPageClient - Client component con fetch en runtime
 * Permite ver requests en Network tab y datos siempre frescos
 *
 * Soporta preview mode via postMessage desde el admin
 */

import { useEffect, useState, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '../components/hero/HeroSection';
import { DniModal, hasSavedDni } from '../components/hero/DniModal';
import { ZonaGamerLanding } from '../components/zona-gamer/ZonaGamerLanding';
import { fetchHeroData } from '../services/landingApi';
import { usePreviewListener } from '../hooks/usePreviewListener';
import { usePreview } from '../context/PreviewContext';
import { NotFoundContent } from '../components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { HomeSkeleton } from './HomeSkeleton';
import { SessionProvider } from '../[landing]/solicitar/context/SessionContext';
import { EventTrackerProvider } from '../[landing]/solicitar/context/EventTrackerContext';
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData, BenefitsData, AgreementData } from '../types/hero';

// Slugs que activan el modal de DNI al cargar la landing
const DNI_MODAL_SLUGS = ['liderman-baldecash'];

interface LandingPageClientProps {
  slug: string;
  initialData?: HeroData | null;
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
  portalButtonText?: string;
  footerData: FooterData | null;
  benefitsData: BenefitsData | null;
  agreementData: AgreementData | null;
  primaryColor?: string;
  secondaryColor?: string;
}

// Wrapper component to handle Suspense for useSearchParams
function LandingPageClientInner({ slug, initialData }: LandingPageClientProps) {
  // Zona Gamer: landing 100% estática, sin fetch a la API
  if (slug === 'zona-gamer') {
    return <ZonaGamerLanding />;
  }

  const searchParams = useSearchParams();
  const [heroData, setHeroData] = useState<HeroData | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Preview mode from query param (?preview=true)
  const isPreviewParam = searchParams.get('preview') === 'true';

  // Preview mode listener - receives live updates from admin
  const { previewData, isPreviewMode } = usePreviewListener();

  // SessionStorage preview mode (from /preview/:id page navigation)
  const preview = usePreview();
  const isPreviewHydrated = preview.isHydrated;
  const previewKey = preview.isPreviewingLanding(slug) ? preview.previewKey : null;

  // Track if server initialData has been consumed to avoid skipping re-fetches on SPA nav
  const initialDataConsumed = useRef(false);

  useEffect(() => {
    // If we have server-provided data, use it immediately for the first render
    if (initialData && !initialDataConsumed.current) {
      initialDataConsumed.current = true;

      // If not in preview mode, server data is sufficient — no client fetch needed
      if (!isPreviewParam && !isPreviewMode) {
        // Wait for preview hydration to confirm no sessionStorage preview either
        if (!isPreviewHydrated) return;
        if (!previewKey) return; // No preview — server data is final
      }
    }

    // For preview mode or missing initialData: wait for hydration then fetch
    if (!isPreviewHydrated) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchHeroData(slug, isPreviewParam || isPreviewMode, previewKey);

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
  }, [slug, isPreviewParam, isPreviewMode, isPreviewHydrated, previewKey, initialData]);

  // Merge API data with preview data (preview takes priority)
  const mergedHeroContent = useMemo((): HeroContent | null => {
    if (!heroData?.heroContent) return null;

    // If no preview data, return original
    if (!previewData?.hero) return heroData.heroContent;

    const preview = previewData.hero;

    return {
      ...heroData.heroContent,
      // Override with preview data if present (using correct property names)
      // Use || instead of ?? so empty strings fall through to API/fallback values
      headline: preview.title || heroData.heroContent.headline,
      subheadline: preview.subtitle || heroData.heroContent.subheadline,
      primaryCta: preview.ctaText
        ? { ...heroData.heroContent.primaryCta, text: preview.ctaText, href: preview.ctaUrl || heroData.heroContent.primaryCta.href }
        : heroData.heroContent.primaryCta,
      backgroundImage: preview.backgroundUrl || heroData.heroContent.backgroundImage,
      minQuota: preview.minQuota ?? heroData.heroContent.minQuota,
      badgeText: preview.badgeText || heroData.heroContent.badgeText,
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
      studyCenters: preview.institutions
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
        : heroData.socialProof.studyCenters,
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
    if (!isLoading && heroData && typeof window !== 'undefined') {
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
  }, [isLoading, heroData]);

  // DNI modal state - solo para slugs configurados y si no hay DNI guardado
  const showDniFeature = DNI_MODAL_SLUGS.includes(slug);
  const [isDniModalOpen, setIsDniModalOpen] = useState(false);

  useEffect(() => {
    if (showDniFeature && !isLoading && heroData) {
      // Verificar si ya tiene DNI guardado (solo en cliente)
      if (!hasSavedDni(slug)) {
        setIsDniModalOpen(true);
      }
    }
  }, [showDniFeature, slug, isLoading, heroData]);

  const handleDniModalClose = useCallback(() => {
    setIsDniModalOpen(false);
  }, []);

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

  // Loading state
  if (isLoading) {
    return <HomeSkeleton />;
  }

  // Error state - usar componente 404 con branding
  if (error || !heroData) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  // Show preview banner if in preview mode (postMessage, query param, or sessionStorage)
  const showPreviewBanner = isPreviewMode || isPreviewParam || !!previewKey;
  // Preview banner height in pixels (py-1 = 4px top + 4px bottom + ~16px text = ~24px)
  const previewBannerHeight = 24;

  return (
    <div
      style={{
        '--color-primary': heroData.primaryColor || '#4654CD',
        '--color-secondary': heroData.secondaryColor || '#03DBD0',
      } as React.CSSProperties}
    >
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
        portalButtonText={heroData.portalButtonText}
        footerData={mergedFooterData}
        benefitsData={heroData.benefitsData}
        agreementData={heroData.agreementData}
        landing={slug}
        previewBannerOffset={showPreviewBanner ? previewBannerHeight : 0}
        previewKey={previewKey}
        primaryColor={heroData.primaryColor}
      />

      {/* Modal DNI - Feature personalizado para landings configuradas */}
      {showDniFeature && (
        <DniModal
          landingSlug={slug}
          isOpen={isDniModalOpen}
          onClose={handleDniModalClose}
        />
      )}
    </div>
  );
}

// Main export with Suspense wrapper + tracking providers
export function LandingPageClient({ slug, initialData }: LandingPageClientProps) {
  return (
    <SessionProvider landingSlug={slug}>
      <EventTrackerProvider>
        <Suspense fallback={<HomeSkeleton />}>
          <LandingPageClientInner slug={slug} initialData={initialData} />
        </Suspense>
      </EventTrackerProvider>
    </SessionProvider>
  );
}

