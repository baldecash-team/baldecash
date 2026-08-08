/**
 * Cómo se escribe una cuota en pantalla, con o sin centavos.
 *
 * Todo el catálogo muestra cuotas enteras: el motor las redondea con `floor`,
 * así que truncarlas al pintarlas nunca cambiaba nada. Family Farms es el
 * primer convenio con centavos reales —negocio cotizó S/70,50 y S/41,50 en su
 * Excel— y ahí truncar miente: la tarjeta prometía S/70 y el contrato decía
 * S/70,50.
 *
 * El comportamiento es opt-in por landing a propósito. Encenderlo para todo el
 * catálogo cambiaría la forma de precios que llevan años publicados, y esa no
 * es una decisión que salga de un cambio de formato.
 */

/**
 * Landings que muestran los centavos de la cuota.
 *
 * TEMPORAL Y ACOTADO. Cuando el catálogo entero adopte la misma regla, esta
 * lista se borra y `mostrarCentavos` pasa a ser siempre true.
 */
const LANDINGS_CON_CENTAVOS = new Set([
  'family-farms-baldecash-a',
  'family-farms-baldecash-b',
  'family-farms-baldecash-c',
]);

/** Si la landing muestra los centavos de sus cuotas. */
export function landingMuestraCentavos(slug: string | null | undefined): boolean {
  return LANDINGS_CON_CENTAVOS.has((slug ?? '').trim().toLowerCase());
}

/**
 * Formatea un monto para mostrarlo, respetando la regla de la landing.
 *
 * - Donde no se muestran centavos: se trunca, que es lo que se hacía siempre.
 * - Donde sí: se muestran solo si existen. `25` sigue siendo «25», no «25.00»,
 *   para no ensuciar los montos redondos.
 *
 * No agrega el símbolo de moneda: eso lo pone quien lo pinta, que ya lo hacía.
 */
export function formatCuota(
  monto: number,
  opciones: { conCentavos?: boolean } = {},
): string {
  if (!Number.isFinite(monto)) return '0';

  if (!opciones.conCentavos) {
    // Comportamiento histórico: `Math.floor` + miles con separador.
    return Math.floor(monto).toLocaleString('es-PE');
  }

  const redondeado = Math.round(monto * 100) / 100;
  if (Number.isInteger(redondeado)) {
    return redondeado.toLocaleString('es-PE');
  }
  return redondeado.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Atajo para el caso más común: formatear según el slug de la landing. */
export function formatCuotaDeLanding(
  monto: number,
  landingSlug: string | null | undefined,
): string {
  return formatCuota(monto, { conCentavos: landingMuestraCentavos(landingSlug) });
}
