/**
 * Formateo de la pantalla de elección de equipo. Todo puro y testeable.
 *
 * TRAMPA DE FECHAS (la que ya nos mordió): `new Date("2026-08-20")` se
 * interpreta como UTC y en Lima (-5) cae el 19. Por eso ningún dato de fecha
 * se le pasa crudo al constructor: se parte el string y se le declara la zona.
 *
 * El caso del vencimiento es aparte y peor: `link_expires_at` sale del backend
 * como un datetime NAIVE en hora Lima (`SecureLinkService` lo guarda así, ver
 * BAL-2482). Un string sin offset lo parsea el navegador en SU zona local, así
 * que el mismo link vencería a horas distintas según dónde esté el cliente.
 * Acá se le pega el offset fijo de Perú (-05:00, sin horario de verano) antes
 * de parsear: es el único modo de que la cuenta regresiva sea la misma para
 * todos.
 */

/** Offset fijo de Perú. No tiene horario de verano, así que no varía nunca. */
const OFFSET_LIMA = '-05:00';

/** `true` si el string ya trae zona horaria (Z o ±HH:MM). */
function traeZona(iso: string): boolean {
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso);
}

/**
 * Convierte el `link_expires_at` del backend a epoch ms, asumiendo hora Lima
 * cuando el string no declara zona. Devuelve `null` si no se puede parsear.
 */
export function vencimientoEnMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const limpio = iso.trim();
  if (!limpio) return null;
  // Sin parte horaria (solo "YYYY-MM-DD") vence al final de ese día en Lima.
  const conHora = limpio.includes('T') || limpio.includes(' ')
    ? limpio.replace(' ', 'T')
    : `${limpio}T23:59:59`;
  const ms = Date.parse(traeZona(conHora) ? conHora : `${conHora}${OFFSET_LIMA}`);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Etiqueta de la cuenta regresiva del header ("2 días", "3:00:00", "Vencido").
 *
 * Con más de un día restante los segundos son ruido y además obligan a
 * repintar cada segundo un número que nadie mira; recién dentro del último día
 * se muestra el reloj del mockup.
 */
export function etiquetaCuentaRegresiva(msRestantes: number): string {
  if (msRestantes <= 0) return 'Vencido';
  const totalSeg = Math.floor(msRestantes / 1000);
  const dias = Math.floor(totalSeg / 86400);
  if (dias >= 1) return `${dias} ${dias === 1 ? 'día' : 'días'}`;
  const hh = Math.floor(totalSeg / 3600);
  const mm = Math.floor((totalSeg % 3600) / 60);
  const ss = totalSeg % 60;
  return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * "Unidad 01" — el correlativo que ve el cliente, con dos dígitos como el
 * diseño. NUNCA el serial: el backend ni siquiera lo manda.
 */
export function nombreUnidad(displayNumber: number | null | undefined): string {
  if (displayNumber == null) return 'Unidad';
  return `Unidad ${String(displayNumber).padStart(2, '0')}`;
}

/** "S/ 55/mes" a partir del `monthly_payment`, que puede venir como string. */
export function formatearCuota(monto: number | string | null | undefined): string {
  if (monto == null || monto === '') return '';
  const n = typeof monto === 'number' ? monto : Number(monto);
  if (!Number.isFinite(n)) return '';
  const texto = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `S/ ${texto}/mes`;
}

/** "Grado A · Excelente estado", omitiendo la parte que no venga. */
export function etiquetaGrado(
  grado: string | null | undefined,
  gradoLabel: string | null | undefined,
): string {
  const partes = [grado ? `Grado ${grado}` : '', gradoLabel ?? ''].filter(Boolean);
  return partes.join(' · ');
}

/** "1 video · 4 fotos", omitiendo lo que la unidad no tenga. */
export function resumenMedios(fotos: number, tieneVideo: boolean): string {
  const partes: string[] = [];
  if (tieneVideo) partes.push('1 video');
  if (fotos > 0) partes.push(`${fotos} ${fotos === 1 ? 'foto' : 'fotos'}`);
  return partes.join(' · ');
}
