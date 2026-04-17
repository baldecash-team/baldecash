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

      // ── Scrim: scrub in from 0% → 20%, then stays at opacity 1 ──
      gsap.fromTo(
        scrim,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '20% top',
            scrub: true,
          },
        },
      );

      // ── Copy: scrub in from 22% → 35%, stays visible ──
      gsap.fromTo(
        copy,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: '22% top',
            end: '35% top',
            scrub: true,
          },
        },
      );

      // ── Children stagger in: 24% → 40%, stay visible ──
      if (copyChildren.length > 0) {
        gsap.fromTo(
          copyChildren,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.02,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: '24% top',
              end: '40% top',
              scrub: true,
            },
          },
        );
      }

      // No fade out — text and scrim stay visible
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
