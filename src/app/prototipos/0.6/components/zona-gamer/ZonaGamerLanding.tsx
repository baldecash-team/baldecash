'use client';

import { useState, useEffect } from 'react';
import { GamerNavbar } from './GamerNavbar';
import { GamerHero } from './GamerHero';
import { GamerPacks } from './GamerPacks';
import { GamerBrands } from './GamerBrands';
import { GamerSeries } from './GamerSeries';
import { GamerGamesRanking } from './GamerGamesRanking';
import { GamerStories } from './GamerStories';
import { GamerCta } from './GamerCta';
import { GamerNewsletter, type GamerNewsletterData } from './GamerNewsletter';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { LazySection } from './LazySection';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { getLandingLayout, getFooterData } from '@/app/prototipos/0.6/services/landingApi';
import type { PromoBannerData } from '@/app/prototipos/0.6/types/hero';
import type { FooterData } from '@/app/prototipos/0.6/types/hero';

const LANDING_SLUG = 'zona-gamer';

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap';

export function ZonaGamerLanding() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [portalButtonText, setPortalButtonText] = useState<string | undefined>(undefined);
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | undefined>(undefined);
  const [promoBannerData, setPromoBannerData] = useState<PromoBannerData | null>(null);
  const [newsletterData, setNewsletterData] = useState<GamerNewsletterData | null>(null);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    getFooterData(LANDING_SLUG).then((data) => { if (data) setFooterData(data); });
    getLandingLayout(LANDING_SLUG).then((layout) => {
      if (!layout) return;
      const navbarConfig = layout.navbar?.content_config as Record<string, unknown> | undefined;
      setPortalButtonText((navbarConfig?.portal_button_text as string) || undefined);
      setCustomerPortalUrl((layout.company?.customer_portal_url as string) || undefined);
      const promoConfig = layout.promo_banner?.content_config as Record<string, unknown> | undefined;
      if (promoConfig && (promoConfig.text || promoConfig.highlight) && promoConfig.is_visible !== false) {
        setPromoBannerData({
          text: (promoConfig.text as string) || '',
          highlight: (promoConfig.highlight as string) || undefined,
          ctaText: (promoConfig.cta_text as string) || undefined,
          ctaUrl: (promoConfig.cta_url as string) || undefined,
          dismissible: (promoConfig.dismissible as boolean) ?? true,
        });
      }
      const footerNl = (layout.footer?.content_config as Record<string, unknown> | undefined)?.newsletter as Record<string, unknown> | undefined;
      if (footerNl && footerNl.enabled !== false) {
        setNewsletterData({
          title: (footerNl.title as string) || undefined,
          subtitle: (footerNl.description as string) || undefined,
          button_text: (footerNl.button_text as string) || undefined,
          placeholder: (footerNl.placeholder as string) || undefined,
        });
      }
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('baldecash-zona-gamer-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  // Siempre mostrar el hero al entrar al index (scroll top al montar)
  // EXCEPTO cuando el URL trae un hash (#catalogo, #series, etc.), para no romper deep-links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const tracker = useEventTrackerOptional();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    tracker?.track('view_mode_change', { mode: next, source: 'zona_gamer_landing' });
    setTheme(next);
    localStorage.setItem('baldecash-zona-gamer-theme', next);
  };

  const catalogUrl = routes.catalogo(LANDING_SLUG);

  // Load Google Fonts via DOM to avoid Next.js <link> hoisting issues
  useEffect(() => {
    const id = 'zona-gamer-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <style>{`
        .zona-gamer-landing {
          font-family: 'Rajdhani', sans-serif;
        }
        .zona-gamer-landing button,
        .zona-gamer-landing input,
        .zona-gamer-landing a,
        .zona-gamer-landing span,
        .zona-gamer-landing p,
        .zona-gamer-landing h1,
        .zona-gamer-landing h2,
        .zona-gamer-landing h3,
        .zona-gamer-landing h4,
        .zona-gamer-landing div,
        .zona-gamer-landing li,
        .zona-gamer-landing nav {
          font-family: inherit;
        }
        .zona-gamer-landing .accent {
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          color: transparent !important;
        }
      `}</style>
      <div
        data-theme={theme}
        className="zona-gamer-landing min-h-screen antialiased"
        style={{
          background: theme === 'dark' ? '#0e0e0e' : '#f2f2f2',
          color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a',
          lineHeight: 1.5,
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="fixed inset-0 z-[-2] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(99,102,241,0.03), transparent 70%)',
          }}
        />

        <GamerNavbar theme={theme} onToggleTheme={toggleTheme} catalogUrl={catalogUrl} hideSecondaryBar portalButtonText={portalButtonText} customerPortalUrl={customerPortalUrl} promoBannerData={promoBannerData} />
        {/* Spacer to compensate for fixed navbar */}
        <div style={{ height: 'var(--gamer-nav-height, clamp(52px,10vw,64px))' }} />
        <GamerHero theme={theme} catalogUrl={catalogUrl} />
        <GamerPacks theme={theme} catalogUrl={catalogUrl} />

        <LazySection minHeight={400}>
          <GamerBrands theme={theme} />
        </LazySection>

        <LazySection minHeight={500}>
          <GamerSeries theme={theme} />
        </LazySection>

        <LazySection minHeight={400}>
          <GamerGamesRanking theme={theme} />
        </LazySection>

        {/* TODO: activar cuando haya testimonios reales configurados en BD
        <LazySection minHeight={400}>
          <GamerStories theme={theme} />
        </LazySection>
        */}

        <GamerCta theme={theme} catalogUrl={catalogUrl} />
        <GamerNewsletter theme={theme} data={newsletterData} />

        <LazySection minHeight={300}>
          <div id="footer">
            <Footer theme="gamer" gamerTheme={theme} data={footerData} landing={LANDING_SLUG} />
          </div>
        </LazySection>
      </div>
    </>
  );
}

