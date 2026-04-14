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
 * Sticky media with text that fades in/out on scroll.
 * Includes animated scrim (gradient overlay) and clip-path reveal.
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
  const scrimRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const scrim = scrimRef.current;
    const copy = copyRef.current;
    if (!container || !scrim || !copy) return;

    if (reducedMotion) {
      // Static display: show scrim and text
      scrim.style.opacity = '1';
      copy.style.opacity = '1';
      container.style.height = 'auto';
      return;
    }

    container.style.height = height;

    const ctx = gsap.context(() => {
      // Phase 1: Scrim fades in (0% → 30% of scroll)
      gsap.fromTo(
        scrim,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '30% top',
            scrub: true,
          },
        },
      );

      // Phase 2: Text fades in (20% → 40% of scroll)
      gsap.fromTo(
        copy,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: container,
            start: '20% top',
            end: '40% top',
            scrub: true,
          },
        },
      );

      // Phase 3: Text fades out (70% → 90% of scroll)
      gsap.to(copy, {
        opacity: 0,
        y: -30,
        scrollTrigger: {
          trigger: container,
          start: '70% top',
          end: '90% top',
          scrub: true,
        },
      });

      // Phase 4: Scrim fades out (80% → 100% of scroll)
      gsap.to(scrim, {
        opacity: 0,
        scrollTrigger: {
          trigger: container,
          start: '80% top',
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
        {/* Media layer */}
        <div className="absolute inset-0">{media}</div>

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
