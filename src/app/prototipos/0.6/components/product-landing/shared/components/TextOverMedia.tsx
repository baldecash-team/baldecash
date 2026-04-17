'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface TextOverMediaProps {
  /** The media element (Image, video, canvas, etc.) */
  media: ReactNode;
  /** Text content to overlay */
  children: ReactNode;
  /** Total scroll height for the section */
  height?: string;
  /** Scrim color (gradient overlay) */
  scrimColor?: string;
  /** Text alignment */
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Apple-inspired TextOverMedia component.
 * Zoom-through effect on media + staggered text reveal on scroll.
 */
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
    const copyChildren = copyInner?.children;

    const ctx = gsap.context(() => {
      // ── Media zoom: scale 1.0 → 1.18 across the full scroll ──
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

      // ── Scrim fade in (0% → 25%) ──
      gsap.fromTo(
        scrim,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '25% top',
            scrub: true,
          },
        },
      );

      // ── Copy wrapper fade in (18% → 38%) ──
      gsap.fromTo(
        copy,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: '18% top',
            end: '38% top',
            scrub: true,
          },
        },
      );

      // ── Stagger children in: translateY + opacity (20% → 42%) ──
      if (copyChildren && copyChildren.length > 0) {
        gsap.fromTo(
          copyChildren,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: '20% top',
              end: '42% top',
              scrub: true,
            },
          },
        );
      }

      // ── Copy wrapper fade out (68% → 88%) ──
      gsap.to(copy, {
        opacity: 0,
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: '68% top',
          end: '88% top',
          scrub: true,
        },
      });

      // ── Stagger children out (66% → 85%) ──
      if (copyChildren && copyChildren.length > 0) {
        gsap.to(copyChildren, {
          opacity: 0,
          y: -20,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: '66% top',
            end: '85% top',
            scrub: true,
          },
        });
      }

      // ── Scrim fade out (78% → 100%) ──
      gsap.to(scrim, {
        opacity: 0,
        scrollTrigger: {
          trigger: container,
          start: '78% top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [height, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Media layer — zoom target */}
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          {media}
        </div>

        {/* Scrim layer */}
        <div
          ref={scrimRef}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${scrimColor} 0%, transparent 100%)`,
            opacity: 0,
          }}
        />

        {/* Text layer */}
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
