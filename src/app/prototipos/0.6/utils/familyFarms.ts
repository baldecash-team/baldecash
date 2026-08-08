/**
 * Las landings del convenio Family Farms.
 *
 * Son un convenio cerrado —acceso por whitelist de DNI, cobro semanal o
 * quincenal contra planilla, inicial obligatoria— y por eso algunas piezas de
 * la pantalla no aplican ahí: el retiro en oficinas, por ejemplo, no tiene
 * sentido para trabajadores de campo a los que el equipo les llega por el
 * convenio.
 *
 * Es una lista explícita y no un preset porque hoy son tres landings conocidas
 * y meterlo en la config del backend para tres casos sería más maquinaria que
 * problema. Si aparece un cuarto convenio con las mismas reglas, ahí conviene
 * moverlo a un preset.
 */

const SLUGS = new Set([
  'family-farms-baldecash-a',
  'family-farms-baldecash-b',
  'family-farms-baldecash-c',
]);

export function esFamilyFarms(slug: string | null | undefined): boolean {
  return SLUGS.has((slug ?? '').trim().toLowerCase());
}
