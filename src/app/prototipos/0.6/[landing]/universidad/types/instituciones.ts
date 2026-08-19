/**
 * Instituciones ofrecidas por el producto de matrícula.
 *
 * Es una lista corta y curada, no el catálogo completo de centros de estudio
 * (que tiene decenas de miles y se consulta por autocompletado en el paso
 * académico). Acá interesan solo las del piloto y las anunciadas.
 *
 * Los identificadores son los de la tabla de centros de estudio de webservice2 y
 * son los que viajan al resto del recorrido.
 *
 * Ojo al buscar una institución por nombre en esa tabla: hay más de nueve
 * COLEGIOS llamados "César Vallejo". La universidad es la 409; los colegios son
 * de tipo escuela y no tienen nada que ver.
 */

export interface InstitucionOfrecida {
  /** Identificador en la tabla de centros de estudio. */
  id: number;
  nombre: string;
  /** `false` muestra la tarjeta en gris, sin poder seleccionarla. */
  disponible: boolean;
}

export const INSTITUCIONES: InstitucionOfrecida[] = [
  { id: 409, nombre: 'Universidad César Vallejo', disponible: true },
  { id: 551, nombre: 'Senati', disponible: false },
  { id: 418, nombre: 'UPN', disponible: false },
];

/** Las disponibles hoy, para armar el aviso sin repetir la lista a mano. */
export function nombresDisponibles(): string[] {
  return INSTITUCIONES.filter((i) => i.disponible).map((i) => i.nombre);
}

/** Las anunciadas como próximas. */
export function nombresProximos(): string[] {
  return INSTITUCIONES.filter((i) => !i.disponible).map((i) => i.nombre);
}
