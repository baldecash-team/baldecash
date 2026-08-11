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

/**
 * El perfil ADMINISTRATIVO del convenio (G1 del diseño de Valle y Pampa).
 *
 * Es el único que cobra **quincenal** y por **descuento por planilla** —Valle y
 * Pampa retiene y transfiere—, mientras que los otros dos cobran semanal y con
 * pago directo a BaldeCash. Por eso la autorización de retención de haberes solo
 * le corresponde a él.
 *
 * Se distingue por la landing: el spec dejó abierto si A/B/C son G1/G2/G3 (P9),
 * pero el pricing publicado no deja lugar a dudas — `-a` es la única con
 * `payment_frequency = quincenal` (22 filas de `landing_variant_pricing`), y las
 * otras dos son semanales. Si algún día el grupo llega desde la planilla en vez
 * de deducirse de la landing, este es el único punto a cambiar.
 */
const SLUG_ADMINISTRATIVO = 'family-farms-baldecash-a';

export function esFamilyFarmsAdministrativo(slug: string | null | undefined): boolean {
  return (slug ?? '').trim().toLowerCase() === SLUG_ADMINISTRATIVO;
}
