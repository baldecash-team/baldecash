/**
 * Tipos y constantes de la calculadora de matrícula.
 */

/** Plazos ofrecidos. El backend admite de 3 a 36 meses; el producto usa estos cuatro. */
export const PLAZOS_MESES = [3, 6, 9, 12] as const;
export type PlazoMeses = (typeof PLAZOS_MESES)[number];

export const PLAZO_POR_DEFECTO: PlazoMeses = 3;

/**
 * Datos que el solicitante carga en la calculadora.
 *
 * Los dos montos son independientes y **cualquiera de los dos puede ser cero**:
 * quien ya pagó la matrícula por su cuenta financia solo la primera cuota, y al
 * revés. Lo que no puede ser cero es la suma.
 */
export interface MontosMatricula {
  /** Monto de la matrícula, en soles. */
  matricula: number;
  /** Monto de la primera cuota, en soles. */
  primeraCuota: number;
}

export const MONTOS_VACIOS: MontosMatricula = { matricula: 0, primeraCuota: 0 };

/** Suma de ambos montos: es lo que efectivamente se financia. */
export function totalAFinanciar(montos: MontosMatricula): number {
  return redondearSoles(montos.matricula + montos.primeraCuota);
}

/**
 * Redondea a dos decimales sin arrastrar el error del punto flotante.
 *
 * Hace falta porque los montos se ingresan con céntimos ("el monto exacto que te
 * aparece al consultar tu código de alumno") y sumar 350.50 + 450.80 en coma
 * flotante no da 801.30 exacto.
 */
export function redondearSoles(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Hay algo para simular cuando la suma es mayor a cero. */
export function montosValidos(montos: MontosMatricula): boolean {
  return totalAFinanciar(montos) > 0;
}

/** Formatea un monto en soles para mostrar. */
export function formatearSoles(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return `S/ ${valor.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Formatea una tasa en porcentaje. Distingue "sin tasa" de "tasa cero". */
export function formatearTasa(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
  return `${valor.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
