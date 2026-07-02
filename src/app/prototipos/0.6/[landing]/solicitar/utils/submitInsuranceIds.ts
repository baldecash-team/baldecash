/**
 * Construye la lista de ids de seguros a enviar en el submit de la solicitud.
 *
 * Incluye TODOS los seguros seleccionados — de equipo (Insurama) y A365
 * (Multiasistencia) por igual, sin distinción de tipo: cada uno es solo su id —
 * más ids extra (p.ej. la MA aceptada en el upsell de segunda oportunidad, cuyo
 * toggle de estado es async y podría no estar aún en selectedInsurances).
 * Deduplica para no mandar el mismo id dos veces.
 */
export function buildSubmitInsuranceIds(
  selectedInsurances: Array<{ id: string }>,
  extraIds: string[] = [],
): string[] {
  const baseIds = selectedInsurances.map((i) => i.id);
  return Array.from(new Set([...baseIds, ...extraIds]));
}
