import { useMemo, useSyncExternalStore } from 'react';
import { nombreDelEquipo } from './nombreDelEquipo';

/**
 * Nombres de los equipos de la solicitud recién enviada, tal como los vio la
 * persona en la card del catálogo (BAL-5407).
 *
 * `/status` devuelve en `products[].name` el `product.name` interno de BD
 * («PM1503CDA»), no el nombre de venta de la card («Laptop PM1503CDA R5 16GB
 * 512GB»). El envío deja acá (sessionStorage de la pestaña, atado al código de
 * la solicitud) el nombre que se mostró, y la confirmación lo usa en vez del
 * del `/status`. Abriendo el link en otro equipo no hay nada que leer y se
 * muestra lo que traiga el `/status` (como hasta hoy).
 */

export interface NombreEnviado {
  nombre: string;
  /** Variante (color) elegida, para emparejar con `/status` si hay varios. */
  variantId?: string;
}

interface Guardado {
  code: string;
  equipos: NombreEnviado[];
}

function clave(landing: string): string {
  return `baldecash-${landing}-nombres-del-envio`;
}

export function guardarNombresDelEnvio(
  landing: string,
  code: string | null | undefined,
  productos: Array<{ name?: string | null; shortName?: string | null; variantId?: string }>,
): void {
  if (typeof window === 'undefined' || !code) return;
  const equipos = productos
    .map((p) => ({ nombre: nombreDelEquipo(p), variantId: p.variantId || undefined }))
    .filter((e) => e.nombre);
  if (equipos.length === 0) return;
  try {
    const guardado: Guardado = { code, equipos };
    window.sessionStorage.setItem(clave(landing), JSON.stringify(guardado));
  } catch {
    // Sin almacenamiento (modo privado, cuota): se muestra el nombre del /status.
  }
}

/** Lo que dejó el envío de ESTA solicitud, o `null` (otro código, otro equipo, nada guardado). */
export function leerNombresDelEnvio(landing: string, code: string | null | undefined): NombreEnviado[] | null {
  if (typeof window === 'undefined' || !code) return null;
  try {
    const crudo = window.sessionStorage.getItem(clave(landing));
    if (!crudo) return null;
    const g = JSON.parse(crudo) as Partial<Guardado>;
    if (g.code !== code || !Array.isArray(g.equipos)) return null;
    const equipos = g.equipos
      .filter((e): e is NombreEnviado => !!e && typeof e.nombre === 'string' && !!e.nombre.trim())
      .map((e) => ({ nombre: e.nombre.trim(), variantId: typeof e.variantId === 'string' ? e.variantId : undefined }));
    return equipos.length ? equipos : null;
  } catch {
    return null;
  }
}

/**
 * Nombre a mostrar para el producto `indice` del `/status`.
 *
 * Orden: el `display_name` del backend si algún día lo manda; si no, el que
 * guardó el envío (emparejado por variante, o el único si hay uno solo de cada
 * lado); si no, el `name` del `/status`.
 */
export function nombreParaConfirmacion(
  producto: { name: string; display_name?: string | null; variant?: { id: number } | null },
  totalDelStatus: number,
  enviados: NombreEnviado[] | null | undefined,
): string {
  const delBackend = producto.display_name?.trim();
  if (delBackend) return delBackend;
  if (enviados?.length) {
    const variante = producto.variant?.id != null ? String(producto.variant.id) : null;
    const porVariante = variante ? enviados.find((e) => e.variantId === variante) : undefined;
    if (porVariante) return porVariante.nombre;
    if (totalDelStatus === 1 && enviados.length === 1) return enviados[0].nombre;
  }
  return producto.name;
}

function sinSuscripcion(): () => void {
  return () => {};
}

/**
 * `leerNombresDelEnvio` para un componente: en el servidor (y en la primera
 * pasada de hidratación) devuelve `null`; en el cliente, lo guardado.
 */
export function useNombresDelEnvio(landing: string, code: string | null | undefined): NombreEnviado[] | null {
  const crudo = useSyncExternalStore(
    sinSuscripcion,
    () => {
      try {
        return window.sessionStorage.getItem(clave(landing));
      } catch {
        return null;
      }
    },
    () => null,
  );
  return useMemo(() => (crudo ? leerNombresDelEnvio(landing, code) : null), [crudo, landing, code]);
}
