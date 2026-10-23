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

/** Returns white if the color is too dark to be visible on a dark background. */
export function getColorForDarkBg(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return luminance(r, g, b) > 0.1 ? hex : '#FFFFFF';
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

/* -------------------------------------------------------------------------- */
/* Diseño 2 (BAL-4969, I-1): textos legibles con el color de cualquier landing */
/* -------------------------------------------------------------------------- */

/** Texto oscuro del kit de Diseño 2: el que va sobre un primary claro. */
export const TEXTO_OSCURO_V2 = '#1E2230';
const BLANCO = '#FFFFFF';
const CONTRASTE_MINIMO = 4.5;

/** Hex de 3 o 6 dígitos a [r, g, b] en 0..1; null si no es un hex válido. */
function leerHex(hex: string): [number, number, number] | null {
  let c = hex.trim().replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(c)) c = c.split('').map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(c)) return null;
  return [0, 2, 4].map((i) => parseInt(c.substring(i, i + 2), 16) / 255) as [number, number, number];
}

function luminanciaDe(hex: string): number | null {
  const rgb = leerHex(hex);
  return rgb ? luminance(...rgb) : null;
}

/** Contraste WCAG entre dos colores hex (1..21). Con un hex inválido, 1. */
export function contrasteWcag(a: string, b: string): number {
  const la = luminanciaDe(a);
  const lb = luminanciaDe(b);
  if (la === null || lb === null) return 1;
  const [claro, oscuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Texto que va SOBRE un fondo del color primary (`--color-on-primary`):
 * blanco o el oscuro del kit, el que dé más contraste WCAG.
 */
export function colorSobrePrimary(primary: string): string {
  if (!leerHex(primary)) return BLANCO;
  return contrasteWcag(BLANCO, primary) >= contrasteWcag(TEXTO_OSCURO_V2, primary) ? BLANCO : TEXTO_OSCURO_V2;
}

/**
 * Primary para TEXTO sobre blanco o sobre su tinte (`--color-primary-text`):
 * el mismo color si ya llega a 4.5:1 sobre blanco; si no, se mezcla con negro
 * de a 5 % hasta llegar. Devuelve hex en mayúsculas.
 */
export function primaryParaTexto(primary: string): string {
  const rgb = leerHex(primary);
  if (!rgb) return primary;
  const aHex = (canales: number[]) =>
    `#${canales.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  const original = aHex(rgb);
  if (contrasteWcag(original, BLANCO) >= CONTRASTE_MINIMO) return original;
  for (let negro = 0.05; negro <= 1; negro += 0.05) {
    const candidato = aHex(rgb.map((v) => v * (1 - negro)));
    if (contrasteWcag(candidato, BLANCO) >= CONTRASTE_MINIMO) return candidato;
  }
  return '#000000';
}
