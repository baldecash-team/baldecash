/**
 * Qué se compara contra el tope en la pantalla de complementos.
 *
 * - Tope normal (motor, oferta automática): equipo + accesorios + seguros. Un
 *   add-on solo se puede marcar si cabe en lo que queda.
 * - Tope de efectivo (BAL-4910, `soloEquipo`): solo la cuota del equipo. Los
 *   accesorios y seguros van aparte: se pueden marcar aunque el total pase el
 *   tope. El backend (`/addons` y `/select`) aplica la misma regla.
 *
 * Todo en MENSUAL (el tope es mensual). Tolerancia de S/0.50 por redondeo,
 * la misma que ya usaba la pantalla.
 */
const TOLERANCIA = 0.5;

export interface MedicionDelTope {
  /** Lo que queda del tope tras lo que se mide (Infinity sin tope). */
  restante: number;
  /** Lo medido pasa el tope: no se puede confirmar. */
  seExcede: boolean;
  /** ¿Un add-on de esa cuota mensual se puede agregar? */
  cabe: (cuotaMensual: number) => boolean;
}

export function medirContraElTope(params: {
  tope: number | null;
  cuotaEquipo: number;
  cuotaTotal: number;
  soloEquipo: boolean;
}): MedicionDelTope {
  const { tope, cuotaEquipo, cuotaTotal, soloEquipo } = params;
  if (tope == null) {
    return { restante: Infinity, seExcede: false, cabe: () => true };
  }
  const medido = soloEquipo ? cuotaEquipo : cuotaTotal;
  const restante = tope - medido;
  return {
    restante,
    seExcede: medido > tope + TOLERANCIA,
    // En efectivo los add-ons no se suman contra el tope: siempre caben.
    cabe: (cuotaMensual: number) => soloEquipo || (cuotaMensual || 0) <= restante + TOLERANCIA,
  };
}
