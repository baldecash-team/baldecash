'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  ease?: string;
  stagger?: number;
  className?: string;
  as?: 'div' | 'section';
}

export function RevealOnScroll({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  ease = 'power2.out',
  stagger,
  className = '',
  as: Tag = 'div',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation if user prefers reduced motion
    if (reducedMotion) return;

    const targets = stagger ? el.children : el;

    gsap.set(targets, { opacity: 0, y });

    const safetyTimer = setTimeout(() => {
      gsap.set(targets, { opacity: 1, y: 0 });
    }, 3000);

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      delay,
      duration,
      ease,
      stagger: stagger || 0,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        onEnter: () => clearTimeout(safetyTimer),
        onRefresh: (self) => {
          if (self.progress > 0) {
            clearTimeout(safetyTimer);
            gsap.set(targets, { opacity: 1, y: 0 });
          }
        },
      },
    });

    return () => {
      clearTimeout(safetyTimer);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, duration, y, ease, stagger, reducedMotion]);

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
