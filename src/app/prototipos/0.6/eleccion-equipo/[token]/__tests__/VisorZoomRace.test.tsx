/// <reference types="jest" />
/**
 * Regresión: "el botón + a veces aleja" (reportado en vivo tras la
 * optimización de fluidez del zoom).
 *
 * MECANISMO REAL DEL BUG (confirmado disparando el repro con y sin el fix):
 * `pintar` (rueda/pinch/arrastre) escribe `actual.current` EN VIVO y pide UNA
 * sincronización de React por cuadro vía `requestAnimationFrame`. Existía
 * además un `useEffect(() => { actual.current = transformacion }, [...])`
 * pensado solo para el reset a 1x. Como ese efecto corre DESPUÉS del commit
 * (asíncrono), podía pasar esto:
 *
 *   1. gesto A → `pintar(A)`: `actual.current = A`, se agenda el cuadro #1.
 *   2. el cuadro #1 dispara `setTransformacion(A)` — el commit queda pendiente.
 *   3. ANTES de que ese commit (y su efecto) terminen, gesto B → `pintar(B)`:
 *      `actual.current = B` (más fresco), se agenda el cuadro #2.
 *   4. el commit del paso 2 termina y el efecto viejo corre con la
 *      `transformacion` de SU cierre (A) → pisa `actual.current` de B a A.
 *   5. el cuadro #2 sincroniza sobre ese `actual.current` ya pisado: el
 *      resultado final es A, no B — la imagen "retrocede".
 *
 * Un click en "+" hecho en el medio de este trámite calcula sobre el
 * `actual.current` que esté vigente en ESE instante: si el paso 4 ya pisó el
 * valor, el click multiplica sobre A en vez de B — desde afuera, "el + alejó".
 *
 * EL FIX no fue deshacer la optimización: fue sacar el ÚNICO lugar que
 * copiaba `transformacion` (estado, puede llegar atrasado) DENTRO de
 * `actual.current` (el ref, que `pintar`/`fijar` ya mantenían al día). Ahora
 * el reset a 1x escribe `actual.current` en la misma línea que el estado, sin
 * pasar por un efecto — el flujo quedó en un solo sentido: del ref hacia el
 * estado, nunca al revés.
 *
 * CÓMO SE REPRODUCE ACÁ: jsdom no tiene un reloj de fotogramas real, así que
 * se reemplaza `requestAnimationFrame` por una cola que este test controla a
 * mano, y el primer "cuadro" se dispara FUERA de `act()` a propósito — es la
 * única forma de dejar abierta, en un test, la misma ventana (commit pendiente
 * sin su efecto corrido todavía) que en un navegador real deja un cuadro real
 * entre dos gestos rápidos. (Revertir el fix hace fallar este test con el
 * valor de la rueda VIEJA en vez de la nueva — así se confirmó el mecanismo.)
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type { EleccionUnidad } from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const unidad = (n: number): EleccionUnidad => ({
  unit_id: 100 + n,
  display_number: n,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [{ url: `https://s3/foto-${n}-1.jpg`, label: 'Tapa' }],
  video_url: `https://s3/video-${n}.mp4`,
});

const props = {
  enviando: false,
  error: null,
  onCerrar: jest.fn(),
  onElegir: jest.fn(),
  onCambiarFoto: jest.fn(),
  onReproducirVideo: jest.fn(),
};

const escalaDelStyle = (el: HTMLElement) =>
  Number(el.style.transform.match(/scale\(([\d.]+)\)/)?.[1]);

/** Reemplaza `requestAnimationFrame` por una cola que el test dispara a mano. */
function mockRAF() {
  const cola: FrameRequestCallback[] = [];
  const original = global.requestAnimationFrame;
  global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cola.push(cb);
    return cola.length;
  }) as typeof requestAnimationFrame;
  return {
    cola,
    restaurar: () => { global.requestAnimationFrame = original; },
  };
}

beforeEach(() => jest.clearAllMocks());

it('un gesto que llega mientras el cuadro anterior todavía no sincronizó con React no se pierde', async () => {
  const { cola, restaurar } = mockRAF();
  try {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const marco = screen.getByTestId('visor-marco');
    const capa = screen.getByTestId('visor-capa');

    // Gesto 1 (rueda): pinta directo sobre el nodo y agenda el cuadro #1.
    fireEvent.wheel(marco, { deltaY: -100 });
    const escala1 = escalaDelStyle(capa);
    expect(escala1).toBeGreaterThan(1);
    expect(cola).toHaveLength(1);

    // Dispara el cuadro #1 FUERA de act(): dispatchSetStateInternal corre,
    // pero el commit que produce queda pendiente (no se resuelve en esta
    // misma línea) — es la ventana que en un navegador real deja un cuadro
    // real entre dos eventos de puntero consecutivos.
    cola.shift()!(0);

    // Gesto 2, sin que nada del paso anterior haya terminado de asentarse.
    fireEvent.wheel(marco, { deltaY: -100 });
    const escala2 = escalaDelStyle(capa);
    expect(escala2).toBeGreaterThan(escala1);
    expect(cola).toHaveLength(1); // el gesto 2 agendó su propio cuadro

    // Deja que el commit pendiente del cuadro #1 (y cualquier efecto que
    // dispare) termine de asentarse.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Dispara el cuadro #2 (el del gesto más reciente).
    act(() => { cola.shift()!(0); });

    // El resultado final tiene que ser el del gesto MÁS RECIENTE. Si algo
    // hubiera pisado `actual.current` con el valor del gesto viejo en el
    // medio, esto daría `escala1`, no `escala2` — que es exactamente "el +
    // aleja" reportado (acá con la rueda sola, sin necesitar el click).
    expect(Number(capa.dataset.escala)).toBeCloseTo(escala2, 2);
  } finally {
    restaurar();
  }
});

it('un click en "Acercar" justo después de esa ventana parte del gesto más reciente, no del viejo', async () => {
  const { cola, restaurar } = mockRAF();
  try {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const marco = screen.getByTestId('visor-marco');
    const capa = screen.getByTestId('visor-capa');

    fireEvent.wheel(marco, { deltaY: -100 });
    const escala1 = escalaDelStyle(capa);
    cola.shift()!(0); // fuera de act(): deja el commit pendiente

    fireEvent.wheel(marco, { deltaY: -100 }); // gesto más reciente, antes de asentar
    const escala2 = escalaDelStyle(capa);
    expect(escala2).toBeGreaterThan(escala1);

    // El click llega EN MEDIO del trámite, sin esperar a que nada se asiente
    // — el escenario exacto que describió el reporte en vivo.
    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }));

    // "Acercar" tiene que multiplicar la escala del gesto más reciente
    // (escala2), no la del viejo (escala1): si tomara la vieja, el resultado
    // sería MENOR que si tomara la nueva — ahí es donde el zoom "retrocede".
    expect(Number(capa.dataset.escala)).toBeCloseTo(escala2 * 1.6, 2);
  } finally {
    restaurar();
  }
});
