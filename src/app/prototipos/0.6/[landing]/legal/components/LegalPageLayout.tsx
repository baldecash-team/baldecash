'use client';

/**
 * LegalPageLayout - Layout compartido para páginas legales
 * Usa useLayout() del LayoutContext (no hace fetch propio)
 * El contenido es estático y se pasa como children
 * Soporta tema gamer para landing zona-gamer
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useLayout } from '../../context/LayoutContext';
import { ArrowLeft, Sun, Moon, Zap } from 'lucide-react';

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
  const isGamer = landing === 'zona-gamer';

  useScrollToTop();

  // Gamer theme state — read from localStorage to match landing theme
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);
  useEffect(() => {
    if (!isGamer) return;
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    setTheme(saved || 'dark');
  }, [isGamer]);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('baldecash-theme', next);
  };
  const isDark = theme === 'dark';

  // Wait until theme is read from localStorage before rendering gamer layout
  if (isGamer && theme === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: typeof window !== 'undefined' && localStorage.getItem('baldecash-theme') === 'light' ? '#f2f2f2' : '#0e0e0e' }}>
        <CubeGridSpinner />
      </div>
    );
  }

  // Show loading spinner while fetching
  if (isLoading) {
    if (isGamer) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: typeof window !== 'undefined' && localStorage.getItem('baldecash-theme') === 'light' ? '#f2f2f2' : '#0e0e0e' }}>
          <CubeGridSpinner />
        </div>
      );
    }
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  // ====== GAMER LAYOUT ======
  if (isGamer) {
    const neonCyan = isDark ? '#00ffd5' : '#00897a';
    const border = isDark ? '#2a2a2a' : '#e0e0e0';
    const bgCard = isDark ? '#1a1a1a' : '#ffffff';
    const textPrimary = isDark ? '#f0f0f0' : '#1a1a1a';
    const textSecondary = isDark ? '#a0a0a0' : '#555';
    const textMuted = isDark ? '#707070' : '#888';

    return (
      <div style={{ minHeight: '100vh', background: isDark ? '#0e0e0e' : '#f2f2f2', color: textPrimary, fontFamily: "'Rajdhani', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;500;600;700&display=swap');
        `}</style>

        {/* Header — shared GamerNavbar */}
        <GamerNavbar
          theme={theme || 'dark'}
          onToggleTheme={toggleTheme}
          catalogUrl={routes.catalogo(landing)}
          hideSecondaryBar
        />

        {/* Main Content */}
        <main style={{ maxWidth: 896, margin: '0 auto', padding: '40px 16px 64px' }}>
          {/* Header */}
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '5px 14px', borderRadius: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: neonCyan, background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(14,148,133,0.06)', border: `1px solid ${isDark ? 'rgba(0,255,213,0.12)' : 'rgba(14,148,133,0.15)'}` }}>
              <Zap size={14} />
              LEGAL
            </div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1, letterSpacing: 1, marginBottom: 8,
              backgroundImage: isDark ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {title}
            </h1>
            {lastUpdated && (
              <p style={{ fontSize: 13, color: textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content with gamer overrides */}
          <style>{`
            .gamer-legal-content p { color: ${isDark ? '#ccc' : '#444'}; font-size: 14px; line-height: 1.7; }
            .gamer-legal-content ul { color: ${isDark ? '#ccc' : '#444'}; }
            .gamer-legal-content li { color: ${isDark ? '#ccc' : '#444'}; }
            .gamer-legal-content strong { color: ${textPrimary}; }
            .gamer-legal-content h3[class],
            .gamer-legal-content h3 { color: ${neonCyan} !important; font-family: 'Rajdhani', sans-serif !important; font-weight: 700 !important; font-size: 18px !important; }
            .gamer-legal-content h4[class],
            .gamer-legal-content h4 { color: ${textPrimary} !important; }
            .gamer-legal-content [class*="text-neutral-800"] { color: ${textPrimary} !important; }
            .gamer-legal-content [class*="text-neutral-900"] { color: ${neonCyan} !important; }
            .gamer-legal-content [class*="font-semibold"] { font-weight: 700 !important; }
            .gamer-legal-content section { border-bottom: 1px solid ${border}; padding-bottom: 24px; margin-bottom: 24px; }
            .gamer-legal-content .text-neutral-900 { color: ${textPrimary} !important; }
            .gamer-legal-content .text-neutral-600 { color: ${isDark ? '#ccc' : '#444'} !important; }
            .gamer-legal-content .text-neutral-500 { color: ${textMuted} !important; }
            .gamer-legal-content .border-neutral-200 { border-color: ${border} !important; }
          `}</style>
          <div className="gamer-legal-content max-w-none">
            {children}
          </div>
        </main>

        <GamerFooter theme={theme || 'dark'} />
      </div>
    );
  }

  // ====== DEFAULT LAYOUT ======
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
