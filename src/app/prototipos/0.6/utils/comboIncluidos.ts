/**
 * Seguros que vienen DENTRO del combo (S3 · combos con seguro, regla R7).
 *
 * El plan del combo sale «Incluido en tu combo», a S/0 y fijo; otro plan del
 * mismo tipo no se vende; un tipo distinto sí. Los accesorios no cambian (R8).
 *
 * Es la misma regla que `app/services/combos/seguros_por_plazo.py` del backend
 * (`elegir_por_plazo`). El "tipo" acá es `insuranceType` (en el backend, la
 * categoría del plan; van 1 a 1). El plazo es en MESES (`SelectedProduct.months`).
 */
import type { ComboInfo } from '@/app/prototipos/0.6/[landing]/producto/types/detail';
import { mesesDelProducto } from '@/app/prototipos/0.6/utils/plazoEnMeses';

export const TEXTO_INCLUIDO_EN_COMBO = 'Incluido en tu combo';

export interface SeguroDelCombo {
  planId: string;
  name: string;
  durationMonths: number | null;
  insuranceType: string | null;
}

/** Lo que el combo elegido trae, guardado en `SelectedProduct` para la barra y el resumen. */
export interface ComboItemsSeleccionados {
  insurances: SeguroDelCombo[];
}

interface ApiSeguroDelCombo {
  plan_id?: number | string | null;
  name?: string | null;
  duration_months?: number | null;
  insurance_type?: string | null;
}

/** `combo.insurances[]` del listado (snake_case). Backend viejo: `combo.insurance`. */
export function segurosDelComboDesdeApi(combo: unknown): SeguroDelCombo[] {
  const c = combo as { insurances?: ApiSeguroDelCombo[] | null; insurance?: ApiSeguroDelCombo | null } | null | undefined;
  if (!c) return [];
  const lista = Array.isArray(c.insurances) ? c.insurances : c.insurance ? [c.insurance] : [];
  return lista
    .filter((s) => s && s.plan_id != null)
    .map((s) => ({
      planId: String(s.plan_id),
      name: s.name ?? '',
      durationMonths: s.duration_months ?? null,
      insuranceType: s.insurance_type ?? null,
    }));
}

const tipoDe = (s: SeguroDelCombo) => s.insuranceType ?? `plan-${s.planId}`;

/**
 * Los seguros del combo que aplican al plazo (en meses): por tipo, la versión
 * de ese plazo; si el tipo tiene una sola vigencia, esa; varias y ninguna del
 * plazo, ese tipo no va. Sin vigencia: se queda (defensivo). Sin plazo: todos.
 * Igual que `elegir_por_plazo` del backend.
 */
export function segurosParaElPlazo(seguros: SeguroDelCombo[], termMonths?: number | null): SeguroDelCombo[] {
  if (termMonths == null) return seguros;
  const vigencias = new Map<string, Set<number>>();
  for (const s of seguros) {
    const delTipo = vigencias.get(tipoDe(s)) ?? new Set<number>();
    if (s.durationMonths != null) delTipo.add(s.durationMonths);
    vigencias.set(tipoDe(s), delTipo);
  }
  return seguros.filter(
    (s) => (vigencias.get(tipoDe(s))?.size ?? 0) <= 1 || s.durationMonths == null || s.durationMonths === termMonths,
  );
}

export function etiquetaDeTipoDeSeguro(tipo: string | null | undefined, nombre: string): string {
  switch (tipo) {
    case 'seguro_robo': return 'Seguro contra robo';
    case 'garantia_extendida': return 'Garantía extendida';
    case 'multiasistencia': return 'Multiasistencia';
    default: return nombre;
  }
}

/** «Incluye Mochila · Seguro contra robo · Garantía extendida» para la card. Sin seguros: null. */
export function textoIncluyeDelCombo(
  accesorios: { name: string }[] | undefined,
  seguros: SeguroDelCombo[] | undefined,
): string | null {
  if (!seguros || seguros.length === 0) return null;
  const tipos = Array.from(new Set(seguros.map((s) => etiquetaDeTipoDeSeguro(s.insuranceType, s.name))));
  const partes = [...(accesorios ?? []).map((a) => a.name).filter(Boolean), ...tipos];
  return `Incluye ${partes.join(' · ')}`;
}

export function comboItemsDesdeDetalle(combo?: ComboInfo | null): ComboItemsSeleccionados | undefined {
  const seguros = (combo?.insurances ?? []).map((s) => ({
    planId: String(s.planId),
    name: s.name,
    durationMonths: s.durationMonths ?? null,
    insuranceType: s.insuranceType ?? null,
  }));
  return seguros.length > 0 ? { insurances: seguros } : undefined;
}

export function comboItemsDesdeCatalogo(p: { comboInsurances?: SeguroDelCombo[] }): ComboItemsSeleccionados | undefined {
  return p.comboInsurances && p.comboInsurances.length > 0 ? { insurances: p.comboInsurances } : undefined;
}

/**
 * Los seguros del combo del producto elegido que aplican a SU plazo, en meses
 * con la fórmula del submit (`mesesDelProducto`): copia-home guarda cuotas en
 * `months`, y así lo que se muestra es lo que se emite.
 */
export function segurosIncluidosDelProducto(
  p?: { comboItems?: ComboItemsSeleccionados; months?: number; term?: number; paymentFrequency?: string } | null,
): SeguroDelCombo[] {
  const seguros = p?.comboItems?.insurances;
  if (!seguros || seguros.length === 0) return [];
  return segurosParaElPlazo(seguros, mesesDelProducto(p) ?? null);
}

/** Parte la respuesta de `/insurances?combo_id=` en incluidos y los que se venden. */
export function separarIncluidos<T extends { includedInCombo?: boolean }>(planes: T[]): { incluidos: T[]; ofrecidos: T[] } {
  return {
    incluidos: planes.filter((p) => p.includedInCombo === true),
    ofrecidos: planes.filter((p) => p.includedInCombo !== true),
  };
}

/**
 * Seguros elegidos que ya no se pueden vender porque el combo trae ese mismo
 * plan o uno de su tipo (p. ej. quedaron guardados de un equipo anterior).
 */
export function idsQueNoSeVendenConElCombo(
  elegidos: { id: string; insuranceType?: string | null }[],
  incluidos: { id: string; insuranceType?: string | null }[],
): string[] {
  if (incluidos.length === 0) return [];
  const ids = new Set(incluidos.map((i) => i.id));
  const tipos = new Set(incluidos.map((i) => i.insuranceType).filter(Boolean));
  return elegidos
    .filter((e) => ids.has(e.id) || (e.insuranceType != null && tipos.has(e.insuranceType)))
    .map((e) => e.id);
}
