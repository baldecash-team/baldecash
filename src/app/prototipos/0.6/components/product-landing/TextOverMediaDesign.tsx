'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { TextOverMedia } from './shared/components/TextOverMedia';
import { designData } from './data/v5Data';
import { ASSETS, BC } from './lib/constants';
import { useReducedMotion } from './shared/hooks/useReducedMotion';

export default function TextOverMediaDesign() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScrollTo = () => {
    const el = document.getElementById(designData.ctaScrollTo);
    if (!el) return;
    const mobile = window.innerWidth < 768;
    const offset = mobile ? 72 : 68;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${designData.ctaScrollTo}`);
  };

  if (isMobile) {
    return <MobileDesignSection onCta={handleScrollTo} />;
  }

  return (
    <TextOverMedia
      height="200vh"
      align="center"
      media={
        <Image
          src={designData.image}
          alt="MacBook Neo diseño"
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
      }
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 text-center">
        <span
          className="text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-semibold tracking-[-0.015em] leading-[1.05] text-white whitespace-pre-line"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {designData.headline}
        </span>
        <p className="text-[13px] sm:text-[15px] md:text-[18px] font-medium text-white max-w-[680px] leading-[1.38]">
          {designData.description}
        </p>
        <button
          onClick={handleScrollTo}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-all border-none cursor-pointer rounded-lg shadow-sm mt-2 active:scale-[0.97]"
          style={{ backgroundColor: BC.primary }}
        >
          {designData.ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </TextOverMedia>
  );
}

// ═══════════════════════════════════════════════════════════════
// Mobile: cinematographic scale + parallax + blur reveal
// ═══════════════════════════════════════════════════════════════
function MobileDesignSection({ onCta }: { onCta: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const media = mediaRef.current;
    const copy = copyRef.current;
    if (!container || !media || !copy) return;

    if (reducedMotion) {
      media.style.transform = 'scale(1)';
      copy.style.opacity = '1';
      copy.style.filter = 'blur(0px)';
      copy.style.transform = 'translateY(0)';
      return;
    }

    let rafId = 0;

    // Parallax only — no text fade
    const updateParallax = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const progress = Math.min(1, Math.max(0, -rect.top / total));

      const scale = 1.18 - 0.18 * progress;
      const parallaxY = -30 * progress;
      media.style.transform = `translate3d(0, ${parallaxY}px, 0) scale(${scale})`;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateParallax();
        rafId = 0;
      });
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax);

    // Text: appear once and stay
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          copy.style.transition = 'opacity 0.8s ease-out, filter 0.8s ease-out, transform 0.8s ease-out';
          copy.style.opacity = '1';
          copy.style.filter = 'blur(0px)';
          copy.style.transform = 'translate3d(0, 0, 0)';
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(container);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateParallax);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <section ref={containerRef} className="relative" style={{ height: '150vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Media layer: 4 franjas horizontales (landscape-friendly) con parallax + scale */}
        <div
          ref={mediaRef}
          className="absolute inset-0 grid grid-cols-1 grid-rows-4"
          style={{
            willChange: 'transform',
            transform: 'scale(1.18)',
            backgroundColor: '#f5f5f7',
          }}
        >
          {[
            { src: ASSETS.colors.silver, alt: 'Silver', align: 'left' as const },
            { src: ASSETS.colors.blush, alt: 'Blush', align: 'right' as const },
            { src: ASSETS.colors.citrus, alt: 'Citrus', align: 'left' as const },
            { src: ASSETS.colors.indigo, alt: 'Indigo', align: 'right' as const },
          ].map((c) => (
            <div key={c.alt} className="relative overflow-hidden">
              <div
                className="absolute inset-y-0"
                style={{
                  width: '70%',
                  left: c.align === 'left' ? 0 : 'auto',
                  right: c.align === 'right' ? 0 : 'auto',
                }}
              >
                <Image
                  src={c.src}
                  alt={`MacBook Neo ${c.alt}`}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                  sizes="70vw"
                  priority={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scrim: radial spotlight suave centrado para proteger el texto */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 95% 40% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 85%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Copy */}
        <div
          ref={copyRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
          style={{
            opacity: 0,
            filter: 'blur(10px)',
            transform: 'translate3d(0, 30px, 0)',
            willChange: 'opacity, filter, transform',
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: BC.secondary }}
          >
            Diseño
          </span>
          <h2
            className="text-[28px] font-semibold tracking-[-0.015em] leading-[1.05] text-white m-0 whitespace-pre-line"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {designData.headline}
          </h2>
          <p className="text-[13px] font-medium text-white/85 max-w-[340px] leading-[1.5] mt-3 mb-5">
            {designData.description}
          </p>
          <button
            onClick={onCta}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white border-none cursor-pointer rounded-lg active:scale-[0.97]"
            style={{
              backgroundColor: BC.primary,
              boxShadow: `0 8px 24px ${BC.primary}40`,
            }}
          >
            {designData.ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
