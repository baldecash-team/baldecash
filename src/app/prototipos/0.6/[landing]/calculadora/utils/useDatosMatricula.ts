'use client';

/**
 * Lectura de los datos de matrícula guardados por el recorrido.
 *
 * Los escribe la pantalla de institución y los completa la calculadora; los
 * leen la propia calculadora y el paso académico del formulario. Vive acá y no
 * en cada pantalla porque son tres lecturas del mismo dato y la parte delicada
 * —la hidratación— no conviene repetirla.
 *
 * Se lee con `useSyncExternalStore` y no con un efecto: devuelve una instantánea
 * distinta en servidor y en cliente, así que React resuelve la hidratación sin
 * desajuste y sin renders en cascada.
 */

import { useMemo, useSyncExternalStore } from 'react';
import { getMatriculaKey, type DatosMatricula } from './entrega';

/**
 * El dato guardado no cambia mientras la página vive: lo escribió la pantalla
 * anterior. No hay a qué suscribirse, pero `useSyncExternalStore` exige la
 * función igual.
 */
const sinSuscripcion = () => () => {};

/**
 * Devuelve el crudo guardado, o `null`.
 *
 * La instantánea devuelve la cadena, no el objeto: tiene que ser
 * referencialmente estable entre llamadas o el componente entra en bucle.
 */
export function useDatosMatriculaCrudos(landing: string): string | null {
  return useSyncExternalStore(
    sinSuscripcion,
    () => {
      try {
        return localStorage.getItem(getMatriculaKey(landing));
      } catch {
        return null;
      }
    },
    () => null
  );
}

/** Los datos ya parseados, o `null` si no hay recorrido de matrícula en curso. */
export function useDatosMatricula(landing: string): DatosMatricula | null {
  const crudos = useDatosMatriculaCrudos(landing);

  return useMemo(() => {
    if (!crudos) return null;
    try {
      return JSON.parse(crudos) as DatosMatricula;
    } catch {
      // Contenido corrupto: se trata como si no hubiera recorrido, y el
      // formulario pide los datos en vez de bloquearse con basura.
      return null;
    }
  }, [crudos]);
}
