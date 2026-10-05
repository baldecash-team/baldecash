'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from './pairing';

/**
 * Reloj sincronizado contra el servidor (spec §6.1 regla 2).
 *
 * Toma 5 muestras de `GET /inspections/time` y se queda con el `offsetMs` de
 * la muestra de MENOR RTT — nunca con el promedio. El detalle importa:
 * promediar mete el ruido de la muestra peor (una petición que tardó el
 * doble por congestión de red aporta la mitad de un offset contaminado a la
 * cuenta final); la de menor RTT es la que mejor aproxima el supuesto detrás
 * de la fórmula de offset estilo NTP de acá abajo — que la ida y la vuelta
 * tardaron lo mismo.
 *
 * `offsetMs` traduce un instante absoluto del servidor a uno local:
 * `local = servidor - offsetMs`. Ver el enganche real en
 * `CamaraPageContent.tsx`, que programa `grabar()` para ese instante y no
 * para "ahora".
 */
export interface UseServerClockReturn {
  offsetMs: number;
  listo: boolean;
}

const MUESTRAS = 5;

interface Muestra {
  offsetMs: number;
  rttMs: number;
}

async function tomarMuestra(): Promise<Muestra> {
  const t0 = Date.now();
  const res = await fetch(`${API_BASE_URL}/inspections/time`);
  const body = await res.json();
  const t1 = Date.now();
  const rttMs = t1 - t0;
  const serverTimeMs = body.server_time_ms as number;
  // NTP simplificado: asumiendo latencia simétrica, el servidor calculó
  // `serverTimeMs` aproximadamente a mitad de camino de la ida y vuelta —
  // por eso `t0 + rttMs / 2` y no `t0` ni `t1` a secas.
  const offsetMs = serverTimeMs - (t0 + rttMs / 2);
  return { offsetMs, rttMs };
}

export function useServerClock(): UseServerClockReturn {
  const [offsetMs, setOffsetMs] = useState(0);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const muestras: Muestra[] = [];
      for (let i = 0; i < MUESTRAS; i += 1) {
        try {
          // Secuencial a propósito, una muestra completa antes de la
          // siguiente: pedirlas en paralelo comparte congestión de red entre
          // ellas, justo el ruido que "quedarse con la de menor RTT" busca
          // evitar.
          muestras.push(await tomarMuestra());
        } catch {
          // Una muestra que falla por red simplemente no cuenta — con que
          // quede una sola muestra válida alcanza para estimar el offset.
        }
      }
      if (cancelado || muestras.length === 0) return;

      const mejor = muestras.reduce((min, actual) => (actual.rttMs < min.rttMs ? actual : min));
      setOffsetMs(mejor.offsetMs);
      setListo(true);
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return { offsetMs, listo };
}
