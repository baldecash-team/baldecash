export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

/** Recorta el sufijo de codecs, p. ej. "video/webm;codecs=vp9" → "video/webm". */
export function baseContentType(s: string): string {
  return s.split(';')[0].trim();
}

/** Devuelve true si el mime (con o sin codecs) está en ALLOWED_VIDEO_TYPES. */
export function isAllowedVideoType(mime: string): boolean {
  const base = baseContentType(mime) as string;
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(base);
}
