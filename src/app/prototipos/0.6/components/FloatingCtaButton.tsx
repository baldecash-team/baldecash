'use client';

import { useState, useEffect } from 'react';
import { type FloatingCtaConfig } from '../types/landingConfig';
import { GraduationCap, X, ArrowRight } from 'lucide-react';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

interface FloatingCtaButtonProps {
  config: FloatingCtaConfig | null;
}

export function FloatingCtaButton({ config }: FloatingCtaButtonProps) {
  const tracker = useEventTrackerOptional();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Hide the floating CTA when the footer enters the viewport so it never
  // overlaps the libro de reclamaciones logo (same bottom-right corner).
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!config) return null;

  const Icon = GraduationCap;
  const hiddenClasses = isFooterVisible
    ? 'opacity-0 pointer-events-none translate-y-2'
    : 'opacity-100 translate-y-0';

  if (isExpanded) {
    return (
      <div
        aria-hidden={isFooterVisible}
        className={`fixed left-4 right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[90] rounded-[16px] bg-[#1a1a2e]/95 backdrop-blur-sm p-5 shadow-xl sm:left-auto sm:right-6 sm:bottom-6 sm:w-[320px] transition-all duration-200 ${hiddenClasses}`}
      >
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#4654CD]/20 mb-4">
          <Icon className="h-5 w-5 text-[#03DBD0]" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">{config.expanded_title}</h3>
        <p className="text-sm text-white/70 mb-4">{config.expanded_description}</p>

        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#03DBD0] px-5 py-2.5 text-sm font-semibold text-[#1a1a2e] no-underline transition-all hover:brightness-110"
          onClick={() => tracker?.track('cta_click', { cta_name: 'floating_cta_link', href: config.url, location: 'floating' })}
        >
          {config.cta_text}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        tracker?.track('cta_click', { cta_name: 'floating_cta_expand', location: 'floating' });
        setIsExpanded(true);
      }}
      aria-hidden={isFooterVisible}
      className={`fixed right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[90] flex items-center justify-center rounded-[16px] bg-[#1a1a2e]/90 backdrop-blur-sm p-3 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#1a1a2e] cursor-pointer border-none sm:right-6 sm:bottom-6 sm:gap-3 sm:px-5 sm:py-3 sm:justify-start ${hiddenClasses}`}
      aria-label={config.title}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[#4654CD]/20">
        <Icon className="h-5 w-5 text-[#03DBD0]" />
      </div>
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-sm font-bold text-white leading-tight">{config.title}</span>
        <span className="text-xs text-white/70 leading-tight">{config.subtitle}</span>
      </div>
    </button>
  );
}
