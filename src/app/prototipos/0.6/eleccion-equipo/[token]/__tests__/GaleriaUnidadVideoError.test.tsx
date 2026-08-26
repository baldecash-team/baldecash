/// <reference types="jest" />
/**
 * Fallo de reproducción del video (Sentry BALDECASH3-57).
 *
 * `HTMLMediaElement.play()` devuelve una promesa que se puede rechazar por
 * varios motivos normales — fuente no soportada, política de autoplay, la
 * persona navegó antes de que cargara — y hasta este fix ninguno se
 * manejaba: el rechazo escapaba como una promesa no capturada y, del lado
 * de la persona, apretar play no hacía absolutamente nada.
 *
 * Acá se prueban las dos mitades del arreglo:
 * 1. El rechazo de `play()` NO escapa como no capturado y termina en un
 *    mensaje visible — salvo que sea un `AbortError`, que es una
 *    interrupción benigna (cambiar de unidad, cerrar la galería, pausar
 *    antes de que resuelva) y no se reporta.
 * 2. El evento `error` nativo del `<video>` (una fuente inválida puede
 *    fallar sin que nadie haya tocado play) también deja el mismo mensaje.
 *
 * jsdom no reproduce video de verdad, así que `play()` se stubea (mismo
 * patrón que `DniSelfieStep.tips.test.tsx` y `CamaraPageContent.test.tsx`).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

let playMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  playMock = jest.fn();
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: playMock,
  });
});

describe('play() rechaza por un motivo real (no un AbortError)', () => {
  it('muestra el mensaje humano y el rechazo NO escapa como una promesa no capturada', async () => {
    playMock.mockRejectedValue(new DOMException('no soportado', 'NotSupportedError'));

    const noCapturadas: unknown[] = [];
    const alRechazoNoCapturado = (reason: unknown) => noCapturadas.push(reason);
    process.on('unhandledRejection', alRechazoNoCapturado);

    try {
      render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

      await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }));

      const mensaje = await screen.findByText(/no se puede reproducir en tu dispositivo/i);
      expect(mensaje).toBeInTheDocument();
      // El "fotos" va en un `<b>` aparte: se compara el texto completo del
      // párrafo, no un `getByText` (que no cruza nodos).
      expect(mensaje.textContent).toMatch(/revisar las fotos de esta unidad/i);

      // Deja que cualquier rechazo pendiente se propague antes de revisar.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(noCapturadas).toHaveLength(0);
    } finally {
      process.off('unhandledRejection', alRechazoNoCapturado);
    }
  });
});

describe('play() rechaza con AbortError: interrupción benigna', () => {
  it('NO muestra ningún mensaje de error', async () => {
    playMock.mockRejectedValue(new DOMException('interrumpido', 'AbortError'));

    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }));

    // Deja que la promesa rechazada se resuelva antes de comprobar que nada
    // apareció.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(
      screen.queryByText(/no se puede reproducir en tu dispositivo/i),
    ).not.toBeInTheDocument();
  });
});

describe('evento `error` nativo del `<video>`, sin que nadie haya tocado play', () => {
  it('también muestra el mensaje humano', async () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);

    expect(
      await screen.findByText(/no se puede reproducir en tu dispositivo/i),
    ).toBeInTheDocument();
  });

  it('el video sigue siendo el MISMO nodo del DOM (no se remontó)', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);

    expect(container.querySelector('video')).toBe(video);
  });
});

describe('el mensaje desaparece si el video termina reproduciendo', () => {
  it('un `play` posterior limpia el error mostrado', async () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);
    expect(
      await screen.findByText(/no se puede reproducir en tu dispositivo/i),
    ).toBeInTheDocument();

    fireEvent.play(video);

    expect(
      screen.queryByText(/no se puede reproducir en tu dispositivo/i),
    ).not.toBeInTheDocument();
  });
});
