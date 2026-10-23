/**
 * Textos de Diseño 2 que no aplican a todas las landings (BAL-4969,
 * casuísticas): "Envío gratis a todo el Perú", "Firmas y te enviamos tu
 * laptop", el subtítulo del Paso 4 ("Elige tu día de pago, confirma tu
 * dirección…") y "Día de pago · Por elegir".
 *
 * No hay un dato de la landing que diga "esta landing envía a domicilio". Lo
 * que sí hay es el formulario: si no pide dirección, no hay envío que
 * prometer; si no pide día de pago, no hay día que elegir. Además Locker Truck
 * (se recoge en el camión) y los préstamos de efectivo nunca envían nada.
 */

interface CampoMinimo {
  code: string;
  type?: string;
}
interface PasoMinimo {
  fields?: readonly CampoMinimo[];
  description?: string | null;
}

const TIPOS_DE_DIRECCION = new Set(['address', 'address_autocomplete']);

function algunCampo(pasos: readonly PasoMinimo[], cumple: (c: CampoMinimo) => boolean): boolean {
  return pasos.some((p) => (p.fields ?? []).some(cumple));
}

export function pidenDireccion(pasos: readonly PasoMinimo[]): boolean {
  return algunCampo(pasos, (c) => TIPOS_DE_DIRECCION.has(String(c.type)) || c.code === 'address');
}

export function pidenDiaDePago(pasos: readonly PasoMinimo[]): boolean {
  return algunCampo(pasos, (c) => c.code === 'payment_day');
}

/**
 * ¿Se le promete envío a domicilio? Sin pasos cargados todavía no se sabe y se
 * deja el texto de siempre: ocultarlo de golpe por una carga lenta sería
 * cambiarle el panel a todas las landings que sí envían.
 */
export function hayEnvioADomicilio(o: {
  pasos: readonly PasoMinimo[];
  overlayVariant?: string | null;
  tipoDeProducto?: string | null;
}): boolean {
  if (o.overlayVariant === 'lockertruck') return false;
  if (String(o.tipoDeProducto ?? '').toLowerCase() === 'efectivo') return false;
  if (o.pasos.length === 0) return true;
  return pidenDireccion(o.pasos);
}

/** El subtítulo de Brenda, cuando el paso pide día de pago Y dirección. */
export const SUBTITULO_PASO4_COMPLETO = 'Elige tu día de pago, confirma tu dirección y envía tu solicitud.';

/**
 * El subtítulo del Paso 4 cuando la BD no trae descripción: dice solo lo que
 * el paso pide de verdad.
 */
export function subtituloDelPaso4(paso: PasoMinimo): string {
  const descripcion = paso.description?.trim();
  if (descripcion) return descripcion;
  const dia = pidenDiaDePago([paso]);
  const direccion = pidenDireccion([paso]);
  if (dia && direccion) return SUBTITULO_PASO4_COMPLETO;
  if (dia) return 'Elige tu día de pago y envía tu solicitud.';
  if (direccion) return 'Confirma tu dirección y envía tu solicitud.';
  return 'Revisa tu solicitud y envíala.';
}

/** "laptop", "celular", "tablet"… para "te enviamos tu {equipo}". */
export function nombreDelEquipoV2(tipo: string | null | undefined): string {
  const t = String(tipo ?? '').trim().toLocaleLowerCase('es-PE');
  return t && t !== 'efectivo' ? t : 'equipo';
}
