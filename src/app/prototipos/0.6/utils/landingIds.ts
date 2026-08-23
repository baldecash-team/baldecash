/**
 * Centralized landing IDs for feature detection.
 * Use these instead of slug comparisons — slugs are editable in admin.
 */
export const LANDING_IDS = {
  MACBOOK_NEO: 150,
  ZONA_GAMER: 136,
  NVIDIA: 168,
  /**
   * Landing de equipos seminuevos/reacondicionados (BAL-3288).
   * El slug es editable en el admin: la detección va siempre por este id.
   */
  SEMINUEVOS: 241,
} as const;
