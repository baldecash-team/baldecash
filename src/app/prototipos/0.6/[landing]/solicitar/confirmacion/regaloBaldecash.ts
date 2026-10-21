/**
 * Regalo de BaldeCash (regalo Dinet) en la confirmación.
 *
 * Cuando la solicitud es de una laptop reacondicionada que está en Dinet, ws2
 * sortea un accesorio a S/0 y lo marca con `gift_source = "regalo_dinet"`
 * (distinto del regalo del combo, `gift_source = "combo"`). Ese accesorio no
 * se lista en el acordeón «Accesorios»: se anuncia aparte, en un bloque propio.
 *
 * Si el backend no manda `gift_source` (versión vieja) no hay regalo que
 * separar y la página queda exactamente como antes.
 */

/** Textos provisionales: los define Marketing. Cambiar solo acá. */
export const REGALO_BALDECASH_TEXTOS = {
  titulo: '🎁 BaldeCash te regala',
  etiquetaPrecio: 'Gratis',
  detalle: 'Llega junto con tu equipo, sin costo adicional.',
} as const;

export const GIFT_SOURCE_REGALO_DINET = 'regalo_dinet';

export interface AccesorioDelStatus {
  name: string;
  monthly_quota: number;
  image?: string | null;
  thumbnail_url?: string | null;
  is_gift?: boolean | null;
  gift_source?: string | null;
}

export interface RegaloBaldecash {
  name: string;
  /** URL de la imagen del accesorio; vacía si no hay. */
  image: string;
}

export function esRegaloDinet(acc: { gift_source?: string | null }): boolean {
  return acc.gift_source === GIFT_SOURCE_REGALO_DINET;
}

/**
 * Separa el regalo Dinet del resto de accesorios.
 *
 * Devuelve `accesorios` sin el regalo y `regalo` con el primero encontrado
 * (el sorteo da uno solo por solicitud). `accesorios` conserva `undefined`/`null`
 * cuando la entrada lo era, para no cambiar nada a quien no tiene regalo.
 */
export function separarRegaloBaldecash<T extends AccesorioDelStatus>(
  accesorios: T[] | null | undefined
): { accesorios: T[] | null | undefined; regalo: RegaloBaldecash | null } {
  if (!accesorios?.length) return { accesorios, regalo: null };
  const primero = accesorios.find(esRegaloDinet);
  if (!primero) return { accesorios, regalo: null };
  return {
    accesorios: accesorios.filter((acc) => !esRegaloDinet(acc)),
    regalo: {
      name: primero.name,
      image: primero.image || primero.thumbnail_url || '',
    },
  };
}
