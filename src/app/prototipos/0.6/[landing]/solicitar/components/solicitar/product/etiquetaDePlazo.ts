/**
 * El rótulo del selector de plazo.
 *
 * Con la inicial fraccionada, el `term` del backend son las CUOTAS de
 * financiamiento, y las armadas se descuentan del plazo en vez de extenderlo:
 *
 *     cuotas = plazo_total − armadas
 *
 * Así que las seis celdas del cosechador de Family Farms —6, 8, 10, 13, 15 y 17
 * cuotas— son en realidad dos plazos de tres modalidades cada uno. Listar los
 * `term` crudos hacía que quien elegía «13 semanas» no viera que estaba
 * eligiendo pagar la inicial en cuatro partes, ni que su plan dura lo mismo que
 * el de «17 semanas».
 *
 * El selector sigue ofreciendo una opción por celda —en el pricing el plazo y la
 * modalidad son la misma celda, y separarlos ofrecería combinaciones que no
 * existen—, pero rotuladas con el plazo total y la modalidad al lado.
 *
 * **El resto del catálogo no se entera.** El sufijo aparece solo si alguna
 * opción se fracciona; con pago único `etiquetasDePlazo` devuelve un mapa vacío
 * y el selector cae a su rótulo de siempre. Por eso el gate es «tiene armadas» y
 * no la landing: si mañana otra carga celdas fraccionadas, funciona sola.
 */

export interface OpcionDePlan {
  initialPercent?: number;
  initialAmount?: number;
  monthlyQuota?: number;
  /** En cuántas partes se paga la inicial. Ausente o 1 = un solo pago. */
  initialInstallments?: number;
}

export interface PlanDePago {
  term: number;
  termMonths?: number | null;
  options: OpcionDePlan[];
}

/** Unidad del plazo según la frecuencia de cobro, singular o plural. */
export const getTermUnit = (count: number, frequency?: string): string => {
  if (frequency === 'semanal') return count === 1 ? 'semana' : 'semanas';
  if (frequency === 'quincenal') return count === 1 ? 'quincena' : 'quincenas';
  return count === 1 ? 'mes' : 'meses';
};

/**
 * En cuántas armadas se paga la inicial de este plan.
 *
 * Se lee de la primera opción porque las opciones de un plan se distinguen por
 * el porcentaje de inicial, no por cómo se paga: una celda de pricing es un
 * plazo y una modalidad.
 */
export function armadasDelPlan(plan: PlanDePago): number {
  return plan.options?.[0]?.initialInstallments ?? 1;
}

/**
 * Plazo total del plan: las cuotas más las armadas.
 *
 * Sin armadas el total ES el `term` —el pago único es inmediato y no ocupa un
 * período del calendario—, y por eso esto es la identidad para todo producto
 * que no las use.
 */
export function plazoTotalDelPlan(plan: PlanDePago): number {
  const armadas = armadasDelPlan(plan);
  return armadas > 1 ? plan.term + armadas : plan.term;
}

/** Si alguno de los planes ofrece pagar la inicial en partes. */
export function hayArmadas(plans: PlanDePago[]): boolean {
  return plans.some((plan) => armadasDelPlan(plan) > 1);
}

/**
 * Rótulo por `term`, o un mapa **vacío** si el producto no tiene armadas.
 *
 * Vacío en vez de completo a propósito: el consumidor no tiene que saber si el
 * mapa está entero. Sin entrada para un `term`, el selector usa su rótulo por
 * defecto — el camino que recorre todo el catálogo.
 */
export function etiquetasDePlazo(
  plans: PlanDePago[],
  frequency?: string,
): Map<number, string> {
  const etiquetas = new Map<number, string>();
  if (!hayArmadas(plans)) return etiquetas;

  for (const plan of plans) {
    const total = plazoTotalDelPlan(plan);
    const armadas = armadasDelPlan(plan);
    const modalidad = armadas > 1 ? `${armadas} armadas` : '1 pago';
    etiquetas.set(plan.term, `${total} ${getTermUnit(total, frequency)} · ${modalidad}`);
  }

  return etiquetas;
}

/**
 * Los plazos en el orden en que se leen: por plazo total y, dentro de uno, de
 * menos a más armadas. Sin armadas es el orden numérico de siempre.
 *
 * Un `term` sin plan conserva su valor como total: el selector interseca los
 * plazos de varios productos y puede llegar uno que este producto no ofrece.
 */
export function ordenarTerms(plans: PlanDePago[], terms: number[]): number[] {
  const porTerm = new Map(plans.map((plan) => [plan.term, plan]));

  const clave = (term: number): [number, number] => {
    const plan = porTerm.get(term);
    return plan ? [plazoTotalDelPlan(plan), armadasDelPlan(plan)] : [term, 1];
  };

  return [...terms].sort((a, b) => {
    const [totalA, armadasA] = clave(a);
    const [totalB, armadasB] = clave(b);
    return totalA - totalB || armadasA - armadasB;
  });
}
