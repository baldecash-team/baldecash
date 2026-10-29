/**
 * Construye la lista de ids de seguros a enviar en el submit de la solicitud.
 *
 * Incluye TODOS los seguros seleccionados — de equipo (Insurama) y A365
 * (Multiasistencia) por igual, sin distinción de tipo: cada uno es solo su id —
 * más ids extra (p.ej. la MA aceptada en el upsell de segunda oportunidad, cuyo
 * toggle de estado es async y podría no estar aún en selectedInsurances).
 * Deduplica para no mandar el mismo id dos veces.
 *
 * S3/R7: `excluirIds` son los seguros que ya vienen en el combo. Nunca se
 * mandan (el backend los descarta igual, S4; acá no se mandan para empezar).
 */
export function buildSubmitInsuranceIds(
  selectedInsurances: Array<{ id: string }>,
  extraIds: string[] = [],
  excluirIds: string[] = [],
): string[] {
  const fuera = new Set(excluirIds.map(String));
  const baseIds = selectedInsurances.map((i) => i.id);
  return Array.from(new Set([...baseIds, ...extraIds])).filter((id) => !fuera.has(String(id)));
}
