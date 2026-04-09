'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Moon, Sun, Menu, X, Zap, Search, Heart, ShoppingCart, User } from 'lucide-react';

interface GamerNavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  catalogUrl: string;
}

export function GamerNavbar({ theme, onToggleTheme, catalogUrl }: GamerNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  const isDark = theme === 'dark';
  const V = cssVars(isDark);

  return (
    <>
      {/* Top Banner */}
      {bannerVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] text-white text-center"
          style={{ background: `linear-gradient(to right, ${V.neonPurple}, ${V.neonPurple})`, padding: '10px 16px', fontSize: 14 }}
        >
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 relative">
            <Zap className="w-4 h-4 shrink-0" style={{ color: V.neonCyan }} />
            <span>
              <strong>Oferta especial:</strong> 0% interés en tu primera cuota
              <a href={catalogUrl} className="text-white font-semibold underline underline-offset-2 ml-2 hover:no-underline hidden sm:inline">
                Ver más
              </a>
            </span>
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute right-0 p-1.5 bg-transparent border-none text-white cursor-pointer rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="sticky z-[100] flex items-center justify-between backdrop-blur-[20px] border-b"
        style={{
          top: bannerVisible ? 40 : 0,
          height: 64,
          padding: '0 16px',
          background: isDark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.92)',
          borderColor: V.border,
        }}
      >
        {/* header-left */}
        <div className="flex items-center">
          <a href="#" className="flex items-center gap-2 no-underline">
            {/* Dark logo */}
            <Image
              src="/images/zona-gamer/logo-dark.png"
              alt="BaldeCash"
              width={120}
              height={48}
              className="object-contain"
              style={{ height: 48, display: isDark ? 'block' : 'none' }}
            />
            {/* Light logo */}
            <Image
              src="/images/zona-gamer/logo-light.png"
              alt="BaldeCash"
              width={120}
              height={48}
              className="object-contain"
              style={{ height: 48, display: isDark ? 'none' : 'block' }}
            />
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 8,
                fontWeight: 700,
                color: V.neonRed,
                background: 'rgba(255,32,64,0.08)',
                border: '1px solid rgba(255,32,64,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              GAMING
            </span>
          </a>
        </div>

        {/* header-nav */}
        <nav className="hidden md:flex items-center" style={{ gap: 28, fontSize: 14, fontWeight: 500 }}>
          <a
            href={catalogUrl}
            className="relative no-underline transition-colors"
            style={{ color: isDark ? '#fff' : '#333' }}
          >
            Equipos
            <span
              className="absolute"
              style={{
                top: -10,
                right: -8,
                fontSize: 10,
                fontWeight: 700,
                color: '#fff',
                background: V.neonCyan,
                padding: '0 4px',
                borderRadius: 4,
                lineHeight: '16px',
              }}
            >
              NUEVO
            </span>
          </a>
          <a href="#" className="no-underline transition-colors" style={{ color: isDark ? '#fff' : '#333' }}>Convenios</a>
          <a href="#" className="no-underline transition-colors" style={{ color: isDark ? '#fff' : '#333' }}>Ver requisitos</a>
          <a href="#" className="no-underline transition-colors" style={{ color: isDark ? '#fff' : '#333' }}>¿Tienes dudas?</a>
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
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
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
      </header>

      {/* Secondary Navbar */}
      <div
        className="sticky z-[99] border-b backdrop-blur-[20px]"
        style={{
          top: bannerVisible ? 104 : 64,
          background: isDark ? 'rgba(14,14,14,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: V.border,
          padding: '0 24px',
        }}
      >
        <div className="flex items-center justify-between h-14 gap-4">
          <div className="w-24 shrink-0" />
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
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer transition-all hover:border-[#6366f1] hover:text-[#6366f1]"
              style={{
                background: V.bgSurface,
                borderColor: V.border,
                color: isDark ? '#fff' : '#555',
              }}
              title="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-28 px-4 flex flex-col gap-0 backdrop-blur-[20px]"
          style={{
            background: isDark ? 'rgba(12,12,12,0.98)' : 'rgba(255,255,255,0.98)',
            borderTop: `1px solid ${V.border}`,
          }}
        >
          {['Equipos', 'Convenios', 'Ver requisitos', '¿Tienes dudas?'].map((label, i) => (
            <a
              key={label}
              href={i === 0 ? catalogUrl : '#'}
              className="block py-3 text-[15px] font-semibold no-underline transition-colors hover:text-[#00ffd5]"
              style={{
                color: V.textSecondary,
                fontFamily: "'Rajdhani', sans-serif",
                borderBottom: i < 3 ? `1px solid ${V.border}` : 'none',
              }}
            >
              {label}
            </a>
          ))}
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
    neonCyan: isDark ? '#00ffd5' : '#00b396',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    neonRed: '#ff0055',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
  };
}
