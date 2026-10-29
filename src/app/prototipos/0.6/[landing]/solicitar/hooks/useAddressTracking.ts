'use client';

/**
 * useAddressTracking — eventos de la dirección (BAL-5277), Diseño 1 y 2.
 *
 * Dónde se traba la persona en el campo dirección: si Google le sugirió algo
 * y eligió (en qué posición) o escribió a mano, si tocó «Usar mi ubicación
 * actual» y qué pasó, qué hizo en el mapa y si departamento/provincia/
 * distrito se llenaron solos.
 *
 * NUNCA va la dirección, las coordenadas ni nada de la persona: solo
 * cantidades, posiciones, largos y resultados. Todos llevan `field_name` y
 * `diseno` (1|2).
 *
 * Eventos (mismos nombres en ALL_EVENT_TYPES de ws2):
 * - `address_suggestions_shown` {cantidad}: la primera vez que Google muestra
 *   la lista en cada entrada al campo, 1 s después de la última tecla (no
 *   por tecla).
 * - `address_suggestion_selected` {posicion, cantidad}: eligió una
 *   sugerencia (posición 1..n; `null` si no se pudo saber).
 * - `address_typed_manual` {largo, sugerencias_vistas}: salió del campo
 *   después de escribir sin elegir sugerencia.
 * - `address_geolocate` {resultado, origen, motivo?}: «Usar mi ubicación
 *   actual» (`origen: 'boton'`) o «Permitir ubicación»/«Intentar de nuevo»
 *   dentro del mapa (`origen: 'modal'`). `resultado`: concedido | negado |
 *   error | no_soportado; con `error`, `motivo`: sin_senal | tiempo | otro.
 * - `address_map_open` {pantalla}: se abre «Ubicación de tu domicilio»;
 *   `pantalla`: mapa (ya hay ubicación) | permiso (falló y pide permiso).
 * - `address_map_pin_move`: movió el pin (una vez por apertura).
 * - `address_map_confirm` {pin_movido}: tocó «Confirmar ubicación».
 * - `address_map_close` {confirmado}: el modal se cerró (siempre, también
 *   al confirmar, para medir abandono).
 * - `address_ubigeo_autofill` {completo, departamento, provincia, distrito,
 *   origen}: departamento/provincia/distrito llenados desde la dirección
 *   (`origen`: sugerencia | mapa). La elección a mano ya la cubre
 *   `option_selected`.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useEventTrackerOptional } from '../context/EventTrackerContext';
import type { EventType } from '../../../services/eventsApi';

export const ESPERA_SUGERENCIAS_MS = 1000;

export type ResultadoGeolocalizacion = 'concedido' | 'negado' | 'error' | 'no_soportado';
export type MotivoErrorGeolocalizacion = 'sin_senal' | 'tiempo' | 'otro';
export type OrigenGeolocalizacion = 'boton' | 'modal';
export type OrigenDireccion = 'sugerencia' | 'mapa';

/** Traduce el error del navegador al resultado del evento (sin el mensaje). */
export function resultadoDeErrorGeo(err: { code: number }): {
  resultado: ResultadoGeolocalizacion;
  motivo?: MotivoErrorGeolocalizacion;
} {
  if (err.code === 1) return { resultado: 'negado' };
  if (err.code === 2) return { resultado: 'error', motivo: 'sin_senal' };
  if (err.code === 3) return { resultado: 'error', motivo: 'tiempo' };
  return { resultado: 'error', motivo: 'otro' };
}

/** La lista de Google visible (la del campo con foco; las demás están ocultas). */
function listaVisible(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const listas = document.querySelectorAll<HTMLElement>('.pac-container');
  for (const l of Array.from(listas)) {
    if (l.style.display !== 'none' && l.querySelector('.pac-item')) return l;
  }
  return null;
}

const itemsDe = (l: HTMLElement) => Array.from(l.querySelectorAll<HTMLElement>('.pac-item'));

