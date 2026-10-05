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

/**
 * Tipo de centro de estudios.
 *
 * Son los mismos valores que el banco de preguntas usa en las opciones del
 * campo `institution_type`, y los mismos que expone el convenio de una landing.
 * Tienen que coincidir 1:1: el paso académico los compara sin traducir.
 */
export type TipoInstitucion = 'university' | 'institute' | 'school';

export interface InstitucionOfrecida {
  /** Identificador en la tabla de centros de estudio. */
  id: number;
  nombre: string;
  /** Con qué tipo queda marcado el paso académico al elegirla. */
  tipo: TipoInstitucion;
  /** `false` muestra la tarjeta en gris, sin poder seleccionarla. */
  disponible: boolean;
}

export const INSTITUCIONES: InstitucionOfrecida[] = [
  { id: 409, nombre: 'Universidad César Vallejo', tipo: 'university', disponible: true },
  { id: 551, nombre: 'Senati', tipo: 'institute', disponible: false },
  { id: 418, nombre: 'UPN', tipo: 'university', disponible: false },
];

/** Las disponibles hoy, para armar el aviso sin repetir la lista a mano. */
export function nombresDisponibles(): string[] {
  return INSTITUCIONES.filter((i) => i.disponible).map((i) => i.nombre);
}

/** Las anunciadas como próximas. */
export function nombresProximos(): string[] {
  return INSTITUCIONES.filter((i) => !i.disponible).map((i) => i.nombre);
}
