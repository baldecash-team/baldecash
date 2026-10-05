/**
 * Decide si mostrar el popup de "segunda oportunidad" de Multiasistencia (A365)
 * al enviar la solicitud.
 *
 * Se muestra cuando hay un plan MA disponible para la landing/producto que el
 * usuario NO agregó y todavía no rechazó el upsell (y no se pidió saltarlo,
 * p.ej. al reintentar el submit tras aceptar o declinar).
 */
export function shouldOfferMaUpsell(params: {
  availableMultiasistencia: unknown | null | undefined;
  maSelected: boolean;
  declined: boolean;
  skipUpsell?: boolean;
}): boolean {
  const { availableMultiasistencia, maSelected, declined, skipUpsell } = params;
  return !skipUpsell && !!availableMultiasistencia && !maSelected && !declined;
}
