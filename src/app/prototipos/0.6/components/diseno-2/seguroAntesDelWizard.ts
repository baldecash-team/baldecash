/**
 * Seguros configurados ANTES del wizard en Flujo de Solicitud (BAL-4969,
 * casuísticas).
 *
 * En Diseño 1 se ofrecen en la intro de `/solicitar`. Diseño 2 no tiene esa
 * intro y el modal "Lo quiero" no pinta seguros, así que se perdían sin
 * aviso. En Diseño 2 la sección `insurance` de antes del wizard se trata como
 * si estuviera después: entra al Paso 4, como el resto de los seguros.
 */

interface SeccionMinima {
  type: string;
}

export function seccionesConSegurosDelPaso4<T extends SeccionMinima>(
  despues: readonly T[] | undefined,
  antes: readonly T[] | undefined,
  diseno2: boolean,
): T[] {
  const base = [...(despues ?? [])];
  if (!diseno2) return base;
  if (base.some((s) => s.type === 'insurance')) return base;
  const seguroDeAntes = (antes ?? []).find((s) => s.type === 'insurance');
  return seguroDeAntes ? [...base, seguroDeAntes] : base;
}
