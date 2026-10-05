/**
 * "2026-09-14" → "lunes 14/09".
 *
 * Parsea los tres números a mano: `new Date('2026-09-14')` se interpreta como
 * UTC y en Lima (UTC-5) cae al día anterior, cambiando el día de la semana.
 */
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function formatearFechaSolicitud(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return iso;
  return `${DIAS[d.getDay()]} ${m[3]}/${m[2]}`;
}
