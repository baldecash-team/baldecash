'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface StaggeredFadeInProps {
  children: ReactNode;
  /** Delay between each child element (seconds) */
  staggerDelay?: number;
  /** Duration of each element's fade (seconds) */
  duration?: number;
  /** Vertical offset in pixels */
  y?: number;
  /** GSAP easing */
  ease?: string;
  /** ScrollTrigger start position */
  start?: string;
  className?: string;
}

/**
 * Apple-inspired StaggeredFadeIn component.
 * Each direct child animates in sequence with configurable delay.
 * Uses GSAP ScrollTrigger — children reveal as they enter viewport.
 */
export function StaggeredFadeIn({
  children,
  staggerDelay = 0.08,
  duration = 0.6,
  y = 30,
  ease = 'power2.out',
  start = 'top 85%',
  className = '',
}: StaggeredFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const children = el.children;
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y });

    const tween = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      ease,
      stagger: staggerDelay,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        onRefresh: (self) => {
          if (self.progress > 0) gsap.set(children, { opacity: 1, y: 0 });
        },
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [staggerDelay, duration, y, ease, start, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
