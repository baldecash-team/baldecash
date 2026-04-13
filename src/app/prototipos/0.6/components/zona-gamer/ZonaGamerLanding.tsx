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
import { GamerNewsletter } from './GamerNewsletter';
import { GamerFooter } from './GamerFooter';
import { routes } from '@/app/prototipos/0.6/utils/routes';

const LANDING_SLUG = 'zona-gamer';

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap';

export function ZonaGamerLanding() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('baldecash-theme', next);
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
        @import url('${GOOGLE_FONTS_URL}');
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

        <GamerNavbar theme={theme} onToggleTheme={toggleTheme} catalogUrl={catalogUrl} hideSecondaryBar />
        <GamerHero theme={theme} catalogUrl={catalogUrl} />
        <GamerPacks theme={theme} catalogUrl={catalogUrl} />
        <GamerBrands theme={theme} />
        <GamerSeries theme={theme} />
        <GamerGamesRanking theme={theme} />
        <GamerStories theme={theme} />
        <GamerCta theme={theme} catalogUrl={catalogUrl} />
        <GamerNewsletter theme={theme} />
        <GamerFooter theme={theme} />
      </div>
    </>
  );
}
