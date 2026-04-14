'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  separator?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  end,
  suffix = '',
  duration = 1.5,
  separator = false,
  className = '',
  style,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Show final value immediately if user prefers reduced motion
    if (reducedMotion) {
      const isDecimal = end % 1 !== 0;
      el.textContent = (isDecimal ? end.toFixed(1) : (separator ? end.toLocaleString() : String(end))) + suffix;
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: end,
            duration,
            ease: 'power2.out',
            onUpdate() {
              const current = this.targets()[0].val;
              const isDecimal = end % 1 !== 0;
              const formatted = isDecimal
                ? current.toFixed(1)
                : separator
                  ? Math.floor(current).toLocaleString()
                  : String(Math.floor(current));
              el.textContent = formatted + suffix;
            },
          },
        );
      },
      once: true,
    });

    return () => {
      trigger.kill();
    };
  }, [end, suffix, duration, separator, reducedMotion]);

  return (
    <span ref={ref} className={className} style={style}>
      0{suffix}
    </span>
  );
}
