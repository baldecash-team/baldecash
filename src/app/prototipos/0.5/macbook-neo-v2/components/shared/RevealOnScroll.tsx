'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealDefaults } from '../../lib/animations';

gsap.registerPlugin(ScrollTrigger);

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
}

export function RevealOnScroll({
  children,
  className = '',
  stagger = 0.08,
  y = 40,
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.children;
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(elements, {
        ...revealDefaults,
        y,
        stagger,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, ref.current);

    return () => ctx.revert();
  }, [stagger, y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
