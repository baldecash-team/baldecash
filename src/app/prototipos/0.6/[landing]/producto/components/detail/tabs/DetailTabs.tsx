'use client';

/**
 * DetailTabs - Scroll Continuo + Nav Sticky Compacto (basado en V1)
 * Pure navigation component with compact sticky sidebar.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Calculator,
  Cpu,
  Calendar,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { DetailTabsProps } from '../../../types/detail';

interface NavItem {
  id: string;
  label: string;
  mobileLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DetailTabs: React.FC<DetailTabsProps & { hasLimitations?: boolean }> = ({ hasLimitations = true }) => {
  const [activeSection, setActiveSection] = useState('section-gallery');
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems: NavItem[] = [
    { id: 'section-gallery', label: 'Galería', icon: Image },
    { id: 'section-pricing', label: 'Cuotas', icon: Calculator },
    { id: 'section-specs', label: 'Specs', icon: Cpu },
    { id: 'section-cronograma', label: 'Cronograma', mobileLabel: 'Pagos', icon: Calendar },
    { id: 'section-similar', label: 'Similares', icon: Package },
    ...(hasLimitations ? [{ id: 'section-limitations', label: 'Consideraciones', mobileLabel: 'Notas', icon: AlertTriangle }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 200; // Compensar altura de navbars fijos

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
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setActiveSection(sectionId);
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const yOffset = -180; // Compensar altura de navbars fijos (promo + primary + secondary)
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  return (
    <>
      {/* Desktop: Compact Sticky Sidebar */}
      <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
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

      {/* Mobile: Horizontal Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-neutral-200 safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-neutral-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{item.mobileLabel || item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DetailTabs;
