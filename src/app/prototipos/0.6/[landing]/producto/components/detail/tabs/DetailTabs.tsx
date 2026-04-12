'use client';

/**
 * DetailTabs - Scroll Continuo + Nav Sticky Compacto (basado en V1)
 * Pure navigation component with compact sticky sidebar.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Image,
  Calculator,
  Cpu,
  Calendar,
  Package,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

interface NavItem {
  id: string;
  label: string;
  mobileLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DetailTabs: React.FC<DetailTabsProps> = ({ hasLimitations = false, hasDescription = false, hasSimilar = false }) => {
  const [activeSection, setActiveSection] = useState('section-gallery');
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems: NavItem[] = useMemo(() => [
    { id: 'section-gallery', label: 'Galería', icon: Image },
    { id: 'section-pricing', label: 'Cuotas', icon: Calculator },
    ...(hasDescription ? [{ id: 'section-description', label: 'Descripción', mobileLabel: 'Desc', icon: FileText }] : []),
    { id: 'section-specs', label: 'Specs', icon: Cpu },
    { id: 'section-cronograma', label: 'Cronograma', mobileLabel: 'Pagos', icon: Calendar },
    ...(hasSimilar ? [{ id: 'section-similar', label: 'Similares', mobileLabel: 'Sim.', icon: Package }] : []),
    ...(hasLimitations ? [{ id: 'section-limitations', label: 'Consideraciones', mobileLabel: 'Notas', icon: AlertTriangle }] : []),
  ], [hasDescription, hasSimilar, hasLimitations]);

  // Read the real fixed-header offset from the CSS variables exposed by the
  // Navbar (preview + promo + main) and the CatalogSecondaryNavbar. Falls
  // back to 160px if variables are missing.
  const getHeaderOffset = (): number => {
    if (typeof window === 'undefined') return 160;
    const root = getComputedStyle(document.documentElement);
    const parsePx = (v: string): number => {
      if (!v) return 0;
      const trimmed = v.trim();
      if (trimmed.endsWith('rem')) return parseFloat(trimmed) * 16;
      if (trimmed.endsWith('px')) return parseFloat(trimmed);
      return parseFloat(trimmed) || 0;
    };
    const headerTotal = parsePx(root.getPropertyValue('--header-total-height')) || 104;
    const secondary = parsePx(root.getPropertyValue('--catalog-secondary-height')) || 56;
    return headerTotal + secondary;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + getHeaderOffset() + 40;

      for (const item of [...navItems].reverse()) {
        const element = document.getElementById(item.id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setActiveSection(sectionId);
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const yOffset = -(getHeaderOffset() + 20);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  return (
    // Desktop-only compact sticky sidebar (lg+).
    // The mobile horizontal version was removed because it overlapped with
    // the product's fixed bottom CTA bar. On mobile the user navigates via
    // natural scroll — the section anchors still work via deep-link.
    <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-[45]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-neutral-200 p-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className={`absolute left-full ml-3 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-neutral-800 text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DetailTabs;
