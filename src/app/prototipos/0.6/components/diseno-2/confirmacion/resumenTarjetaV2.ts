/**
 * Datos de la tarjeta "Tu solicitud" de `ConfirmacionV2` (F8, BAL-4967;
 * rediseño BAL-5274): reglas puras a partir de `ReceivedData`, la MISMA data
 * que arma `buildReceivedData` para Diseño 1 (sin recalcular nada acá — la
 * cuota y la inicial son las que ya mandó el backend).
 *
 * El prototipo de BAL-5274 muestra: equipo, plazo con «Sin inicial» o
 * «Inicial S/X», cuota mensual total, día de pago, entrega y regalo. Ya no
 * lista accesorios ni protecciones (la cuota total los incluye).
 *
 * `paymentDay` y `entrega` no vienen en el `/status` público: los deja el
 * propio envío en esta pestaña (`datosDelEnvioV2`). Sin ellos (link abierto
 * en otro equipo) la fila se omite, sin dejar una línea vacía.
 */
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';
import { displayMonths, periodUnitLabel } from '@/app/prototipos/0.6/utils/paymentTerm';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';

export interface ResumenTarjetaV2 {
  nombreEquipo: string;
  leyenda: string;
  rotuloCuota: string;
  cuota: string;
  sufijoCuota: string;
  diaDePago: string | null;
  entrega: string | null;
  /** Foto del equipo (solo con un equipo; con varios no hay una sola foto). */
  imagen: string | null;
  /**
   * Cada regalo por separado (una cápsula por regalo: con todos juntos se
   * partía en celular). Incluye el regalo de BaldeCash (regalo Dinet,
   * `regaloBaldecash`), que en `main` viaja aparte de `accessories`.
   */
  regalos: string[];
}

export interface OpcionesTarjetaV2 {
  /** Día del mes (1-31). Ver nota de disponibilidad arriba. */
  paymentDay?: number | null;
  /** Ya armado como "En tu casa · {distrito}" / "En tu trabajo · {distrito}". */
  entrega?: string | null;
}

function formatPrecio(n: number, landingSlug: string): string {
  return `S/${formatCuotaDeLanding(n, landingSlug)}`;
}

/** `null` sin productos: no hay equipo que resumir (p. ej. el estado de error/no-encontrada, con `ReceivedData` por defecto). */
export function resumenDeTarjetaV2(
  data: ReceivedData,
  landingSlug: string,
  opciones: OpcionesTarjetaV2 = {},
): ResumenTarjetaV2 | null {
  if (!data.products.length) return null;

  const nombreEquipo =
    data.products.length > 1 ? `${data.products.length} equipos` : data.products[0].name;

  const periodCount = data.term ?? data.termMonths;
  const periodLabel = periodUnitLabel(data.paymentFrequency, periodCount !== 1);
  const isNonMonthly = !!data.paymentFrequency && data.paymentFrequency !== 'mensual';
  const equivalentMonths =
    isNonMonthly && data.term ? displayMonths(data.term, data.paymentFrequency) : null;
  const plazoTexto = `${periodCount} ${periodLabel}${equivalentMonths ? ` (${equivalentMonths} meses)` : ''}`;
  const inicialTexto =
    data.initialPayment && data.initialPayment > 0
      ? `Inicial ${formatPrecio(data.initialPayment, landingSlug)}`
      : 'Sin inicial';
  const leyenda = `${plazoTexto} · ${inicialTexto}`;

  const rotuloCuota =
    data.paymentFrequency === 'semanal'
      ? 'Cuota semanal total'
      : data.paymentFrequency === 'quincenal'
        ? 'Cuota quincenal total'
        : 'Cuota mensual total';
  const sufijoCuota = sufijoDeFrecuencia(data.paymentFrequency);
  // La cuota es la que ya trae el backend (`totalMonthlyQuota`): nunca se recalcula acá.
  const cuota = formatPrecio(data.totalMonthlyQuota, landingSlug);

  const diaDePago =
    typeof opciones.paymentDay === 'number' && opciones.paymentDay > 0
      ? `Día ${opciones.paymentDay} de cada mes`
      : null;

  const entrega = opciones.entrega?.trim() || null;

  const regaloBaldecash = data.regaloBaldecash?.name?.trim() || null;
  const regalos = [
    ...(data.accessories || []).filter((a) => a.isGift).map((a) => a.name),
    ...(regaloBaldecash ? [regaloBaldecash] : []),
  ];

  // Foto del equipo: la persona tiene que ver lo que pidió (Emilio, 28-oct).
  const imagen = data.products.length === 1 ? data.products[0].image?.trim() || null : null;

  return {
    nombreEquipo,
    leyenda,
    rotuloCuota,
    cuota,
    sufijoCuota,
    diaDePago,
    entrega,
    regalos,
    imagen,
  };
}
