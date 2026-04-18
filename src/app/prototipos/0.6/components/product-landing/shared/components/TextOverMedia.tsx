'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface TextOverMediaProps {
  media: ReactNode;
  children: ReactNode;
  height?: string;
  scrimColor?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function TextOverMedia({
  media,
  children,
  height = '300vh',
  scrimColor = 'rgba(0,0,0,0.5)',
  align = 'center',
  className = '',
}: TextOverMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const mediaEl = mediaRef.current;
    const scrim = scrimRef.current;
    const copy = copyRef.current;
    if (!container || !mediaEl || !scrim || !copy) return;

    if (reducedMotion) {
      scrim.style.opacity = '1';
      copy.style.opacity = '1';
      container.style.height = 'auto';
      return;
    }

    container.style.height = height;

    const copyInner = copy.querySelector('[data-copy-inner]');
    const copyChildren = copyInner ? Array.from(copyInner.children) : [];

    const ctx = gsap.context(() => {
      // ── Media zoom: continuous across full scroll ──
      gsap.fromTo(
        mediaEl,
        { scale: 1 },
        {
          scale: 1.18,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      );

      // ── Scrim + text: trigger once, with fallback for fast scroll ──
      gsap.set(scrim, { opacity: 0 });
      gsap.set(copy, { opacity: 0 });
      if (copyChildren.length > 0) {
        gsap.set(copyChildren, { opacity: 0, y: 30 });
      }

      const revealContent = () => {
        gsap.to(scrim, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        gsap.to(copy, { opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out' });
        if (copyChildren.length > 0) {
          gsap.to(copyChildren, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            delay: 0.25,
            ease: 'power2.out',
          });
        }
      };

      ScrollTrigger.create({
        trigger: container,
        start: 'top 60%',
        once: true,
        onEnter: revealContent,
        onRefresh: (self) => {
          // If user already scrolled past trigger on load/reload, reveal immediately
          if (self.progress > 0) revealContent();
        },
      });
    });

    return () => ctx.revert();
  }, [height, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          {media}
        </div>

        <div
          ref={scrimRef}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${scrimColor} 0%, transparent 100%)`,
            opacity: 0,
          }}
        />

        <div
          ref={copyRef}
          className={`absolute inset-0 z-10 flex items-center ${
            align === 'center' ? 'justify-center text-center' : 'justify-start'
          }`}
          style={{ opacity: 0 }}
        >
          <div
            data-copy-inner
            className={`w-full max-w-[980px] px-4 ${
              align === 'left' ? '' : 'mx-auto'
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
