'use client';

/**
 * useInstitutionSearchTracking — evento `institution_search` (BAL-5210).
 *
 * Qué busca la persona en los buscadores que consultan ws2 (institución y
 * carrera, los campos con `min_search_length`), cuántos resultados le
 * salieron y si terminó eligiendo algo. Pedido de Producto para la prueba
 * A/B Home vs Express 2.
 *
 * Cuándo se emite:
 * - cuando la persona deja de escribir `ESPERA_BUSQUEDA_MS` (si los
 *   resultados de esa consulta todavía no llegan, al llegar);
 * - al salir del campo con una búsqueda pendiente (sin esperar el segundo);
 * - al elegir una opción, con `selected_id` / `selected_label` llenos.
 * Nunca en cada tecla, ni dos veces seguidas la misma consulta.
 *
 * Propiedades: `field_name`, `query` (recortada, máx. 50 caracteres),
 * `results_count`, `selected_id`, `selected_label` (`null` sin elegir),
 * `searches_before_select` (consultas distintas en este campo hasta ahora,
 * contando la que llevó a elegir; vuelve a 0 después de elegir) y `diseno`.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

export const ESPERA_BUSQUEDA_MS = 1000;
export const MAX_LARGO_CONSULTA = 50;

const recortar = (t: string) => t.trim().slice(0, MAX_LARGO_CONSULTA);
const clave = (t: string) => recortar(t).toLowerCase();

interface Opciones {
  /** Solo los buscadores que consultan ws2; el resto no registra nada. */
  activo: boolean;
  diseno: 1 | 2;
}

export function useInstitutionSearchTracking(fieldName: string, { activo, diseno }: Opciones) {
  const tracker = useEventTrackerOptional();

  const termino = useRef('');
  const resultado = useRef<{ termino: string; cantidad: number } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pasó el segundo (o salió del campo) y falta emitir esa consulta.
  const pendiente = useRef(false);
  const ultimaEmitida = useRef<string | null>(null);
  const busquedas = useRef(0);

  // Lo que cambia entre renders, en refs: las funciones de abajo quedan
  // estables y el buscador (con su debounce) no se rearma por esto.
  const ctx = useRef({ tracker, activo, diseno, fieldName });
  ctx.current = { tracker, activo, diseno, fieldName };

  const cancelarTemporizador = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  const emitir = (props: {
    query: string | null;
    results_count: number | null;
    selected_id: string | null;
    selected_label: string | null;
  }) => {
    const { tracker: t, diseno: d, fieldName: f } = ctx.current;
    t?.track(
      'institution_search',
      { field_name: f, ...props, searches_before_select: busquedas.current, diseno: d },
      f,
    );
  };

  const cantidadDe = (consulta: string) =>
    resultado.current && clave(resultado.current.termino) === clave(consulta) ? resultado.current.cantidad : null;

  const intentarEmitir = () => {
    if (!pendiente.current) return;
    const consulta = recortar(termino.current);
    if (!consulta) {
      pendiente.current = false;
      return;
    }
    const cantidad = cantidadDe(consulta);
    if (cantidad === null) return; // los resultados de esta consulta aún no llegan
    pendiente.current = false;
    if (clave(consulta) === ultimaEmitida.current) return;
    ultimaEmitida.current = clave(consulta);
    busquedas.current += 1;
    emitir({ query: consulta, results_count: cantidad, selected_id: null, selected_label: null });
  };

  const alEscribir = useCallback((t: string) => {
    if (!ctx.current.activo) return;
    termino.current = t;
    pendiente.current = false;
    cancelarTemporizador();
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      pendiente.current = true;
      intentarEmitir();
    }, ESPERA_BUSQUEDA_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alLlegarResultados = useCallback((t: string, cantidad: number) => {
    if (!ctx.current.activo) return;
    resultado.current = { termino: t, cantidad };
    intentarEmitir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alSalir = useCallback(() => {
    if (!ctx.current.activo || !temporizador.current) return;
    cancelarTemporizador();
    pendiente.current = true;
    intentarEmitir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alElegir = useCallback((id: string, etiqueta: string | undefined) => {
    if (!ctx.current.activo) return;
    cancelarTemporizador();
    pendiente.current = false;
    const consulta = recortar(termino.current);
    // Sin búsqueda previa, el valor lo puso el sistema (no la persona).
    if (!consulta && busquedas.current === 0) return;
    if (consulta && clave(consulta) !== ultimaEmitida.current) busquedas.current += 1;
    emitir({
      query: consulta || null,
      results_count: consulta ? cantidadDe(consulta) : null,
      selected_id: id,
      selected_label: etiqueta ?? null,
    });
    termino.current = '';
    resultado.current = null;
    ultimaEmitida.current = null;
    busquedas.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelarTemporizador(), []);

  return { alEscribir, alLlegarResultados, alSalir, alElegir };
}
