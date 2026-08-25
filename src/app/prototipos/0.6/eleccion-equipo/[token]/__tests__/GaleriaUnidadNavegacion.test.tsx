/// <reference types="jest" />
/**
 * Navegar entre unidades SIN cerrar la galería (botones de anterior/siguiente
 * y flechas de teclado).
 *
 * POR QUÉ IMPORTA: la pantalla existe para COMPARAR unidades. Obligar a
 * cerrar y reabrir en cada comparación pierde el zoom, el punto del video y
 * el hilo de lo que se estaba mirando — acá se prueba que eso no pasa: que el
 * zoom vuelve a 1x, que el video arranca limpio (nodo nuevo, `video_play`
 * vuelve a contar) y que el medio se ajusta si la unidad nueva no tiene video.
 *
 * `GaleriaUnidad` no resuelve la lista de unidades por su cuenta —eso lo hace
 * `EleccionEquipoClient`—, así que acá se la testea directo, pasándole
 * `unidadAnterior`/`unidadSiguiente` a mano y simulando la navegación real con
 * un `rerender` (que es exactamente lo que hace el padre cuando `onNavegar`
 * dispara un cambio de estado).
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

beforeEach(() => jest.clearAllMocks());

describe('botones de anterior/siguiente', () => {
  it('sin `onNavegar` no se muestran (el componente sigue sirviendo standalone)', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(screen.queryByRole('button', { name: 'Unidad siguiente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unidad anterior' })).not.toBeInTheDocument();
  });

  it('siguiente llama a onNavegar con la unidad siguiente; anterior, con la anterior', async () => {
    const onNavegar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(2)}
        unidadAnterior={unidad(1)}
        unidadSiguiente={unidad(3)}
        onNavegar={onNavegar}
        {...props}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Unidad siguiente' }));
    expect(onNavegar).toHaveBeenCalledWith(unidad(3));

    await userEvent.click(screen.getByRole('button', { name: 'Unidad anterior' }));
    expect(onNavegar).toHaveBeenCalledWith(unidad(1));
  });

  it('en el extremo el botón queda aria-disabled, sigue en el DOM y no navega al click', async () => {
    const onNavegar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadAnterior={null}
        unidadSiguiente={unidad(2)}
        onNavegar={onNavegar}
        {...props}
      />,
    );

    const anterior = screen.getByRole('button', { name: 'Unidad anterior' });
    expect(anterior).toHaveAttribute('aria-disabled', 'true');
    // NUNCA `disabled` de verdad: si tuviera el foco, deshabilitarlo lo
    // tiraría fuera de la trampa de foco del diálogo (mismo motivo que los
    // botones de zoom de `VisorZoom`).
    expect(anterior).toBeEnabled();

    await userEvent.click(anterior);
    expect(onNavegar).not.toHaveBeenCalled();
  });
});

describe('flechas de teclado', () => {
  it('ArrowRight va a la siguiente, ArrowLeft a la anterior', async () => {
    const onNavegar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(2)}
        unidadAnterior={unidad(1)}
        unidadSiguiente={unidad(3)}
        onNavegar={onNavegar}
        {...props}
      />,
    );

    await userEvent.keyboard('{ArrowRight}');
    expect(onNavegar).toHaveBeenCalledWith(unidad(3));

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavegar).toHaveBeenCalledWith(unidad(1));
  });

  it('en el extremo, la flecha correspondiente no navega', async () => {
    const onNavegar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadAnterior={null}
        unidadSiguiente={unidad(2)}
        onNavegar={onNavegar}
        {...props}
      />,
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavegar).not.toHaveBeenCalled();
  });

  it('con el foco en la barra de progreso del video, ArrowRight NO navega: la usa el slider', async () => {
    const onNavegar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(2)}
        unidadAnterior={unidad(1)}
        unidadSiguiente={unidad(3)}
        onNavegar={onNavegar}
        {...props}
      />,
    );

    screen.getByRole('slider', { name: 'Progreso del video' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onNavegar).not.toHaveBeenCalled();
  });

  it('Escape sigue cerrando la galería aunque se agregaron las flechas de navegación', async () => {
    const onCerrar = jest.fn();
    render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadSiguiente={unidad(2)}
        onNavegar={jest.fn()}
        {...props}
        onCerrar={onCerrar}
      />,
    );

    await userEvent.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalled();
  });
});

describe('efectos de navegar (el padre re-renderiza con otra unidad)', () => {
  it('el zoom vuelve a 1x', async () => {
    const { rerender } = render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadSiguiente={unidad(2)}
        onNavegar={jest.fn()}
        {...props}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(Number(screen.getByTestId('visor-capa').dataset.escala)).toBeGreaterThan(1);

    rerender(
      <GaleriaUnidad
        unidad={unidad(2)}
        unidadAnterior={unidad(1)}
        onNavegar={jest.fn()}
        {...props}
      />,
    );

    expect(Number(screen.getByTestId('visor-capa').dataset.escala)).toBe(1);
  });

  it('el video se remonta (nodo nuevo) y video_play vuelve a contar para la unidad nueva', () => {
    const onReproducirVideo = jest.fn();
    const { container, rerender } = render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadSiguiente={unidad(2)}
        onNavegar={jest.fn()}
        {...props}
        onReproducirVideo={onReproducirVideo}
      />,
    );

    const videoAntes = container.querySelector('video') as HTMLVideoElement;
    fireEvent.play(videoAntes);
    expect(onReproducirVideo).toHaveBeenCalledTimes(1);

    rerender(
      <GaleriaUnidad
        unidad={unidad(2)}
        unidadAnterior={unidad(1)}
        onNavegar={jest.fn()}
        {...props}
        onReproducirVideo={onReproducirVideo}
      />,
    );

    const videoDespues = container.querySelector('video') as HTMLVideoElement;
    // Nodo DISTINTO a propósito: el video de la unidad nueva tiene que
    // arrancar limpio, no seguir reproduciendo el de la anterior.
    expect(videoDespues).not.toBe(videoAntes);

    fireEvent.play(videoDespues);
    expect(onReproducirVideo).toHaveBeenCalledTimes(2);
  });

  it('si la unidad nueva no tiene video, el visor pasa a su primera foto', () => {
    const sinVideo = { ...unidad(2), video_url: null };
    const { rerender } = render(
      <GaleriaUnidad
        unidad={unidad(1)}
        unidadSiguiente={sinVideo}
        onNavegar={jest.fn()}
        {...props}
      />,
    );

    rerender(
      <GaleriaUnidad
        unidad={sinVideo}
        unidadAnterior={unidad(1)}
        onNavegar={jest.fn()}
        {...props}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Reproducir video' })).not.toBeInTheDocument();
    // El alt de la foto GRANDE es "<título> — <rótulo genérico>" (distinto al
    // de la miniatura, que es solo el rótulo): se pide por ese texto completo
    // para no confundirla con el thumbnail de la tira, que también matchea
    // /Foto 1/.
    expect(screen.getByAltText('Unidad 02 — Foto 1')).toBeInTheDocument();
  });
});
