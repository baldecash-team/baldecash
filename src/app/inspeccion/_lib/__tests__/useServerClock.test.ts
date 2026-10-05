/**
 * `useServerClock` — reloj sincronizado contra el servidor (spec §6.1
 * regla 2, plan F3 Task 4).
 *
 * El test que importa: el offset final tiene que salir de la muestra de
 * MENOR RTT, no del promedio de las 5. Se arman 5 muestras con RTTs y
 * offsets bien distintos entre sí a propósito, así "menor RTT" y "promedio"
 * dan resultados que no se pueden confundir por casualidad.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useServerClock } from '../useServerClock';

/** Arma `server_time_ms` para que, dado `t0`/`rtt`, el offset resultante sea
 * exactamente `offset` — despejando la fórmula NTP simplificada del hook
 * (`offsetMs = serverTimeMs - (t0 + rttMs / 2)`). Evita tener que
 * precalcular a mano los `server_time_ms` de cada muestra. */
function serverTimeFor(t0: number, rttMs: number, offset: number): number {
  return t0 + rttMs / 2 + offset;
}

describe('useServerClock', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
  });

  it('el offset sale de la muestra de MENOR RTT, no del promedio de las 5', async () => {
    // RTTs bien distintos — la muestra de índice 1 (40ms) es la de menor
    // RTT y por lo tanto la que debe ganar.
    const rtts = [200, 40, 300, 500, 100];
    // Offsets bien distintos entre sí, para que "menor RTT" (9999) y
    // "promedio" (4000) sean números que no se puedan confundir.
    const offsets = [1000, 9999, 2000, 3000, 4000];
    const indiceMenorRtt = 1;

    // t0 de cada muestra: arrancan donde terminó la anterior (secuencial,
    // como hace el hook — una muestra completa antes de la siguiente).
    const t0s: number[] = [];
    let acumulado = 1_000_000;
    for (const rtt of rtts) {
      t0s.push(acumulado);
      acumulado += rtt;
    }

    // Dos llamadas a Date.now() por muestra (t0 antes del fetch, t1 después
    // del json()) — en ese orden, una tras otra, porque el hook las toma
    // secuencialmente.
    const dateNowSecuencia: number[] = [];
    rtts.forEach((rtt, i) => {
      dateNowSecuencia.push(t0s[i], t0s[i] + rtt);
    });
    const dateNowSpy = jest.spyOn(Date, 'now');
    dateNowSecuencia.forEach((valor) => dateNowSpy.mockReturnValueOnce(valor));

    let llamada = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      const i = llamada;
      llamada += 1;
      const serverTimeMs = serverTimeFor(t0s[i], rtts[i], offsets[i]);
      return Promise.resolve({
        json: async () => ({ server_time_ms: serverTimeMs }),
      });
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useServerClock());

    await waitFor(() => expect(result.current.listo).toBe(true));

    expect(global.fetch).toHaveBeenCalledTimes(5);
    expect(result.current.offsetMs).toBeCloseTo(offsets[indiceMenorRtt]);

    // Control negativo explícito: si el hook promediara en vez de tomar la
    // de menor RTT, este assert fallaría con el bug presente — confirma que
    // el test realmente distingue los dos comportamientos.
    const promedio = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    expect(result.current.offsetMs).not.toBeCloseTo(promedio);
  });

  it('arranca con listo=false y no hace nada hasta que resuelvan las muestras', () => {
    global.fetch = jest.fn().mockImplementation(
      () => new Promise(() => {}) // nunca resuelve
    ) as unknown as typeof fetch;

    const { result } = renderHook(() => useServerClock());

    expect(result.current.listo).toBe(false);
    expect(result.current.offsetMs).toBe(0);
  });

  it('si alguna muestra falla por red, sigue estimando el offset con las que sí respondieron', async () => {
    let llamada = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      llamada += 1;
      if (llamada <= 2) return Promise.reject(new Error('network error'));
      return Promise.resolve({ json: async () => ({ server_time_ms: Date.now() }) });
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useServerClock());

    await waitFor(() => expect(result.current.listo).toBe(true));
    expect(global.fetch).toHaveBeenCalledTimes(5);
  });
});
