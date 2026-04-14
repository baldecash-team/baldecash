export const presets = {
  revealUp: { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' },
  revealScale: { opacity: 0, scale: 0.95, duration: 1, ease: 'power2.out' },
  fadeOut: { opacity: 0, y: -50, ease: 'none' },
  parallax: (intensity: number) => ({ yPercent: intensity, ease: 'none' }),
  stagger: (delay: number) => ({ stagger: delay }),
  spring: { ease: 'back.out(1.4)', duration: 0.7 },
};

export const triggers = {
  scrub: { scrub: true },
  once: { toggleActions: 'play none none none' as const, once: true },
  heroFade: { start: '10% top', end: '40% top', scrub: true },
  revealStart: { start: 'top 85%' },
};

/**
 * Apple-inspired 5-level breakpoint system.
 * Matches apple.com/macbook-neo responsive breakpoints.
 */
export const breakpoints = {
  xsmall: 480,
  small: 734,
  medium: 1068,
  large: 1440,
  xlarge: 1441,
} as const;

/** CSS media query strings for each breakpoint */
export const mediaQueries = {
  xsmall: `(max-width: ${breakpoints.xsmall}px)`,
  small: `(max-width: ${breakpoints.small}px)`,
  medium: `(max-width: ${breakpoints.medium}px)`,
  large: `(max-width: ${breakpoints.large}px)`,
  xlarge: `(min-width: ${breakpoints.xlarge}px)`,
} as const;

/** Tailwind-compatible breakpoint classes for the 5-level system */
export const tw = {
  xsmall: 'max-[480px]',
  small: 'max-[734px]',
  medium: 'max-[1068px]',
  large: 'max-[1440px]',
  xlarge: 'min-[1441px]',
} as const;
