/**
 * Sorteo del A/B del modal de captura de leads: "modal" (lo ve) contra
 * "control" (no se le muestra).
 *
 * El grupo se guarda por navegador y por landing. Sin esa memoria, recargar
 * el catálogo sería volver a tirar el dado: el mismo visitante pasaría de un
 * grupo a otro y el test no mediría nada.
 */

import * as Sentry from '@sentry/nextjs';

export type LeadModalVariant = 'modal' | 'control';

export interface LeadModalAssignment {
  variant: LeadModalVariant;
  /** false cuando el porcentaje es 100: no hay test y no se reporta grupo. */
  enTest: boolean;
  /** true solo en la llamada que sorteó. Se usa para emitir el evento una vez. */
  esNueva: boolean;
  /** El porcentaje ya normalizado con el que se resolvió. */
  percent: number;
}

const abKey = (landing: string) => `baldecash-lead-modal-ab-${landing}`;

/**
 * Ausente vale 100: las landings que ya tenían el modal prendido antes de
 * que existiera el porcentaje siguen mostrándolo a todos.
 */
export function normalizeShowPercent(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return 100;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function leerGuardado(landingSlug: string, percent: number): LeadModalVariant | null {
  try {
    const crudo = localStorage.getItem(abKey(landingSlug));
    if (!crudo) return null;
    const guardado = JSON.parse(crudo) as { variant?: unknown; percent?: unknown };
    // Si el admin cambió el porcentaje, el sorteo viejo ya no representa al
    // test actual: se descarta y se sortea de nuevo.
    if (guardado.percent !== percent) return null;
    if (guardado.variant === 'modal' || guardado.variant === 'control') {
      return guardado.variant;
    }
    return null;
  } catch (error) {
    // Sin almacenamiento o con un valor corrupto: se sortea de nuevo.
    Sentry.captureException(error, {
      tags: { modulo: 'lead_modal', accion: 'leer_grupo_ab', landing: landingSlug },
    });
    return null;
  }
}

/**
 * Solo lectura: el grupo que este navegador ya tiene para el test actual de
 * la landing, o `null` si no hay test (100%) o nunca se sorteó con este
 * porcentaje. No sortea ni escribe nada.
 */
export function peekLeadModalVariant(
  landingSlug: string,
  showPercent: unknown
): LeadModalVariant | null {
  const percent = normalizeShowPercent(showPercent);
  if (percent >= 100 || typeof window === 'undefined') return null;
  return leerGuardado(landingSlug, percent);
}

export function resolveLeadModalVariant(
  landingSlug: string,
  showPercent: unknown,
  random: () => number = Math.random
): LeadModalAssignment {
  const percent = normalizeShowPercent(showPercent);

  if (percent >= 100 || typeof window === 'undefined') {
    return { variant: 'modal', enTest: false, esNueva: false, percent };
  }

  const guardado = leerGuardado(landingSlug, percent);
  if (guardado) {
    return { variant: guardado, enTest: true, esNueva: false, percent };
  }

  const variant: LeadModalVariant = random() * 100 < percent ? 'modal' : 'control';
  try {
    localStorage.setItem(abKey(landingSlug), JSON.stringify({ variant, percent }));
  } catch (error) {
    // Sin localStorage el grupo no se recuerda; el visitante igual queda
    // sorteado para esta carga de página.
    Sentry.captureException(error, {
      tags: { modulo: 'lead_modal', accion: 'guardar_grupo_ab', landing: landingSlug },
    });
  }
  return { variant, enTest: true, esNueva: true, percent };
}
