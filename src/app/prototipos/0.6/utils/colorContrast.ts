/**
 * Color contrast utilities for dynamic brand colors (WCAG luminance).
 */

function parseHex(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  if (c.length < 6) return [0, 0, 0];
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}

function toLinear(v: number): number {
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns '#FFFFFF' or '#1a1a1a' for text ON a colored background. */
export function getContrastTextColor(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return luminance(r, g, b) > 0.4 ? '#1a1a1a' : '#FFFFFF';
}

/** Returns the original color if readable on white, or a darkened fallback. */
export function getReadableColorOnWhite(hex: string): string {
  const [r, g, b] = parseHex(hex);
  const L = luminance(r, g, b);
  // WCAG AA requires contrast ratio >= 4.5:1 for normal text
  // Contrast ratio against white (L=1) = (1.05) / (L + 0.05)
  // 4.5:1 → L <= 0.1833. We use a slightly more lenient threshold (3:1 for large text/UI).
  // 3:1 → L <= 0.3
  if (L <= 0.3) return hex; // readable as-is
  // Darken by mixing with black at 40%
  const darken = (v: number) => Math.round(v * 0.6 * 255);
  const dr = darken(r).toString(16).padStart(2, '0');
  const dg = darken(g).toString(16).padStart(2, '0');
  const db = darken(b).toString(16).padStart(2, '0');
  return `#${dr}${dg}${db}`;
}
