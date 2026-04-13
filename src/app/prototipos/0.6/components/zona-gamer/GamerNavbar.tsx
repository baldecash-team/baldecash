'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, X, Zap, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';

interface GamerNavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  catalogUrl: string;
  hideSecondaryBar?: boolean;
  fullWidth?: boolean;
}

const NAV_SECTIONS = [
  { id: 'catalogo', label: 'Packs Gamer' },
  { id: 'brands', label: 'Marcas' },
  { id: 'linea-combate', label: 'Series' },
  { id: 'games', label: 'Top Games' },
  { id: 'stories', label: 'Historias Reales' },
];

const LANDING_SLUG = 'zona-gamer';

export function GamerNavbar({ theme, onToggleTheme, catalogUrl, hideSecondaryBar, fullWidth }: GamerNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const landingHome = routes.landingHome(LANDING_SLUG);
  const isOnLanding = pathname === landingHome || pathname === landingHome + '/';

  const isDark = theme === 'dark';
  const V = cssVars(isDark);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <>

      {/* Header */}
      <header
        className="sticky z-[100] backdrop-blur-[20px] border-b"
        style={{
          top: 0,
          height: 64,
          background: isDark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.92)',
          borderColor: V.border,
        }}
      >
        <div className={`${fullWidth ? '' : 'max-w-[1280px] mx-auto'} px-6 w-full flex items-center justify-between h-full`}>
        {/* header-left */}
        <div className="flex items-center">
          <a href={routes.landingHome('zona-gamer')} className="flex items-center gap-2 no-underline">
            <Image
              src="/images/zona-gamer/logo baldecash/LOGO OFI.png"
              alt="BaldeCash"
              width={140}
              height={32}
              className="object-contain"
              style={{ height: 30 }}
            />
            <span
              className="gaming-badge-blink"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                color: V.neonRed,
                background: 'rgba(255,32,64,0.08)',
                border: '1px solid rgba(255,32,64,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: 2,
                textTransform: 'uppercase',
                animation: 'gamingBlink 2s ease-in-out infinite',
              }}
            >
              GAMING
            </span>
            <style>{`
              @keyframes gamingBlink {
                0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(255,0,85,0.2); }
                50% { opacity: 0.4; box-shadow: 0 0 0 rgba(255,0,85,0); }
              }
            `}</style>
          </a>
        </div>

        {/* header-nav */}
        <nav className="hidden md:flex items-center" style={{ gap: 28, fontSize: 14 }}>
          {/* Catálogo — always a link */}
          <a
            href={catalogUrl}
            className="no-underline transition-colors"
            style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
          >
            Catálogo
          </a>
          {/* Landing sections — scroll if on landing, link if not */}
          {NAV_SECTIONS.map((item) =>
            isOnLanding ? (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="bg-transparent border-none cursor-pointer no-underline transition-colors p-0"
                style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.id}
                href={`${landingHome}#${item.id}`}
                className="no-underline transition-colors"
                style={{ color: isDark ? '#fff' : '#333', fontSize: 14, fontWeight: 400, fontFamily: "'Rajdhani', sans-serif" }}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* header-right */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {/* zona-estudiantes */}
          <a
            href="#"
            className="hidden md:flex items-center no-underline transition-all"
            style={{
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: V.neonPurple,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
            }}
          >
            <User className="w-3.5 h-3.5" />
            Zona Gamers
          </a>

          {/* theme-toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center cursor-pointer transition-all relative"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: V.bgSurface,
              border: `1px solid ${V.border}`,
              color: isDark ? '#fff' : '#555',
            }}
            title="Cambiar tema"
          >
            {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>

          {/* hamburger-btn (mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="hidden max-md:flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${V.border}`,
              color: V.textSecondary,
            }}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        </div>{/* close max-w container */}
      </header>

      {/* Secondary Navbar */}
      {!hideSecondaryBar && <div
        className="sticky z-[99] border-b backdrop-blur-[20px]"
        style={{
          top: 64,
          background: isDark ? 'rgba(14,14,14,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: V.border,
        }}
      >
        <div className={`${fullWidth ? '' : 'max-w-[1280px] mx-auto'} px-6 flex items-center justify-between h-14 gap-4`}>
          <div className="flex-1 flex justify-center">
            <div
              className="flex items-center w-[600px] max-w-full h-10 px-3 rounded-xl border-2 transition-all focus-within:border-[rgba(70,84,205,0.5)]"
              style={{
                background: V.bgSurface,
                borderColor: 'rgba(70,84,205,0.2)',
              }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? '#fff' : '#999' }} />
              <input
                type="text"
                placeholder="Buscar equipos..."
                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
                style={{
                  color: isDark ? '#fff' : '#333',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '0.5px',
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:border-[#6366f1] hover:text-[#6366f1]"
              style={{
                background: V.bgSurface,
                borderColor: V.border,
                color: isDark ? '#fff' : '#555',
              }}
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-28 px-4 flex flex-col gap-0 backdrop-blur-[20px]"
          style={{
            background: isDark ? 'rgba(12,12,12,0.98)' : 'rgba(255,255,255,0.98)',
            borderTop: `1px solid ${V.border}`,
          }}
        >
          {/* Catálogo link */}
          <a
            href={catalogUrl}
            className="block w-full text-left py-3 text-[15px] font-semibold no-underline transition-colors hover:text-[#00ffd5]"
            style={{ color: V.neonCyan, fontFamily: "'Rajdhani', sans-serif", borderBottom: `1px solid ${V.border}` }}
          >
            Catálogo
          </a>
          {/* Landing sections */}
          {NAV_SECTIONS.map((item, i) =>
            isOnLanding ? (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-3 text-[15px] font-semibold bg-transparent border-none cursor-pointer transition-colors hover:text-[#00ffd5]"
                style={{ color: V.textSecondary, fontFamily: "'Rajdhani', sans-serif", borderBottom: i < NAV_SECTIONS.length - 1 ? `1px solid ${V.border}` : 'none' }}
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.id}
                href={`${landingHome}#${item.id}`}
                className="block w-full text-left py-3 text-[15px] font-semibold no-underline transition-colors hover:text-[#00ffd5]"
                style={{ color: V.textSecondary, fontFamily: "'Rajdhani', sans-serif", borderBottom: i < NAV_SECTIONS.length - 1 ? `1px solid ${V.border}` : 'none' }}
              >
                {item.label}
              </a>
            )
          )}
          <a
            href="#"
            className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl no-underline text-sm font-semibold"
            style={{
              border: '2px solid rgba(0,255,213,0.3)',
              color: V.neonCyan,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            <User className="w-3.5 h-3.5" />
            Zona Gamers
          </a>
        </div>
      )}
    </>
  );
}

function cssVars(isDark: boolean) {
  return {
    bgDarkest: isDark ? '#0e0e0e' : '#f2f2f2',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00897a',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
  };
}
