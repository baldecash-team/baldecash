'use client';

/**
 * Proximamente - BaldeCash v0.6
 * Pagina generica para secciones en desarrollo
 * Usa useLayout() para obtener navbar y footer del landing
 * Contenido de secciones viene de la API (coming_soon_sections)
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import {
  Construction,
  ArrowLeft,
  Bell,
  Package,
  Shield,
  Percent,
  Users,
  Handshake,
  Briefcase,
  Newspaper,
  HelpCircle,
  MessageCircleQuestion,
  MessageCircle,
  Search,
  Mail,
  Scale,
  LucideIcon
} from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { LANDING_IDS } from '@/app/prototipos/0.6/utils/landingIds';
import { useLayout } from '../context/LayoutContext';
import { getComingSoonContent, ComingSoonSection } from '@/app/prototipos/0.6/services/landingApi';

// Mapeo de iconos string a componentes
const iconMap: Record<string, LucideIcon> = {
  Construction,
  Package,
  Shield,
  Percent,
  Users,
  Handshake,
  Briefcase,
  Newspaper,
  HelpCircle,
  MessageCircleQuestion,
  Search,
  Mail,
  Scale,
};

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Construction;
}

function LoadingFallback() {
  const [bg, setBg] = useState<string | null>(null);
  useEffect(() => {
    if (window.location.pathname.includes('zona-gamer')) {
      const saved = localStorage.getItem('baldecash-theme');
      setBg(saved === 'light' ? '#f2f2f2' : '#0e0e0e');
    } else {
      setBg('#fafafa');
    }
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bg || '#0e0e0e' }} suppressHydrationWarning>
      <CubeGridSpinner />
    </div>
  );
}

function ProximamenteContent() {
  const searchParams = useSearchParams();
  const seccion = searchParams.get('seccion') || '';
  const { navbarProps, footerData, agreementData, landingId, isLoading, hasError, landing } = useLayout();
  const isGamer = landingId === LANDING_IDS.ZONA_GAMER;

  // Gamer theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [themeHydrated, setThemeHydrated] = useState(false);
  useEffect(() => {
    if (!isGamer) { setThemeHydrated(true); return; }
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setThemeHydrated(true);
  }, [isGamer]);
  useEffect(() => {
    if (themeHydrated && isGamer) localStorage.setItem('baldecash-theme', theme);
  }, [theme, themeHydrated, isGamer]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  const [sections, setSections] = useState<ComingSoonSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useScrollToTop();

  // Fetch coming soon content from API
  useEffect(() => {
    async function fetchSections() {
      setSectionsLoading(true);
      try {
        const data = await getComingSoonContent(landing);
        setSections(data);
      } catch (error) {
        console.error('Error fetching coming soon sections:', error);
      } finally {
        setSectionsLoading(false);
      }
    }

    if (landing) {
      fetchSections();
    }
  }, [landing]);

  // Find the current section content from API data
  const contenido = useMemo(() => {
    // First try to find the exact section
    const found = sections.find(s => s.section_key === seccion);
    if (found) {
      return {
        titulo: found.title,
        descripcion: found.description,
        icon: found.icon,
      };
    }

    // Try to find the default section
    const defaultSection = sections.find(s => s.section_key === 'default');
    if (defaultSection) {
      return {
        titulo: defaultSection.title,
        descripcion: defaultSection.description,
        icon: defaultSection.icon,
      };
    }

    // Ultimate fallback (only if API fails completely)
    return {
      titulo: 'Esta seccion',
      descripcion: 'Estamos trabajando en este contenido.',
      icon: 'Construction',
    };
  }, [sections, seccion]);

  const IconComponent = getIconComponent(contenido.icon);

  // Show loading spinner while fetching
  if (isLoading || sectionsLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  if (isGamer) {
    const neonCyan = isDark ? '#00ffd5' : '#00897a';
    const neonPurple = isDark ? '#a855f7' : '#7c3aed';
    const border = isDark ? '#2a2a2a' : '#e0e0e0';
    const bgCard = isDark ? '#1a1a1a' : '#ffffff';
    const textPrimary = isDark ? '#f0f0f0' : '#1a1a1a';
    const textMuted = isDark ? '#707070' : '#888';
    const btnText = isDark ? '#0a0a0a' : '#ffffff';
    const cyanAlpha = (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,137,122,${a})`;

    return (
      <div style={{ minHeight: '100vh', background: isDark ? '#0e0e0e' : '#f2f2f2', color: textPrimary, fontFamily: "'Rajdhani', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px ${cyanAlpha(0.15)}, 0 0 60px ${cyanAlpha(0.05)}; } 50% { box-shadow: 0 0 30px ${cyanAlpha(0.25)}, 0 0 80px ${cyanAlpha(0.1)}; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        `}</style>
        <GamerNavbar theme={theme} onToggleTheme={toggleTheme} catalogUrl={routes.catalogo(landing)} hideSecondaryBar />
        <main style={{ paddingTop: 24 }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">

            {/* Icon — animated floating with glow */}
            <div style={{
              width: 88, height: 88, borderRadius: 20,
              background: isDark
                ? 'linear-gradient(135deg, rgba(0,255,213,0.12) 0%, rgba(168,85,247,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(0,137,122,0.1) 0%, rgba(124,58,237,0.06) 100%)',
              border: `1px solid ${cyanAlpha(0.2)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              animation: 'pulse-glow 3s ease-in-out infinite, float 4s ease-in-out infinite',
            }}>
              <IconComponent size={40} style={{ color: neonCyan }} />
            </div>

            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 4, marginBottom: 16,
              fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: neonCyan,
              background: cyanAlpha(0.06),
              border: `1px solid ${cyanAlpha(0.15)}`,
            }}>
              <Construction size={12} />
              EN DESARROLLO
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(32px, 6vw, 48px)',
              lineHeight: 1.05, letterSpacing: 1, marginBottom: 12,
              backgroundImage: isDark
                ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Estamos trabajando en esto
            </h1>

            {/* Section badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 999,
              background: cyanAlpha(0.08),
              border: `1px solid ${cyanAlpha(0.15)}`,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: neonCyan, fontFamily: "'Rajdhani', sans-serif" }}>
                {contenido.titulo}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: 15, color: textMuted, maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.7 }}>
              {contenido.descripcion}
            </p>

            {/* Back button */}
            <button
              onClick={() => window.location.href = routes.landingHome(landing)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 32px', borderRadius: 12,
                background: neonCyan, color: btnText,
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                boxShadow: `0 0 20px ${cyanAlpha(0.3)}, 0 4px 12px ${cyanAlpha(0.2)}`,
                transition: 'all 0.2s',
              }}
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </button>

            {/* Cards container */}
            <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* WhatsApp card */}
              <div style={{
                padding: 18, background: bgCard, borderRadius: 14,
                border: `1px solid ${border}`, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isDark ? 'rgba(37,211,102,0.1)' : 'rgba(37,211,102,0.08)',
                    border: `1px solid ${isDark ? 'rgba(37,211,102,0.15)' : 'rgba(37,211,102,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <MessageCircle size={20} style={{ color: '#25D366' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: textPrimary }}>¿Tienes alguna consulta?</p>
                    <p style={{ fontSize: 13, color: textMuted, margin: '0 0 12px' }}>Nuestro equipo está disponible para ayudarte.</p>
                    <a
                      href="https://wa.link/osgxjf"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10,
                        background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      <MessageCircle size={14} />
                      Escríbenos por WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Email card */}
              <div style={{
                padding: 18, background: bgCard, borderRadius: 14,
                border: `1px solid ${border}`, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: cyanAlpha(0.08),
                    border: `1px solid ${cyanAlpha(0.15)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mail size={20} style={{ color: neonCyan }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: textPrimary }}>También puedes escribirnos</p>
                    <a href="mailto:prestamos@baldecash.com" style={{ fontSize: 13, color: neonCyan, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      prestamos@baldecash.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <GamerNewsletter theme={theme} />
        <GamerFooter theme={theme} />
      </div>
    );
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

      {/* Main Content — padding-top driven by --header-total-height so it
          adapts to preview banner + promo banner + navbar dynamically. */}
      <main
        className="flex-1 pb-12 sm:pb-16 md:pb-24 flex items-center justify-center"
        style={{ paddingTop: 'calc(var(--header-total-height, 6.5rem) + 2rem)' }}
      >
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          {/* Icon */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-primary, #4654CD)' }} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 font-['Baloo_2',_sans-serif] leading-tight mb-3">
            Estamos trabajando en esto
          </h1>

          {/* Section name — chip degrades gracefully with long titles */}
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 max-w-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <span
              className="text-xs sm:text-sm font-medium break-words"
              style={{ color: 'var(--color-primary, #4654CD)' }}
            >
              {contenido.titulo}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-neutral-500 leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto px-2">
            {contenido.descripcion}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as="a"
              href={routes.landingHome(landing)}
              size="lg"
              radius="lg"
              className="w-full sm:w-auto text-white font-semibold px-6"
              style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-8 sm:mt-12 p-3 sm:p-4 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 text-sm">¿Tienes alguna consulta?</p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-3 break-words">
                  Nuestro equipo está disponible para ayudarte.
                </p>
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-[#25D366] text-white font-semibold cursor-pointer"
                  startContent={<MessageCircle className="w-4 h-4 flex-shrink-0" />}
                  onPress={() => window.open('https://wa.link/osgxjf', '_blank', 'noopener,noreferrer')}
                >
                  Escríbenos por WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Email info */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 text-sm">También puedes escribirnos</p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  <a
                    href="mailto:prestamos@baldecash.com"
                    className="underline decoration-dotted underline-offset-2 hover:decoration-solid break-all"
                    style={{ color: 'var(--color-primary, #4654CD)' }}
                  >
                    prestamos@baldecash.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
    </div>
  );
}

export function ProximamenteClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProximamenteContent />
    </Suspense>
  );
}
