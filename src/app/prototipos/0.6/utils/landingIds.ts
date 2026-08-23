/**
 * Centralized landing IDs for feature detection.
 * Use these instead of slug comparisons — slugs are editable in admin.
 */
export const LANDING_IDS = {
  MACBOOK_NEO: 150,
  ZONA_GAMER: 136,
  NVIDIA: 168,
  /**
   * Landing de equipos seminuevos. ID PROVISIONAL — reemplazar por el real
   * cuando lo asigne el admin. Es el único lugar donde vive este número.
   */
  SEMINUEVOS: 999,
} as const;