interface Opciones {
  fieldName: string;
  diseno: 1 | 2;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function useAddressTracking({ fieldName, diseno, inputRef }: Opciones) {
  const tracker = useEventTrackerOptional();
  const ctx = useRef({ tracker, fieldName, diseno });
  ctx.current = { tracker, fieldName, diseno };

  // Sesión = desde que entra al campo hasta que sale.
  const escribio = useRef(false);
  const sugerenciasMostradas = useRef(false);
  const ultimaCantidad = useRef(0);
  // Posición/cantidad tomadas al tocar (o Enter) un ítem de la lista; se usan
  // cuando Google avisa `place_changed`.
  const eleccion = useRef<{ posicion: number | null; cantidad: number } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const salida = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mapa: una apertura.
  const pinMovido = useRef(false);
  const mapaAbierto = useRef(false);

  const emitir = useCallback((tipo: EventType, props: Record<string, unknown> = {}) => {
    const { tracker: t, fieldName: f, diseno: d } = ctx.current;
    t?.track(tipo, { field_name: f, ...props, diseno: d }, f);
  }, []);

  const limpiar = (r: { current: ReturnType<typeof setTimeout> | null }) => {
    if (r.current) clearTimeout(r.current);
    r.current = null;
  };

  const revisarLista = useCallback(() => {
    temporizador.current = null;
    if (sugerenciasMostradas.current) return;
    if (typeof document !== 'undefined' && document.activeElement !== inputRef.current) return;
    const lista = listaVisible();
    if (!lista) return;
    const cantidad = itemsDe(lista).length;
    sugerenciasMostradas.current = true;
    ultimaCantidad.current = cantidad;
    emitir('address_suggestions_shown', { cantidad });
  }, [emitir, inputRef]);

  // Toque/clic en una sugerencia: Google la elige en `mousedown`, antes de
  // que el input pierda el foco. Se escucha en captura para ganarle.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const alTocar = (e: Event) => {
      const item = (e.target as HTMLElement | null)?.closest?.('.pac-item');
      // Solo la lista de ESTE campo: al tocarla, el foco sigue en su input.
      if (!item || document.activeElement !== inputRef.current) return;
      const lista = item.closest('.pac-container') as HTMLElement | null;
      const items = lista ? itemsDe(lista) : [];
      const i = items.indexOf(item as HTMLElement);
      eleccion.current = { posicion: i >= 0 ? i + 1 : null, cantidad: items.length };
    };
    document.addEventListener('mousedown', alTocar, true);
    document.addEventListener('touchstart', alTocar, true);
    return () => {
      document.removeEventListener('mousedown', alTocar, true);
      document.removeEventListener('touchstart', alTocar, true);
    };
  }, [inputRef]);

  useEffect(
    () => () => {
      limpiar(temporizador);
      limpiar(salida);
    },
    [],
  );

  const alEnfocar = useCallback(() => {
    limpiar(salida);
    escribio.current = false;
    sugerenciasMostradas.current = false;
    ultimaCantidad.current = 0;
  }, []);

  const alEscribir = useCallback(() => {
    escribio.current = true;
    eleccion.current = null;
    limpiar(temporizador);
    temporizador.current = setTimeout(revisarLista, ESPERA_SUGERENCIAS_MS);
  }, [revisarLista]);

  /** Enter con una sugerencia marcada con flechas. */
  const alTecla = useCallback((e: { key: string }) => {
    if (e.key !== 'Enter' && e.key !== 'Tab') return;
    const lista = listaVisible();
    if (!lista) return;
    const items = itemsDe(lista);
    const i = items.findIndex((it) => it.classList.contains('pac-item-selected'));
    if (i >= 0) eleccion.current = { posicion: i + 1, cantidad: items.length };
  }, []);

  const alSalir = useCallback(() => {
    limpiar(temporizador);
    // Al tocar una sugerencia el input pierde el foco ANTES de que Google
    // avise la elección: se espera un momento para no contarlo como «a mano».
    limpiar(salida);
    salida.current = setTimeout(() => {
      salida.current = null;
      if (!escribio.current || eleccion.current) return;
      const largo = (inputRef.current?.value ?? '').trim().length;
      if (largo === 0) return;
      escribio.current = false;
      emitir('address_typed_manual', { largo, sugerencias_vistas: sugerenciasMostradas.current });
    }, 400);
  }, [emitir, inputRef]);

  const alElegirSugerencia = useCallback(() => {
    const e = eleccion.current;
    emitir('address_suggestion_selected', {
      posicion: e?.posicion ?? null,
      cantidad: e?.cantidad ?? (ultimaCantidad.current || null),
    });
    eleccion.current = null;
    escribio.current = false;
    limpiar(salida);
  }, [emitir]);

  const alGeolocalizar = useCallback(
    (origen: OrigenGeolocalizacion, resultado: ResultadoGeolocalizacion, motivo?: MotivoErrorGeolocalizacion) => {
      emitir('address_geolocate', motivo ? { resultado, origen, motivo } : { resultado, origen });
    },
    [emitir],
  );

  const alAbrirMapa = useCallback(
    (pantalla: 'mapa' | 'permiso') => {
      pinMovido.current = false;
      mapaAbierto.current = true;
      emitir('address_map_open', { pantalla });
    },
    [emitir],
  );

  const alMoverPin = useCallback(() => {
    if (pinMovido.current) return;
    pinMovido.current = true;
    emitir('address_map_pin_move');
  }, [emitir]);

  const alCerrarMapa = useCallback(
    (confirmado: boolean) => {
      if (!mapaAbierto.current) return;
      mapaAbierto.current = false;
      if (confirmado) emitir('address_map_confirm', { pin_movido: pinMovido.current });
      emitir('address_map_close', { confirmado });
    },
    [emitir],
  );

  const alAutollenarUbigeo = useCallback(
    (origen: OrigenDireccion, llenos: { departamento: boolean; provincia: boolean; distrito: boolean }) => {
      emitir('address_ubigeo_autofill', {
        completo: llenos.departamento && llenos.provincia && llenos.distrito,
        ...llenos,
        origen,
      });
    },
    [emitir],
  );

  // Objeto estable: el campo lo usa en callbacks que, si cambian, rearman el
  // autocompletado de Google.
  return useMemo(() => ({
    alEnfocar,
    alEscribir,
    alTecla,
    alSalir,
    alElegirSugerencia,
    alGeolocalizar,
    alAbrirMapa,
    alMoverPin,
    alCerrarMapa,
    alAutollenarUbigeo,
  }), [alEnfocar, alEscribir, alTecla, alSalir, alElegirSugerencia, alGeolocalizar, alAbrirMapa, alMoverPin, alCerrarMapa, alAutollenarUbigeo]);
}
