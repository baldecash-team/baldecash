/**
 * Separa una dirección guardada en los dos renglones del formulario de entrega:
 * la vía («Av. Benavides 1238») y lo que la ubica dentro de ella («Mz A Lt 5»,
 * «Dpto 301», «Km 12.5»).
 *
 * Al postular se escribe todo en un solo campo, y al corregirla la persona ve
 * los dos renglones: si todo cae en el primero, el segundo queda vacío y el
 * courier recibe la manzana mezclada con el nombre de la calle. Lo que no se
 * reconoce se deja tal cual en la vía: mejor entero en un renglón que partido
 * a medias.
 */

const COMPLEMENTOS: Array<{ etiqueta: string; patron: string }> = [
  { etiqueta: 'Mz', patron: 'manzana|mza|mz' },
  { etiqueta: 'Lt', patron: 'lote|lte|lt' },
  { etiqueta: 'Dpto', patron: 'departamento|depto|dpto|dpt' },
  { etiqueta: 'Int', patron: 'interior|int' },
  { etiqueta: 'Piso', patron: 'piso' },
  { etiqueta: 'Block', patron: 'bloque|block|blq' },
  { etiqueta: 'Km', patron: 'kil[oó]metro|km' },
];

/**
 * La palabra clave tiene que ir separada del valor (punto, espacio, dos puntos
 * o numeral) para no morder nombres: «Av. Intihuatana» no es un interior. Y el
 * valor es un número o un código corto de letras («A», «B2»): «Piso Alto» no.
 */
const PATRON = new RegExp(
  `(?<![\\p{L}\\d])(${COMPLEMENTOS.map((c) => c.patron).join('|')})`
    + '(?:\\.\\s*|\\s*[:#°º]\\s*|\\s+)'
    // «Piso de madera», «Lote la Paz»: un artículo no es un código.
    + '(?!(?:de|del|la|el|lo|los|las|y)(?![\\p{L}\\d]))'
    + '(\\d+(?:[.,]\\d+)?[a-z]?|[a-z]{1,2}\\d*)'
    + '(?![\\p{L}\\d])',
  'giu',
);

function etiquetaDe(clave: string): string {
  const k = clave.toLowerCase();
  const c = COMPLEMENTOS.find((x) => new RegExp(`^(?:${x.patron})$`, 'iu').test(k));
  return c ? c.etiqueta : clave;
}

export function separarDireccion(texto?: string | null): { via: string; complemento: string } {
  const original = (texto ?? '').trim();
  if (!original) return { via: '', complemento: '' };

  const partes: string[] = [];
  const resto = original.replace(PATRON, (_m, clave: string, valor: string) => {
    partes.push(`${etiquetaDe(clave)} ${valor.toUpperCase()}`);
    return ' ';
  });

  if (!partes.length) return { via: original, complemento: '' };

  const via = resto
    .replace(/\s*[,/-]\s*(?=[,/-]|$)/g, '') // separadores que quedaron sueltos
    .replace(/^\s*[,/-]\s*/, '')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // «Mz A Lt 5» sin nombre de vía: partirlo dejaría el renglón obligatorio
  // vacío. Se deja entero donde estaba.
  if (!/[\p{L}\d]/u.test(via)) return { via: original, complemento: '' };

  return { via, complemento: partes.join(' ') };
}
