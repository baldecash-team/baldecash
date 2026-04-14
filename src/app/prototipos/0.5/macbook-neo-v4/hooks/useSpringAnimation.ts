'use client';

import { useCallback, useRef } from 'react';

interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

/**
 * Physics-based spring animation.
 * Returns a function that animates an element's transform/opacity using spring physics.
 */
export function useSpringAnimation(config: SpringConfig = {}) {
  const {
    stiffness = 200,
    damping = 20,
    mass = 1,
    precision = 0.01,
  } = config;
  const rafRef = useRef<number>(0);

  const animate = useCallback(
    (
      el: HTMLElement,
      property: 'translateY' | 'translateX' | 'scale' | 'opacity',
      from: number,
      to: number,
      onComplete?: () => void,
    ) => {
      cancelAnimationFrame(rafRef.current);

      let position = from;
      let velocity = 0;
      let lastTime = performance.now();

      function step(now: number) {
        const dt = Math.min((now - lastTime) / 1000, 0.064); // cap at ~16fps min
        lastTime = now;

        const displacement = position - to;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocity;
        const acceleration = (springForce + dampingForce) / mass;

        velocity += acceleration * dt;
        position += velocity * dt;

        // Apply to element
        switch (property) {
          case 'translateY':
            el.style.transform = `translateY(${position}px)`;
            break;
          case 'translateX':
            el.style.transform = `translateX(${position}px)`;
            break;
          case 'scale':
            el.style.transform = `scale(${position})`;
            break;
          case 'opacity':
            el.style.opacity = String(Math.max(0, Math.min(1, position)));
            break;
        }

        // Check if settled
        if (Math.abs(velocity) < precision && Math.abs(displacement) < precision) {
          // Snap to final value
          switch (property) {
            case 'translateY':
              el.style.transform = `translateY(${to}px)`;
              break;
            case 'translateX':
              el.style.transform = `translateX(${to}px)`;
              break;
            case 'scale':
              el.style.transform = `scale(${to})`;
              break;
            case 'opacity':
              el.style.opacity = String(to);
              break;
          }
          onComplete?.();
          return;
        }

        rafRef.current = requestAnimationFrame(step);
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [stiffness, damping, mass, precision],
  );

  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  return { animate, cancel };
}
