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

/**
 * Sanea lo que se teclea en un campo de importe.
 *
 * Los campos son de texto y no numéricos: un campo numérico responde a la rueda
 * del ratón mientras tiene el foco, así que desplazar la página con el puntero
 * encima cambia el importe sin que la persona lo advierta. El daño es
 * silencioso, porque la cuota se vuelve a simular con el monto nuevo y la
 * pantalla queda coherente consigo misma.
 *
 * A cambio, el filtrado deja de hacerlo el navegador y pasa a ser nuestro.
 *
 * Devuelve el texto tal como debe quedar en el campo, NO un número: quien está
 * escribiendo 350.50 pasa por "350." antes de llegar, y reescribirle el campo a
 * la mitad es peor que dejarlo. El número se obtiene aparte, y de un estado
 * intermedio se obtiene NaN, que la pantalla ya trata como "todavía no hay
 * monto".
 */
export function sanearMontoEscrito(texto: string): string {
  // La coma se lee como separador decimal en vez de descartarse: acá se escribe
  // indistintamente con coma o con punto, y descartarla convertiría 350,50 en
  // 35050 — cien veces el importe, en un campo cuyo valor termina en un contrato.
  const conPuntoDecimal = texto.replace(/,/g, '.');
  const soloDigitosYPunto = conPuntoDecimal.replace(/[^\d.]/g, '');

  const primerPunto = soloDigitosYPunto.indexOf('.');
  if (primerPunto === -1) return soloDigitosYPunto;

  // Manda el primer separador; los siguientes se descartan pero sus dígitos se
  // conservan, para no perder lo que la persona ya escribió.
  const parteEntera = soloDigitosYPunto.slice(0, primerPunto);
  const parteDecimal = soloDigitosYPunto
    .slice(primerPunto + 1)
    .replace(/\./g, '')
    .slice(0, 2);

  return `${parteEntera}.${parteDecimal}`;
}

/** Hay algo para simular cuando la suma es mayor a cero. */
export function montosValidos(montos: MontosMatricula): boolean {
  return totalAFinanciar(montos) > 0;
}

/**
 * Indica si lo cargado supera el máximo que financia la landing.
 *
 * Se mide sobre la SUMA y no sobre cada importe. Los dos son independientes y
 * ninguno puede ser negativo, así que un campo por encima del tope ya hace que
 * la suma lo supere: una sola regla cubre los dos casos, y evita tener el mismo
 * número comprobado en dos lugares que después se desincronizan. Además es la
 * suma lo que se financia y lo que el backend valida.
 *
 * Un tope en cero o ausente significa "sin tope": la configuración de la landing
 * es la única fuente del número, y no se reemplaza acá por uno inventado.
 */
export function excedeTope(montos: MontosMatricula, topeMaximo: number): boolean {
  return topeMaximo > 0 && totalAFinanciar(montos) > topeMaximo;
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
