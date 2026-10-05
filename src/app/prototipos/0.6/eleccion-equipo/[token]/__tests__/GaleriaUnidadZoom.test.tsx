/// <reference types="jest" />
/**
 * Zoom del visor de la galería (`VisorZoom` dentro de `GaleriaUnidad`).
 *
 * QUÉ SE PUEDE PROBAR ACÁ Y QUÉ NO. jsdom no tiene layout ni motor de gestos:
 * no hay pinch, no hay rueda con coordenadas reales (todo `getBoundingClientRect`
 * devuelve ceros) y `<video>` no reproduce nada. Fingir eso con eventos
 * sintéticos daría un test verde que no prueba el gesto, así que no está.
 *
 * Lo que SÍ se prueba es lo que decide si la funcionalidad sirve:
 * - que el zoom exista sin gestos (botones, operables por teclado),
 * - que acerque, aleje, tope en su máximo y vuelva al tamaño original,
 * - que **el elemento `<video>` sea el MISMO nodo antes y después de acercar**,
 *   que es la forma comprobable de "el video no se reinicia": el navegador
 *   reinicia la reproducción cuando el elemento se remonta, y acá se verifica
 *   que no se remonta,
 * - que el zoom se reinicie al cambiar de foto, de unidad y al cerrar,
 * - que nada de esto rompa la trampa de foco del diálogo.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type { EleccionUnidad } from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const unidad = (n: number): EleccionUnidad => ({
  unit_id: 100 + n,
  display_number: n,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [
    { url: `https://s3/foto-${n}-1.jpg`, label: 'Tapa' },
    { url: `https://s3/foto-${n}-2.jpg`, label: 'Teclado' },
  ],
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

/** La escala que el visor tiene aplicada ahora mismo. */
const escala = () => Number(screen.getByTestId('visor-capa').dataset.escala);

const boton = (nombre: string) => screen.getByRole('button', { name: nombre });

beforeEach(() => jest.clearAllMocks());

describe('el zoom existe sin gestos', () => {
  it('ofrece acercar, alejar y volver al tamaño original', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    const controles = screen.getByRole('group', { name: /Zoom/i });
    expect(within(controles).getByRole('button', { name: 'Acercar' })).toBeInTheDocument();
    expect(within(controles).getByRole('button', { name: 'Alejar' })).toBeInTheDocument();
    expect(
      within(controles).getByRole('button', { name: 'Ver en tamaño original' }),
    ).toBeInTheDocument();
  });

  it('arranca en tamaño original y sin desplazamiento', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(escala()).toBe(1);
    expect(screen.getByTestId('visor-capa')).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1)',
    });
  });

  it('sin fotos ni video no muestra controles: no hay nada que acercar', () => {
    render(
      <GaleriaUnidad unidad={{ ...unidad(1), photos: [], video_url: null }} {...props} />,
    );

    expect(screen.queryByRole('group', { name: /Zoom/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Todavía no subimos las fotos/)).toBeInTheDocument();
  });
});

describe('acercar y alejar', () => {
  it('acercar aumenta la escala del visor', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));

    expect(escala()).toBeGreaterThan(1);
    expect(screen.getByTestId('visor-capa').style.transform).toContain('scale(1.6)');
  });

  it('muestra a qué distancia está mirando, y lo esconde en tamaño original', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    // En 1x el indicador es ruido: no hay nada que informar.
    expect(screen.queryByText(/×$/)).not.toBeInTheDocument();

    await userEvent.click(boton('Acercar'));
    expect(screen.getByText('1.6×')).toBeInTheDocument();

    await userEvent.click(boton('Alejar'));
    expect(screen.queryByText('1.6×')).not.toBeInTheDocument();
  });

  it('alejar vuelve al tamaño original y no baja de ahí', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));
    await userEvent.click(boton('Alejar'));
    expect(escala()).toBe(1);

    // Seguir tocando "Alejar" en el piso no encoge la imagen dentro del marco.
    await userEvent.click(boton('Alejar'));
    await userEvent.click(boton('Alejar'));
    expect(escala()).toBe(1);
  });

  it('no se acerca más allá del máximo: pixelar por pixelar no muestra nada', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    for (let i = 0; i < 10; i += 1) await userEvent.click(boton('Acercar'));

    expect(escala()).toBe(4);
  });

  it('"Ver en tamaño original" vuelve de una', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));
    await userEvent.click(boton('Acercar'));
    expect(escala()).toBeGreaterThan(1);

    await userEvent.click(boton('Ver en tamaño original'));
    expect(escala()).toBe(1);
    expect(screen.getByTestId('visor-capa')).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1)',
    });
  });

  it('los controles se manejan con teclado: quien no puede hacer pinch igual acerca', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    boton('Acercar').focus();
    expect(document.activeElement).toBe(boton('Acercar'));
    await userEvent.keyboard('{Enter}');
    expect(escala()).toBeGreaterThan(1);

    boton('Ver en tamaño original').focus();
    await userEvent.keyboard(' ');
    expect(escala()).toBe(1);
  });

  it('ninguno de los tres queda deshabilitado en los extremos', async () => {
    // Deshabilitar el botón enfocado le tira el foco al body y lo saca del
    // diálogo, que es peor que un botón que en el límite no hace nada.
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(boton('Alejar')).toBeEnabled();
    for (let i = 0; i < 5; i += 1) await userEvent.click(boton('Acercar'));
    expect(boton('Acercar')).toBeEnabled();
  });
});

