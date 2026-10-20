/**
 * Filtro de una lista que viene del sistema (BAL-4384).
 *
 * Un solo contrato para el wizard (`form_field.options_filter`) y para el
 * formulario de leads (`landing_field.custom_validation.options_filter`). Es
 * el superconjunto de los dos que existían, así que lo guardado hoy arma
 * EXACTAMENTE las mismas URLs:
 * - wizard `{depends_on}` → `type=<valor del campo>`
 * - leads `{type[], ids[]}` → `type=a,b&ids=1,2`
 * El mismo contrato se valida en ws2 (`app/services/cascada_y_filtro.py`).
 */
export interface FiltroDeOpciones {
  depends_on?: string;
  param?: 'type' | 'study_center_id';
  type?: string[];
  ids?: number[];
  from_agreement?: boolean;
}

export interface ContextoDeFiltro {
  /** Valor actual de otro campo del formulario (para `depends_on`). */
  valorDe?: (code: string) => string | undefined;
  /** Convenio de la landing (para `from_agreement`). */
  agreementId?: number;
}

export function parametrosDeFiltro(
  filtro: FiltroDeOpciones | null | undefined,
  ctx: ContextoDeFiltro = {},
): Array<[string, string]> {
  if (!filtro) return [];
  const salida = new Map<string, string>();
  if (filtro.type?.length) salida.set('type', filtro.type.join(','));
  if (filtro.ids?.length) salida.set('ids', filtro.ids.join(','));
  if (filtro.depends_on) {
    const valor = ctx.valorDe?.(filtro.depends_on);
    if (valor) salida.set(filtro.param ?? 'type', String(valor));
  }
  if (filtro.from_agreement && ctx.agreementId) salida.set('agreement_id', String(ctx.agreementId));
  const orden = ['type', 'ids', 'study_center_id', 'agreement_id'];
  return orden.filter((k) => salida.has(k)).map((k) => [k, salida.get(k)!]);
}

/**
 * Tipos de institución que el paso permite (BAL-4841,
 * `allowed_institution_types`). Sin lista = los pares tal cual. Con lista:
 * - si el filtro no manda `type`, se manda `type=<los permitidos>`;
 * - si ya manda `type` (p. ej. la respuesta de «Tipo de institución»), se
 *   cruzan: solo quedan los que están en los dos (no se pisan).
 * `null` = el cruce quedó vacío: no hay nada que buscar. Mandar la búsqueda
 * sin `type` traería TODOS los tipos, justo lo contrario.
 */
export function conTiposPermitidos(
  pares: Array<[string, string]>,
  permitidos: string[] | null | undefined,
): Array<[string, string]> | null {
  if (!permitidos?.length) return pares;
  const delFiltro = pares.find(([k]) => k === 'type');
  const tipos = delFiltro
    ? delFiltro[1].split(',').map((t) => t.trim()).filter((t) => permitidos.includes(t))
    : [...permitidos];
  if (tipos.length === 0) return null;
  return [['type', tipos.join(',')], ...pares.filter(([k]) => k !== 'type')];
}
