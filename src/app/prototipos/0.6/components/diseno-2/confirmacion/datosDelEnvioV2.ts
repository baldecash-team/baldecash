import { useMemo, useSyncExternalStore } from 'react';

/**
 * Día de pago y distrito de la solicitud recién enviada, para la tarjeta
 * «Tu solicitud» de la confirmación de Diseño 2 (BAL-5274).
 *
 * El `/status` público no los trae, y el formulario se limpia apenas el
 * envío sale bien. Así que el envío los deja acá (sessionStorage de la
 * pestaña, atados al código de la solicitud) justo antes de limpiar, y la
 * confirmación los lee. Abriendo el link en otro equipo no hay nada que leer
 * y esas filas no se pintan (como hasta hoy).
 *
 * Son los MISMOS valores que viajaron en el envío (`form_data.payment_day` y
 * la etiqueta del distrito elegido), no un cálculo.
 */

export interface DatosDelEnvioV2 {
  /** Día del mes elegido (1-31). */
  paymentDay: number | null;
  /** Nombre del distrito como se le mostró a la persona («Miraflores»). */
  distrito: string | null;
}

interface Guardado extends DatosDelEnvioV2 {
  code: string;
}

function clave(landing: string): string {
  return `baldecash-${landing}-datos-del-envio-v2`;
}

/** Campo del wizard tal como vive en `formData` (`{ value, label }`). */
interface CampoMinimo {
  value?: unknown;
  label?: string;
}

/** Saca día de pago y distrito del `formData` del wizard. */
export function datosDelFormulario(formData: Record<string, CampoMinimo | undefined>): DatosDelEnvioV2 {
  const crudo = formData.payment_day?.value;
  const dia = Number(Array.isArray(crudo) ? crudo[0] : crudo);
  const distrito = formData.district?.label?.trim() || null;
  return {
    paymentDay: Number.isInteger(dia) && dia >= 1 && dia <= 31 ? dia : null,
    distrito,
  };
}

export function guardarDatosDelEnvio(landing: string, code: string | null | undefined, datos: DatosDelEnvioV2): void {
  if (typeof window === 'undefined' || !code) return;
  if (datos.paymentDay === null && datos.distrito === null) return;
  try {
    const guardado: Guardado = { code, ...datos };
    window.sessionStorage.setItem(clave(landing), JSON.stringify(guardado));
  } catch {
    // Sin almacenamiento (modo privado, cuota): la tarjeta omite esas filas.
  }
}

/** Lo que dejó el envío de ESTA solicitud, o `null` (otro código, otro equipo, nada guardado). */
export function leerDatosDelEnvio(landing: string, code: string | null | undefined): DatosDelEnvioV2 | null {
  if (typeof window === 'undefined' || !code) return null;
  try {
    const crudo = window.sessionStorage.getItem(clave(landing));
    if (!crudo) return null;
    const g = JSON.parse(crudo) as Partial<Guardado>;
    if (g.code !== code) return null;
    return {
      paymentDay: typeof g.paymentDay === 'number' ? g.paymentDay : null,
      distrito: typeof g.distrito === 'string' && g.distrito.trim() ? g.distrito.trim() : null,
    };
  } catch {
    return null;
  }
}

/** «En tu casa · Miraflores» (prototipo). Sin distrito no hay fila. */
export function textoDeEntrega(distrito: string | null | undefined): string | null {
  const limpio = (distrito || '').trim();
  return limpio ? `En tu casa · ${limpio}` : null;
}

function sinSuscripcion(): () => void {
  return () => {};
}

/**
 * `leerDatosDelEnvio` para un componente: en el servidor (y en la primera
 * pasada de hidratación) devuelve `null`; en el cliente, lo guardado. Con
 * `landing` en `null` no lee nada (Diseño 1).
 */
export function useDatosDelEnvioV2(landing: string | null, code: string | null | undefined): DatosDelEnvioV2 | null {
  const crudo = useSyncExternalStore(
    sinSuscripcion,
    () => {
      if (!landing) return null;
      try {
        return window.sessionStorage.getItem(clave(landing));
      } catch {
        return null;
      }
    },
    () => null,
  );
  return useMemo(() => (crudo && landing ? leerDatosDelEnvio(landing, code) : null), [crudo, landing, code]);
}
