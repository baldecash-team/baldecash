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

    const update = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      // progress: 0 when section enters, 1 when section exits
      const progress = Math.min(1, Math.max(0, -rect.top / total));

      // Parallax: imagen se escala 1.18 → 1.0 a lo largo del scroll
      const scale = 1.18 - 0.18 * progress;
      // Parallax Y: la imagen se mueve lentamente hacia arriba
      const parallaxY = -30 * progress;
      media.style.transform = `translate3d(0, ${parallaxY}px, 0) scale(${scale})`;

      // Copy: aparece entre 15%-40%, desaparece entre 75%-95%
      let copyOpacity = 0;
      let copyBlur = 10;
      let copyY = 30;
      if (progress < 0.15) {
        copyOpacity = 0;
        copyBlur = 10;
        copyY = 30;
      } else if (progress < 0.4) {
        const p = (progress - 0.15) / 0.25;
        copyOpacity = p;
        copyBlur = 10 * (1 - p);
        copyY = 30 * (1 - p);
      } else if (progress < 0.75) {
        copyOpacity = 1;
        copyBlur = 0;
        copyY = 0;
      } else if (progress < 0.95) {
        const p = (progress - 0.75) / 0.2;
        copyOpacity = 1 - p;
        copyBlur = 6 * p;
        copyY = -20 * p;
      } else {
        copyOpacity = 0;
        copyBlur = 6;
        copyY = -20;
      }
      copy.style.opacity = String(copyOpacity);
      copy.style.filter = `blur(${copyBlur}px)`;
      copy.style.transform = `translate3d(0, ${copyY}px, 0)`;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        update();
        rafId = 0;
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
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