describe('el video no se reinicia al hacer zoom', () => {
  it('acercar no remonta el <video>: sigue siendo el mismo nodo', async () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    const antes = container.querySelector('video');
    expect(antes).not.toBeNull();

    await userEvent.click(boton('Acercar'));
    await userEvent.click(boton('Acercar'));
    await userEvent.click(boton('Alejar'));

    // Si React remontara el elemento (por una `key` que cambia, por un bloque
    // condicional o por un cambio de padre), este nodo sería otro y el
    // navegador habría reiniciado la reproducción desde cero.
    expect(container.querySelector('video')).toBe(antes);
    expect(escala()).toBeGreaterThan(1);
  });

  it('el zoom tampoco toca el src ni el silenciado del video', async () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const srcAntes = video.getAttribute('src');

    await userEvent.click(boton('Acercar'));

    expect(video.getAttribute('src')).toBe(srcAntes);
    expect(video.muted).toBe(true);
  });
});

describe('el zoom vuelve a su estado inicial', () => {
  it('al cambiar de foto', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));
    expect(escala()).toBeGreaterThan(1);

    await userEvent.click(screen.getByRole('button', { name: /Foto 2/ }));

    // Quedarse acercado sobre otra foto deja mirando un recorte que nadie pidió.
    expect(escala()).toBe(1);
  });

  it('al pasar de una foto al video', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Foto 1/ }));
    await userEvent.click(boton('Acercar'));
    expect(escala()).toBeGreaterThan(1);

    await userEvent.click(screen.getByRole('button', { name: 'Video' }));
    expect(escala()).toBe(1);
  });

  it('al cambiar de unidad, aunque la galería no se desmonte', async () => {
    const { rerender } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));
    expect(escala()).toBeGreaterThan(1);

    rerender(<GaleriaUnidad unidad={unidad(2)} {...props} />);

    expect(escala()).toBe(1);
  });

  it('al cerrar y volver a abrir la galería', async () => {
    const { unmount } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    await userEvent.click(boton('Acercar'));
    expect(escala()).toBeGreaterThan(1);

    unmount();
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(escala()).toBe(1);
  });
});

describe('no se pelea con el resto del diálogo', () => {
  it('el marco declara touch-action: none para no scrollear la página detrás', () => {
    // jsdom no aplica CSS, así que lo comprobable es que la declaración esté:
    // sin ella el pinch mueve la página en vez de acercar el equipo.
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(screen.getByTestId('visor-marco')).toHaveClass('touch-none');
  });

  it('sin medio no se declara touch-none: no hay gesto que capturar', () => {
    render(
      <GaleriaUnidad unidad={{ ...unidad(1), photos: [], video_url: null }} {...props} />,
    );

    expect(screen.getByTestId('visor-marco')).not.toHaveClass('touch-none');
  });

  it('los botones de zoom entran en la trampa de foco del diálogo', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const dialogo = screen.getByRole('dialog');

    // Están adentro del diálogo, así que el Tab los alcanza sin escaparse.
    expect(dialogo).toContainElement(boton('Acercar'));
    // Y el último enfocable sigue siendo el CTA, no un botón de zoom: los
    // controles del visor no se cuelan al final del recorrido.
    const enfocables = dialogo.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), video[controls]',
    );
    expect(enfocables[enfocables.length - 1]).toHaveTextContent(/Elegir esta unidad/);
  });

  it('acercar no dispara ningún callback de la galería', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(boton('Acercar'));
    await userEvent.click(boton('Alejar'));

    // El zoom es local al visor: no cierra, no elige, no cuenta una foto nueva
    // y no inventa un evento de analítica que el backend descartaría.
    expect(props.onCerrar).not.toHaveBeenCalled();
    expect(props.onElegir).not.toHaveBeenCalled();
    expect(props.onCambiarFoto).not.toHaveBeenCalled();
    expect(props.onReproducirVideo).not.toHaveBeenCalled();
  });
});
