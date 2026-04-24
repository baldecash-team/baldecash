'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { type GamerTheme } from './gamerTheme';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { ZONA_GAMER_ASSETS } from '@/app/prototipos/0.6/utils/assets';

export function GamerCatalogHeader({
  isDark,
  T,
  theme,
  onToggleTheme,
  searchQuery,
  onSearch,
  wishlistCount,
  cartCount,
  landing,
  navbarItems,
  customerPortalUrl,
  portalButtonText,
  onOpenWishlist,
}: {
  isDark: boolean;
  T: GamerTheme;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  wishlistCount: number;
  cartCount: number;
  landing: string;
  navbarItems: { label: string; href: string; section: string | null; has_megamenu?: boolean; badge_text?: string }[];
  customerPortalUrl?: string;
  portalButtonText?: string;
  onOpenWishlist?: () => void;
}) {
  // Hydration guard: navbarItems llega vacío en SSR (useLayout fetchea en client).
  // Solo renderizamos los links después del mount para evitar mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Navbar items vienen del backend (layout.navbar.content_config.items).
  // Normalizamos los href: si es relativo (ej. 'catalogo') lo componemos con el landing
  const navLinks = navbarItems.map((item) => {
    const isAnchor = item.href.startsWith('#') || item.href.startsWith('http');
    const href = isAnchor
      ? item.href
      : item.href.startsWith('catalogo')
        ? routes.catalogo(landing) + item.href.slice('catalogo'.length)
        : `/${landing}/${item.href.replace(/^\//, '')}`;
    return {
      label: item.label,
      href,
      badge: item.badge_text,
    };
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 64,
        background: isDark ? 'rgba(14,14,14,0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a
          href={routes.landingHome(landing)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <Image
            src={`${ZONA_GAMER_ASSETS}/branding/logo-ofi.png`}
            alt="BaldeCash"
            width={140}
            height={32}
            className="object-contain"
            style={{ height: 30 }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              fontWeight: 700,
              color: '#ff0055',
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

      {/* Nav links ocultos en catálogo — no aplican fuera del landing */}
      <nav
        className="hidden"
        style={{ alignItems: 'center', gap: 28 }}
      >
        {mounted && navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              position: 'relative',
              fontSize: 14,
              fontWeight: 500,
              color: isDark ? '#ffffff' : '#333',
              textDecoration: 'none',
              transition: 'color 0.2s',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {link.label}
            {link.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: T.neonCyan,
                  padding: '0 4px',
                  borderRadius: 4,
                  lineHeight: '16px',
                }}
              >
                {link.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Customer portal button (desde layout.company.customer_portal_url) */}
        {mounted && customerPortalUrl && (
          <a
            href={customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: T.neonPurple,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.12)',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>{portalButtonText || 'Mi zona'}</span>
          </a>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: isDark ? '#ffffff' : '#555',
            position: 'relative',
          }}
          title="Cambiar tema"
        >
          {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </button>

        {/* Hamburger (mobile) */}
        <button
          className="flex md:hidden"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${T.border}`,
            color: T.textSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
